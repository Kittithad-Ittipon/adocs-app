require("dotenv").config();
const express = require("express");
const { renderPage } = require("./render");

const app = express();
const PORT = process.env.PORT || 4000;

const NPM_URL = process.env.NPM_URL;
const NPM_USERNAME = process.env.NPM_USERNAME;
const NPM_PASSWORD = process.env.NPM_PASSWORD;
const CRT_URL1 = process.env.CRT_URL1;
const CRT_URL2 = process.env.CRT_URL2;

// เก็บ token ไว้ใน memory กันขอใหม่ทุก request (NPM token อายุปกติ ~1 วัน)
let cachedToken = null;
let tokenExpiresAt = 0;

async function getNpmToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const res = await fetch(`${NPM_URL}/api/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: NPM_USERNAME, secret: NPM_PASSWORD }),
  });

  if (!res.ok) {
    throw new Error(`NPM login failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  cachedToken = data.token;
  // ตั้งให้หมดอายุก่อนเวลาจริง 5 นาที กันชนตอน request ยาว
  tokenExpiresAt = Date.now() + 23 * 60 * 60 * 1000;
  return cachedToken;
}

async function getCertificateMap() {
  const token = await getNpmToken();
  const res = await fetch(`${NPM_URL}/api/nginx/certificates`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Fetch certificates failed: ${res.status} ${res.statusText}`);
  }

  const certs = await res.json();
  const map = new Map();
  for (const c of certs) {
    map.set(c.id, c.nice_name || (c.domain_names || []).join(", ") || `cert #${c.id}`);
  }
  return map;
}

async function getProxyHosts() {
  const token = await getNpmToken();
  const res = await fetch(`${NPM_URL}/api/nginx/proxy-hosts`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Fetch proxy hosts failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ดึงไฟล์ cert จาก URL หลักก่อน ถ้า fail ค่อย fallback ไป URL สำรอง
async function fetchCertWithFallback() {
  const attempts = [CRT_URL1, CRT_URL2].filter(Boolean);
  let lastError;

  for (const url of attempts) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const buffer = Buffer.from(await res.arrayBuffer());
      return { buffer, sourceUrl: url };
    } catch (err) {
      lastError = err;
      // ลองตัวถัดไป
    }
  }

  throw lastError || new Error("ไม่มี CRT_URL ให้ลอง");
}

app.get("/", async (req, res) => {
  let hosts = [];
  let errorMessage = null;

  try {
    const [raw, certMap] = await Promise.all([getProxyHosts(), getCertificateMap()]);
    hosts = raw
      .map((h) => ({
        domains: h.domain_names || [],
        forwardHost: h.forward_host,
        forwardPort: h.forward_port,
        enabled: !!h.enabled,
        ssl: !!h.certificate_id,
        certName: h.certificate_id ? certMap.get(h.certificate_id) || `cert #${h.certificate_id}` : null,
      }))
      .sort((a, b) => (a.domains[0] || "").localeCompare(b.domains[0] || ""));
  } catch (err) {
    errorMessage = "ไม่สามารถเชื่อมต่อ Nginx Proxy Manager ได้ในขณะนี้";
    console.error("[NPM]", err.message);
  }

  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(renderPage({ hosts, errorMessage }));
});

app.get("/download-cert", async (req, res) => {
  try {
    const { buffer, sourceUrl } = await fetchCertWithFallback();
    console.log(`[CRT] served from ${sourceUrl}`);
    res.set("Content-Type", "application/x-x509-ca-cert");
    res.set("Content-Disposition", 'attachment; filename="addp-site.crt"');
    res.send(buffer);
  } catch (err) {
    console.error("[CRT]", err.message);
    res.status(502).send("ไม่สามารถดาวน์โหลด certificate ได้ในขณะนี้ ลองใหม่อีกครั้ง");
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`server-response listening on port ${PORT}`);
});