"""Exercise the real Flask auth routes with an isolated SQLite SQL adapter.

The adapter translates MySQL placeholders/schema for local tests. Production
InnoDB locking and DDL still need validation against the Docker database.
"""

import importlib
import os
import sqlite3
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

sqlite3.register_adapter(datetime, lambda value: value.isoformat(" "))
sqlite3.register_converter("DATETIME", lambda value: datetime.fromisoformat(value.decode()))

SQLITE_SESSIONS = """
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, user_id INTEGER, kind TEXT, token_hash TEXT UNIQUE,
    otp_hash TEXT, otp_attempts INTEGER NOT NULL DEFAULT 0,
    ip_address TEXT, user_agent TEXT, browser TEXT, device TEXT, os TEXT,
    created_at DATETIME, last_seen_at DATETIME, expires_at DATETIME,
    revoked_at DATETIME, revoked_by INTEGER
)
"""


class Cursor:
    def __init__(self, connection):
        self.cursor = connection.cursor()

    def execute(self, query, params=()):
        if query.startswith("CREATE TABLE IF NOT EXISTS sessions"):
            query = SQLITE_SESSIONS
        return self.cursor.execute(query.replace("%s", "?").replace(" FOR UPDATE", ""), params)

    def fetchone(self):
        row = self.cursor.fetchone()
        return dict(row) if row else None

    def fetchall(self):
        return [dict(row) for row in self.cursor.fetchall()]

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        self.cursor.close()


class Connection:
    def __init__(self, path):
        self.connection = sqlite3.connect(path, detect_types=sqlite3.PARSE_DECLTYPES)
        self.connection.row_factory = sqlite3.Row

    def cursor(self):
        return Cursor(self.connection)

    def commit(self):
        self.connection.commit()

    def rollback(self):
        self.connection.rollback()

    def close(self):
        self.connection.close()


class Pool:
    def __init__(self, path):
        self.path = path

    def connection(self):
        return Connection(self.path)


class SessionIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory()
        cls.pool = Pool(str(Path(cls.directory.name) / "sessions.db"))
        with patch.dict(os.environ, {
            "JWT_SECRET_KEY": "test-session-secret-at-least-32-characters",
            "SECRET_KEY": "test-secret", "RATELIMIT_STORAGE_URI": "memory://",
        }), patch("dotenv.load_dotenv"), patch("dbutils.pooled_db.PooledDB", return_value=cls.pool):
            cls.module = importlib.import_module("app")
        cls.module.app.config.update(TESTING=True, BCRYPT_LOG_ROUNDS=4)
        cls.module.limiter.enabled = False
        conn = cls.pool.connection()
        conn.connection.executescript("""
            CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, email TEXT,
                password TEXT, role TEXT, status TEXT, db INTEGER DEFAULT 0,
                req_db INTEGER DEFAULT 0, max_containers INTEGER DEFAULT 5,
                container INTEGER DEFAULT 0);
            CREATE TABLE containers (owner TEXT);
        """)
        conn.commit()
        conn.close()

    @classmethod
    def tearDownClass(cls):
        cls.directory.cleanup()

    def setUp(self):
        self.client = self.module.app.test_client()
        conn = self.pool.connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM sessions")
            cursor.execute("DELETE FROM users")
            password = self.module.bcrypt.generate_password_hash("Password123").decode()
            for user_id, username, role in [(1, "admin", "admin"), (2, "alice", "user")]:
                cursor.execute(
                    "INSERT INTO users (id, username, email, password, role) VALUES (%s, %s, %s, %s, %s)",
                    (user_id, username, username + "@example.test", password, role),
                )
        conn.commit()
        conn.close()

    def sql(self, query, params=()):
        conn = self.pool.connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                result = cursor.fetchall()
            conn.commit()
            return result
        finally:
            conn.close()

    def login(self, username="alice", agent=None, address="203.0.113.10", password="Password123"):
        response = self.client.post("/api/auth/login", json={"username": username, "password": password}, headers={
            "User-Agent": agent or "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36",
            "X-Forwarded-For": address,
        })
        self.assertEqual(response.status_code, 200, response.json)
        return response.json["token"]

    def auth(self, token):
        return {"Authorization": "Bearer " + token}

    def decode(self, token):
        with self.module.app.app_context():
            return self.module.decode_token(token)

    def forgot(self, username="alice", code=123456):
        with patch.object(self.module.mail, "send") as send, patch.object(self.module.secrets, "randbelow", return_value=code):
            response = self.client.post("/api/auth/forgot", json={"username": username})
            self.assertEqual(response.status_code, 200, response.json)
            self.assertIn(f"{code:06d}", send.call_args.args[0].html)
        return response.json["token"]

    def reset(self, token, code="123456"):
        return self.client.patch("/api/auth/reset", headers=self.auth(token), json={"otpValue": code, "password": "NewPassword123"})

    def test_multiple_devices_and_admin_listing_never_expose_secrets(self):
        first = self.login()
        second = self.login(agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15E148 Safari/604.1", address="2001:db8::7")
        admin = self.login("admin")
        records = self.client.get("/api/sessions", headers=self.auth(admin))
        self.assertEqual(records.status_code, 200)
        alice = [record for record in records.json if record["username"] == "alice"]
        self.assertEqual(len(alice), 2)
        self.assertEqual({record["ip_address"] for record in alice}, {"203.0.113.10", "2001:db8::7"})
        self.assertEqual({record["device"] for record in alice}, {"Desktop", "iPhone / Mobile"})
        self.assertTrue(any(record["is_current"] for record in records.json))
        for record in records.json:
            self.assertNotIn("token_hash", record)
            self.assertNotIn("otp_hash", record)
            self.assertTrue(record["expires_at"].endswith("Z"))
        self.assertNotEqual(self.decode(first)["sid"], self.decode(second)["sid"])

    def test_admin_revokes_only_the_selected_device(self):
        first, second, admin = self.login(), self.login(), self.login("admin")
        session_id = self.decode(first)["sid"]
        response = self.client.delete("/api/sessions/" + session_id, headers=self.auth(admin))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get("/api/containers", headers=self.auth(first)).status_code, 401)
        self.assertEqual(self.client.get("/api/containers", headers=self.auth(second)).status_code, 200)
        self.assertEqual(self.sql("SELECT id FROM sessions WHERE id = %s", (session_id,)), [])
        self.assertEqual(self.client.delete("/api/sessions/" + session_id, headers=self.auth(admin)).status_code, 404)

    def test_user_cannot_view_or_revoke_sessions(self):
        user = self.login()
        self.assertEqual(self.client.get("/api/sessions", headers=self.auth(user)).status_code, 403)
        self.assertEqual(self.client.delete("/api/sessions/" + self.decode(user)["sid"], headers=self.auth(user)).status_code, 403)

    def test_logout_deletes_only_the_current_device_without_history(self):
        token = self.login()
        other = self.login()
        recovery = self.forgot()
        self.assertEqual(self.client.delete("/api/auth/logout", headers=self.auth(token)).status_code, 200)
        self.assertEqual(self.client.get("/api/auth/session", headers=self.auth(token)).status_code, 401)
        self.assertEqual(self.sql("SELECT id FROM sessions WHERE id = %s", (self.decode(token)["sid"],)), [])
        self.assertEqual(self.client.get("/api/auth/session", headers=self.auth(other)).status_code, 200)
        self.assertEqual(self.client.get("/api/auth/otp-session", headers=self.auth(recovery)).status_code, 200)

    def test_expired_unknown_and_deleted_account_tokens_fail_closed(self):
        token = self.login()
        self.sql("UPDATE sessions SET expires_at = %s", (datetime(2000, 1, 1),))
        self.assertEqual(self.client.get("/api/containers", headers=self.auth(token)).status_code, 401)
        fresh = self.login()
        self.sql("DELETE FROM sessions WHERE id = %s", (self.decode(fresh)["sid"],))
        self.assertEqual(self.client.get("/api/containers", headers=self.auth(fresh)).status_code, 401)
        latest = self.login()
        self.sql("DELETE FROM users WHERE id = 2")
        self.assertEqual(self.client.get("/api/containers", headers=self.auth(latest)).status_code, 401)

    def test_last_activity_updates_without_extending_expiry(self):
        token = self.login()
        before = self.sql("SELECT expires_at FROM sessions")[0]["expires_at"]
        self.sql("UPDATE sessions SET last_seen_at = %s", (datetime(2000, 1, 1),))
        self.assertEqual(self.client.get("/api/auth/session", headers=self.auth(token)).status_code, 200)
        record = self.sql("SELECT last_seen_at, expires_at FROM sessions")[0]
        self.assertGreater(record["last_seen_at"], datetime.now() - timedelta(days=1))
        self.assertEqual(record["expires_at"], before)

    def test_otp_is_hashed_and_recovery_token_cannot_authorize_apis(self):
        token = self.forgot("admin")
        payload = self.decode(token)
        self.assertNotIn("otp", payload)
        self.assertNotIn("role", payload)
        record = self.sql("SELECT * FROM sessions WHERE kind = 'otp'")[0]
        self.assertTrue(self.module.bcrypt.check_password_hash(record["otp_hash"], "123456"))
        self.assertNotIn("123456", record["otp_hash"])
        self.assertEqual(payload["exp"] - payload["iat"], 300)
        self.assertEqual(self.client.get("/api/sessions", headers=self.auth(token)).status_code, 401)
        self.assertEqual(self.client.get("/api/containers", headers=self.auth(token)).status_code, 401)
        self.assertEqual(self.client.get("/api/auth/otp-session", headers=self.auth(token)).status_code, 200)

    def test_otp_is_single_use_and_password_reset_revokes_logins(self):
        login = self.login()
        token = self.forgot()
        self.assertEqual(self.reset(token).status_code, 200)
        self.assertEqual(self.reset(token).status_code, 401)
        self.assertEqual(self.client.get("/api/containers", headers=self.auth(login)).status_code, 401)
        self.assertEqual(self.sql("SELECT id FROM sessions WHERE kind = 'login'"), [])
        challenge = self.sql("SELECT otp_hash, revoked_at FROM sessions WHERE kind = 'otp'")[0]
        self.assertIsNone(challenge["otp_hash"])
        self.assertIsNotNone(challenge["revoked_at"])
        self.login(password="NewPassword123")

    def test_five_incorrect_otps_lock_the_challenge(self):
        token = self.forgot()
        for _attempt in range(5):
            self.assertEqual(self.reset(token, "999999").status_code, 401)
        self.assertEqual(self.reset(token).status_code, 401)
        challenge = self.sql("SELECT otp_attempts, otp_hash, revoked_at FROM sessions")[0]
        self.assertEqual(challenge["otp_attempts"], 5)
        self.assertIsNone(challenge["otp_hash"])
        self.assertIsNotNone(challenge["revoked_at"])

    def test_resend_invalidates_previous_otp(self):
        old = self.forgot()
        self.sql("UPDATE sessions SET created_at = %s WHERE kind = 'otp'",
                 (self.module.utcnow() - timedelta(seconds=61),))
        new = self.forgot(code=654321)
        self.assertEqual(self.reset(old).status_code, 401)
        self.assertEqual(self.reset(new, "654321").status_code, 200)

    def test_recovery_status_reports_remaining_resend_wait_and_expiry(self):
        token = self.forgot()
        response = self.client.get("/api/auth/otp-session", headers=self.auth(token))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(0 < response.json["retry_after"] <= 60)
        self.assertEqual(response.json["expires_at"],
                         datetime.fromtimestamp(self.decode(token)["exp"], timezone.utc)
                         .strftime("%Y-%m-%dT%H:%M:%SZ"))
        self.assertNotIn("token", response.json)

    def test_resend_cooldown_cannot_be_bypassed_with_forgot_request(self):
        token = self.forgot()
        with patch.object(self.module.mail, "send") as send:
            for path, body in [("/api/auth/resend", {}), ("/api/auth/forgot", {"username": "alice"})]:
                response = self.client.post(path, headers=self.auth(token) if path.endswith("resend") else {}, json=body)
                self.assertEqual(response.status_code, 429)
                self.assertTrue(0 < response.json["retry_after"] <= 60)
                self.assertEqual(response.headers["Retry-After"], str(response.json["retry_after"]))
            send.assert_not_called()
        self.assertEqual(len(self.sql("SELECT * FROM sessions")), 1)

    def test_authenticated_resend_replaces_token_and_otp_for_the_same_account(self):
        login = self.login()
        old = self.forgot()
        self.sql("UPDATE sessions SET created_at = %s WHERE kind = 'otp'",
                 (self.module.utcnow() - timedelta(seconds=61),))
        with patch.object(self.module.mail, "send") as send, patch.object(self.module.secrets, "randbelow", return_value=654321):
            response = self.client.post("/api/auth/resend", headers=self.auth(old), json={"username": "admin"})
            self.assertEqual(response.status_code, 200, response.json)
            self.assertEqual(send.call_args.args[0].recipients, ["alice@example.test"])
            self.assertIn("654321", send.call_args.args[0].html)
        new = response.json["token"]
        self.assertEqual(self.decode(new)["sub"], "2")
        self.assertEqual(self.decode(new)["exp"] - self.decode(new)["iat"], 300)
        self.assertNotEqual(self.decode(new)["sid"], self.decode(old)["sid"])
        self.assertEqual(response.json["retry_after"], 60)
        old_record = self.sql("SELECT * FROM sessions WHERE id = %s", (self.decode(old)["sid"],))[0]
        self.assertIsNotNone(old_record["revoked_at"])
        self.assertIsNone(old_record["otp_hash"])
        self.assertEqual(self.client.get("/api/auth/session", headers=self.auth(login)).status_code, 200)
        self.assertEqual(self.client.post("/api/auth/resend", headers=self.auth(old)).status_code, 401)
        self.assertEqual(self.reset(old).status_code, 401)
        self.assertEqual(self.reset(new).status_code, 401)
        self.assertEqual(self.reset(new, "654321").status_code, 200)

    def test_resend_rejects_missing_login_expired_and_locked_tokens(self):
        self.assertEqual(self.client.post("/api/auth/resend").status_code, 401)
        self.assertEqual(self.client.post("/api/auth/resend", headers=self.auth(self.login())).status_code, 403)
        token = self.forgot()
        self.sql("UPDATE sessions SET expires_at = %s WHERE kind = 'otp'", (datetime(2000, 1, 1),))
        self.assertEqual(self.client.post("/api/auth/resend", headers=self.auth(token)).status_code, 401)
        self.sql("UPDATE sessions SET expires_at = %s WHERE kind = 'otp'",
                 (self.module.utcnow() + timedelta(minutes=5),))
        for _attempt in range(5):
            self.assertEqual(self.reset(token, "999999").status_code, 401)
        self.assertEqual(self.client.post("/api/auth/resend", headers=self.auth(token)).status_code, 401)

    def test_failed_resend_preserves_the_previous_challenge(self):
        token = self.forgot()
        self.sql("UPDATE sessions SET created_at = %s", (self.module.utcnow() - timedelta(seconds=61),))
        with patch.object(self.module.mail, "send", side_effect=RuntimeError("SMTP unavailable")):
            response = self.client.post("/api/auth/resend", headers=self.auth(token))
        self.assertEqual(response.status_code, 500)
        records = self.sql("SELECT * FROM sessions")
        self.assertEqual(len(records), 1)
        self.assertIsNone(records[0]["revoked_at"])
        self.assertEqual(self.reset(token).status_code, 200)

    def test_resend_rechecks_challenge_if_revoked_after_initial_validation(self):
        token = self.forgot()
        self.sql("UPDATE sessions SET created_at = %s", (self.module.utcnow() - timedelta(seconds=61),))

        def revoke_before_transaction():
            self.sql("UPDATE sessions SET revoked_at = %s, otp_hash = NULL", (self.module.utcnow(),))
            return self.pool.connection()

        with patch.object(self.module, "get_db_connection", side_effect=revoke_before_transaction), patch.object(self.module.mail, "send") as send:
            response = self.client.post("/api/auth/resend", headers=self.auth(token))
            send.assert_not_called()
        self.assertEqual(response.status_code, 401)

    def test_resend_hourly_limit_survives_token_rotation(self):
        token = self.forgot()
        self.module.limiter.reset()
        self.module.limiter.enabled = True
        try:
            with patch.object(self.module.mail, "send") as send:
                for _attempt in range(3):
                    self.sql("UPDATE sessions SET created_at = %s", (self.module.utcnow() - timedelta(seconds=61),))
                    response = self.client.post("/api/auth/resend", headers=self.auth(token))
                    self.assertEqual(response.status_code, 200, response.json)
                    token = response.json["token"]
                self.sql("UPDATE sessions SET created_at = %s", (self.module.utcnow() - timedelta(seconds=61),))
                response = self.client.post("/api/auth/resend", headers=self.auth(token))
                self.assertEqual(response.status_code, 429)
                self.assertEqual(send.call_count, 3)
        finally:
            self.module.limiter.enabled = False
            self.module.limiter.reset()

    def test_expired_otp_does_not_reset_password(self):
        token = self.forgot()
        self.sql("UPDATE sessions SET expires_at = %s", (datetime(2000, 1, 1),))
        self.assertEqual(self.reset(token).status_code, 401)
        self.login()

    def test_login_token_cannot_reset_password(self):
        token = self.login()
        self.assertEqual(self.reset(token).status_code, 403)

    def test_legacy_tokens_and_account_role_changes_are_rejected(self):
        with self.module.app.app_context():
            old = self.module.create_access_token(identity="1", additional_claims={"username": "admin", "role": "admin"})
        self.assertEqual(self.client.get("/api/sessions", headers=self.auth(old)).status_code, 401)
        admin = self.login("admin")
        self.sql("UPDATE users SET role = 'user' WHERE id = 1")
        self.assertEqual(self.client.get("/api/sessions", headers=self.auth(admin)).status_code, 401)

    def test_forwarded_ip_ignores_spoofed_leftmost_value(self):
        token = self.login(address="198.51.100.99, 203.0.113.10, 172.18.0.2")
        record = self.sql("SELECT ip_address FROM sessions WHERE id = %s", (self.decode(token)["sid"],))[0]
        self.assertEqual(record["ip_address"], "203.0.113.10")

    def test_untrusted_peer_cannot_spoof_forwarded_ip(self):
        from sessions import client_ip
        with self.module.app.test_request_context(headers={"X-Forwarded-For": "198.51.100.99"}, environ_base={"REMOTE_ADDR": "203.0.113.10"}):
            self.assertEqual(client_ip(), "203.0.113.10")

    def test_edge_and_android_metadata(self):
        token = self.login(agent="Mozilla/5.0 (Linux; Android 14; Phone) Chrome/130.0 Mobile Safari/537.36 EdgA/130.1")
        record = self.sql("SELECT browser, device, os FROM sessions WHERE id = %s", (self.decode(token)["sid"],))[0]
        self.assertEqual(record["browser"], "Edge 130.1")
        self.assertEqual(record["device"], "Android / Mobile")
        self.assertEqual(record["os"], "Android")

    def test_missing_session_and_self_revocation(self):
        admin = self.login("admin")
        self.assertEqual(self.client.delete("/api/sessions/unknown", headers=self.auth(admin)).status_code, 404)
        response = self.client.delete("/api/sessions/" + self.decode(admin)["sid"], headers=self.auth(admin))
        self.assertTrue(response.json["is_current"])
        self.assertEqual(self.client.get("/api/auth/session", headers=self.auth(admin)).status_code, 401)
        self.assertEqual(self.sql("SELECT id FROM sessions WHERE kind = 'login'"), [])

    def test_inactive_session_returns_online_after_heartbeat(self):
        from sessions import utcnow
        token, admin = self.login(), self.login("admin")
        session_id = self.decode(token)["sid"]
        self.sql("UPDATE sessions SET last_seen_at = %s WHERE id = %s",
                 (utcnow() - timedelta(seconds=121), session_id))
        listing = self.client.get("/api/sessions", headers=self.auth(admin))
        session = next(record for record in listing.json if record["id"] == session_id)
        self.assertEqual(session["status"], "offline")
        self.assertTrue(session["can_revoke"])
        self.assertEqual(self.client.get("/api/auth/session", headers=self.auth(token)).status_code, 200)
        listing = self.client.get("/api/sessions", headers=self.auth(admin))
        session = next(record for record in listing.json if record["id"] == session_id)
        self.assertEqual(session["status"], "online")

    def test_expired_and_closed_sessions_are_removed_without_history(self):
        expired, closed, admin = self.login(), self.login(), self.login("admin")
        self.sql("UPDATE sessions SET expires_at = %s WHERE id = %s",
                 (datetime(2000, 1, 1), self.decode(expired)["sid"]))
        self.assertEqual(self.client.delete("/api/auth/logout", headers=self.auth(closed)).status_code, 200)
        listing = self.client.get("/api/sessions", headers=self.auth(admin))
        alice = [record for record in listing.json if record["username"] == "alice"]
        self.assertEqual(alice, [])
        self.assertEqual(self.sql("SELECT id FROM sessions WHERE user_id = 2 AND kind = 'login'"), [])

    def test_refresh_cleans_legacy_revoked_logins_but_keeps_inactive_and_otp_sessions(self):
        revoked, inactive, admin = self.login(), self.login(), self.login("admin")
        recovery = self.forgot()
        self.sql("UPDATE sessions SET revoked_at = %s WHERE id = %s",
                 (self.module.utcnow(), self.decode(revoked)["sid"]))
        self.sql("UPDATE sessions SET last_seen_at = %s WHERE id = %s",
                 (self.module.utcnow() - timedelta(minutes=3), self.decode(inactive)["sid"]))
        listing = self.client.get("/api/sessions", headers=self.auth(admin))
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(self.sql("SELECT id FROM sessions WHERE id = %s", (self.decode(revoked)["sid"],)), [])
        remaining = next(record for record in listing.json if record["id"] == self.decode(inactive)["sid"])
        self.assertEqual(remaining["status"], "offline")
        self.assertTrue(remaining["can_revoke"])
        self.assertEqual(self.client.get("/api/auth/otp-session", headers=self.auth(recovery)).status_code, 200)

    def test_otp_challenges_are_excluded_from_presence_listing(self):
        admin = self.login("admin")
        self.forgot()
        listing = self.client.get("/api/sessions", headers=self.auth(admin))
        self.assertEqual(len(listing.json), 1)
        self.assertEqual(listing.json[0]["username"], "admin")
        self.assertEqual(listing.json[0]["status"], "online")

    def test_presence_timeout_and_token_expiry_boundaries(self):
        from sessions import session_presence
        now = datetime(2026, 10, 10, 12)
        session = {"revoked_at": None, "expires_at": now + timedelta(hours=1),
                   "last_seen_at": now - timedelta(minutes=2)}
        self.assertEqual(session_presence(session, now), {"status": "online", "can_revoke": True})
        session["last_seen_at"] -= timedelta(microseconds=1)
        self.assertEqual(session_presence(session, now), {"status": "offline", "can_revoke": True})
        session["last_seen_at"] = now
        session["expires_at"] = now
        self.assertEqual(session_presence(session, now), {"status": "offline", "can_revoke": False})
        session["expires_at"] = now + timedelta(hours=1)
        session["revoked_at"] = now
        self.assertEqual(session_presence(session, now), {"status": "offline", "can_revoke": False})

    def test_heartbeat_updates_without_the_activity_write_throttle(self):
        from sessions import utcnow
        token = self.login()
        before = utcnow() - timedelta(seconds=30)
        self.sql("UPDATE sessions SET last_seen_at = %s", (before,))
        self.assertEqual(self.client.get("/api/auth/session", headers=self.auth(token)).status_code, 200)
        self.assertGreater(self.sql("SELECT last_seen_at FROM sessions")[0]["last_seen_at"], before)


if __name__ == "__main__":
    unittest.main()
