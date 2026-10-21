"""Container routes with NPM proxy hosts, using the SQLite adapter and a fake NPM API."""

import importlib
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from test_sessions import Pool  # noqa: E402


class FakeResponse:
    def __init__(self, status_code, data):
        self.status_code = status_code
        self.data = data

    def json(self):
        return self.data


class FakeNpm:
    """In-memory NPM proxy-hosts and certificates API."""

    def __init__(self, hosts, certificates=()):
        self.hosts = {host["id"]: host for host in hosts}
        self.certificates = list(certificates)
        self.created = []
        self.down = False

    def __call__(self, method, url, **kwargs):
        if self.down:
            raise ConnectionError("NPM down")
        path = url.split("/api", 1)[1]
        if method == "GET" and path == "/nginx/proxy-hosts":
            return FakeResponse(200, list(self.hosts.values()))
        if method == "GET" and path == "/nginx/certificates":
            return FakeResponse(200, self.certificates)
        if method == "POST" and path == "/nginx/proxy-hosts":
            host = dict(kwargs["json"], id=max(self.hosts, default=0) + 1, enabled=1)
            self.hosts[host["id"]] = host
            self.created.append(host)
            return FakeResponse(201, host)
        host_id = int(path.rsplit("/", 1)[1])
        if host_id not in self.hosts:
            return FakeResponse(404, {"error": {"message": "Not Found"}})
        if method == "GET":
            return FakeResponse(200, self.hosts[host_id])
        if method == "PUT":
            self.hosts[host_id].update(kwargs["json"])
            return FakeResponse(200, self.hosts[host_id])
        if method == "DELETE":
            del self.hosts[host_id]
            return FakeResponse(200, True)
        raise AssertionError(f"Unexpected NPM call {method} {path}")


class ContainerProxyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory()
        cls.pool = Pool(str(Path(cls.directory.name) / "containers.db"))
        # Import a private copy of the app bound to this test database.
        sys.modules.pop("app", None)
        with patch.dict(os.environ, {
            "JWT_SECRET_KEY": "test-session-secret-at-least-32-characters",
            "SECRET_KEY": "test-secret", "RATELIMIT_STORAGE_URI": "memory://",
        }), patch("dotenv.load_dotenv"), patch("dbutils.pooled_db.PooledDB", return_value=cls.pool):
            cls.module = importlib.import_module("app")
        sys.modules.pop("app", None)
        cls.module.app.config.update(TESTING=True, BCRYPT_LOG_ROUNDS=4)
        cls.module.limiter.enabled = False
        conn = cls.pool.connection()
        conn.connection.executescript("""
            CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, email TEXT,
                password TEXT, role TEXT, status TEXT, db INTEGER DEFAULT 0,
                req_db INTEGER DEFAULT 0, max_containers INTEGER DEFAULT 5,
                container INTEGER DEFAULT 0);
            CREATE TABLE containers (id INTEGER PRIMARY KEY, user_id INTEGER, owner TEXT,
                npm_id INTEGER, container_name TEXT, status TEXT, port_internal TEXT,
                domain TEXT, project_path TEXT, type TEXT, publish INTEGER,
                forward_scheme TEXT DEFAULT 'http', updated_at TEXT);
        """)
        conn.commit()
        conn.close()

    @classmethod
    def tearDownClass(cls):
        cls.directory.cleanup()

    def setUp(self):
        self.client = self.module.app.test_client()
        self.module.PROXY_CACHE.update(hosts=None, expires=0)
        conn = self.pool.connection()
        with conn.cursor() as cursor:
            for table in ("sessions", "users", "containers"):
                cursor.execute(f"DELETE FROM {table}")
            password = self.module.bcrypt.generate_password_hash("Password123").decode()
            for user_id, username, role in [(1, "admin", "admin"), (2, "alice", "user"), (3, "bob", "user")]:
                cursor.execute(
                    "INSERT INTO users (id, username, email, password, role) VALUES (%s, %s, %s, %s, %s)",
                    (user_id, username, username + "@example.test", password, role),
                )
            for owner, npm_id, name, domain in [
                ("alice", 10, "alice_web_web", "web.addp.site"),
                ("alice", None, "alice_web_redis", ""),
                ("bob", 20, "bob_api_api", "api.addp.site"),
            ]:
                cursor.execute(
                    "INSERT INTO containers (owner, npm_id, container_name, status, port_internal, domain, project_path, type, publish) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                    (owner, npm_id, name, "running", "3000", domain, "/srv/" + owner, "node", 1),
                )
        conn.commit()
        conn.close()
        self.npm = FakeNpm([
            {"id": 10, "domain_names": ["web.addp.site"], "forward_scheme": "http", "forward_host": "alice_web_web", "forward_port": 3000, "enabled": 1, "certificate_id": 1},
            {"id": 11, "domain_names": ["web.adocs.site"], "forward_scheme": "http", "forward_host": "alice_web_web", "forward_port": 3000, "enabled": 1, "certificate_id": 2},
            {"id": 12, "domain_names": ["old.adocs.site"], "forward_scheme": "http", "forward_host": "alice_web_web", "forward_port": 3000, "enabled": 0, "certificate_id": 0},
            {"id": 20, "domain_names": ["api.addp.site"], "forward_scheme": "http", "forward_host": "bob_api_api", "forward_port": 8000, "enabled": 1, "certificate_id": 1},
        ], certificates=[{"id": 2, "domain_names": ["*.adocs.site", "adocs.site"]}])
        patches = [
            patch.object(self.module, "get_npm_token", return_value="npm-token"),
            patch.object(self.module.requests, "request", side_effect=self.npm),
            patch.object(self.module.requests, "get", side_effect=lambda url, **kwargs: self.npm("GET", url, **kwargs)),
            patch.object(self.module.requests, "put", side_effect=lambda url, **kwargs: self.npm("PUT", url, **kwargs)),
            patch.dict(os.environ, {"NPM_PUBLIC_CERT_ID": ""}),
            patch.object(self.module, "MAX_DOMAINS_PER_CONTAINER", 5),
        ]
        for item in patches:
            item.start()
            self.addCleanup(item.stop)

    def login(self, username):
        response = self.client.post("/api/auth/login", json={"username": username, "password": "Password123"})
        self.assertEqual(response.status_code, 200, response.json)
        return {"Authorization": "Bearer " + response.json["token"]}

    def test_admin_sees_every_container_with_its_forwards(self):
        response = self.client.get("/api/containers", headers=self.login("admin"))
        self.assertEqual(response.status_code, 200)
        by_name = {record["container_name"]: record for record in response.json}
        self.assertEqual(set(by_name), {"alice_web_web", "alice_web_redis", "bob_api_api"})
        web = by_name["alice_web_web"]
        self.assertTrue(web["proxies_synced"])
        self.assertEqual([proxy["id"] for proxy in web["proxies"]], [10, 12, 11])
        self.assertTrue(web["proxies"][0]["primary"])
        self.assertEqual(web["proxies"][2]["domain_names"], ["web.adocs.site"])
        self.assertEqual(by_name["alice_web_redis"]["proxies"], [])

    def test_user_sees_only_own_containers(self):
        response = self.client.get("/api/containers", headers=self.login("alice"))
        self.assertEqual({record["owner"] for record in response.json}, {"alice"})

    def test_unreachable_npm_falls_back_to_deploy_domain(self):
        self.npm.down = True
        response = self.client.get("/api/containers", headers=self.login("admin"))
        web = next(record for record in response.json if record["container_name"] == "alice_web_web")
        self.assertFalse(web["proxies_synced"])
        self.assertEqual([proxy["domain_names"] for proxy in web["proxies"]], [["web.addp.site"]])

    def test_public_list_exposes_only_enabled_domains(self):
        response = self.client.get("/api/containers/active")
        self.assertEqual(response.status_code, 200)
        by_name = {record["container_name"]: record for record in response.json}
        self.assertEqual(by_name["alice_web_web"]["domains"], ["web.addp.site", "web.adocs.site"])
        self.assertEqual(by_name["alice_web_redis"]["domains"], [])
        self.assertNotIn("proxies", by_name["alice_web_web"])

    def test_admin_adds_public_proxy_with_wildcard_certificate(self):
        response = self.client.post("/api/containers/alice_web_redis/proxies", headers=self.login("admin"),
                                    json={"subdomain": "Cache", "port": "6379", "protocol": "http"})
        self.assertEqual(response.status_code, 201, response.json)
        created = self.npm.created[0]
        self.assertEqual(created["domain_names"], ["cache.adocs.site"])
        self.assertEqual((created["forward_host"], created["forward_port"]), ("alice_web_redis", 6379))
        self.assertEqual(created["certificate_id"], 2)
        self.assertTrue(created["ssl_forced"])

    def test_add_proxy_rejects_users_invalid_names_and_duplicates(self):
        body = {"subdomain": "shop", "port": "3000", "protocol": "http"}
        self.assertEqual(self.client.post("/api/containers/alice_web_web/proxies", headers=self.login("alice"), json=body).status_code, 403)
        admin = self.login("admin")
        for subdomain in ["-bad", "a.b", "a_b", ""]:
            response = self.client.post("/api/containers/alice_web_web/proxies", headers=admin, json=dict(body, subdomain=subdomain))
            self.assertEqual(response.status_code, 400, subdomain)
        self.assertEqual(self.client.post("/api/containers/alice_web_web/proxies", headers=admin, json=dict(body, subdomain="web")).status_code, 409)
        self.assertEqual(self.client.post("/api/containers/missing/proxies", headers=admin, json=body).status_code, 404)
        self.assertEqual(self.npm.created, [])

    def test_subdomain_only_joins_the_deploy_proxy_host(self):
        admin = self.login("admin")
        response = self.client.post("/api/containers/alice_web_web/proxies", headers=admin, json={"subdomain": "blog"})
        self.assertEqual(response.status_code, 201, response.json)
        self.assertEqual(self.npm.hosts[10]["domain_names"], ["web.addp.site", "blog.adocs.site"])
        self.assertEqual(self.npm.created, [])
        # A container without a deploy proxy host cannot take a domain this way.
        response = self.client.post("/api/containers/alice_web_redis/proxies", headers=admin, json={"subdomain": "cache"})
        self.assertEqual(response.status_code, 400)

    def test_domain_limit_counts_lan_and_public_domains(self):
        self.module.MAX_DOMAINS_PER_CONTAINER = 3
        admin = self.login("admin")
        listed = self.client.get("/api/containers", headers=admin).json
        self.assertEqual(listed[0]["max_domains"], 3)
        # alice_web_web already forwards web.addp.site, web.adocs.site and old.adocs.site.
        response = self.client.post("/api/containers/alice_web_web/proxies", headers=admin, json={"subdomain": "more"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("3/3", response.json["error"])
        self.assertEqual(self.npm.hosts[10]["domain_names"], ["web.addp.site"])

    def test_admin_adds_domain_to_existing_deploy_proxy_host(self):
        admin = self.login("admin")
        response = self.client.post("/api/containers/alice_web_web/proxies", headers=admin, json={"subdomain": "shop", "proxyId": 10})
        self.assertEqual(response.status_code, 201, response.json)
        self.assertEqual(self.npm.hosts[10]["domain_names"], ["web.addp.site", "shop.adocs.site"])
        self.assertEqual(self.npm.created, [])
        # Another container's proxy host cannot be targeted.
        response = self.client.post("/api/containers/alice_web_web/proxies", headers=admin, json={"subdomain": "other", "proxyId": 20})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(self.npm.hosts[20]["domain_names"], ["api.addp.site"])

    def test_admin_removes_lan_or_public_domain_but_keeps_one(self):
        admin = self.login("admin")
        self.client.post("/api/containers/alice_web_web/proxies", headers=admin, json={"subdomain": "shop", "proxyId": 10})
        base = "/api/containers/alice_web_web/proxies/"
        self.assertEqual(self.client.delete(base + "20/domains/api.addp.site", headers=admin).status_code, 404)
        self.assertEqual(self.client.delete(base + "11/domains/web.adocs.site", headers=self.login("alice")).status_code, 403)
        self.assertEqual(self.client.delete(base + "10/domains/web.addp.site", headers=admin).status_code, 200)
        self.assertEqual(self.npm.hosts[10]["domain_names"], ["shop.adocs.site"])
        self.assertEqual(self.client.delete(base + "10/domains/shop.adocs.site", headers=admin).status_code, 400)
        self.assertEqual(self.npm.hosts[10]["domain_names"], ["shop.adocs.site"])
        # A port change must not bring the removed LAN domain back.
        body = {"port": 4000, "containerName": "alice_web_web", "protocol": "http", "publish": True}
        self.assertEqual(self.client.patch("/api/containers/alice_web_web", headers=admin, json=body).status_code, 201)
        self.assertEqual(self.npm.hosts[10]["domain_names"], ["shop.adocs.site"])
        # Removing the last domain of an added proxy host deletes the host.
        self.assertEqual(self.client.delete(base + "11/domains/web.adocs.site", headers=admin).status_code, 200)
        self.assertNotIn(11, self.npm.hosts)

    def test_port_update_keeps_domains_added_to_deploy_proxy_host(self):
        admin = self.login("admin")
        self.client.post("/api/containers/alice_web_web/proxies", headers=admin, json={"subdomain": "shop", "proxyId": 10})
        body = {"port": 4000, "containerName": "alice_web_web", "protocol": "http", "publish": True}
        response = self.client.patch("/api/containers/alice_web_web", headers=admin, json=body)
        self.assertEqual(response.status_code, 201, response.json)
        self.assertEqual(self.npm.hosts[10]["forward_port"], 4000)
        self.assertEqual(self.npm.hosts[10]["domain_names"], ["web.addp.site", "shop.adocs.site"])

    def test_users_cannot_update_other_users_containers(self):
        body = {"port": 3000, "containerName": "alice_web_redis", "protocol": "http", "publish": False}
        response = self.client.patch("/api/containers/alice_web_redis", headers=self.login("bob"), json=body)
        self.assertEqual(response.status_code, 404)
        response = self.client.patch("/api/containers/alice_web_redis", headers=self.login("admin"), json=body)
        self.assertEqual(response.status_code, 201, response.json)
        conn = self.pool.connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT publish FROM containers WHERE container_name = %s", ("alice_web_redis",))
            self.assertEqual(cursor.fetchone()["publish"], 0)
        conn.close()


if __name__ == "__main__":
    unittest.main()
