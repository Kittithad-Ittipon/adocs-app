function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusDot(host) {
  if (!host.enabled) return `<span class="h-2 w-2 rounded-full bg-zinc-600"></span>`;
  if (host.ssl) return `<span class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.55)] animate-pulse"></span>`;
  return `<span class="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.5)]"></span>`;
}

function hostCard(host) {
  const primary = escapeHtml(host.domains[0] || "(no domain)");
  const rest = host.domains.slice(1);
  const restBadges = rest
    .map((d) => `<span class="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">${escapeHtml(d)}</span>`)
    .join("");
  const searchKey = escapeHtml([...host.domains, host.certName || ""].join(" ").toLowerCase());

  return `
  <div class="host-card group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition hover:border-white/16 hover:bg-white/[0.05]" data-search="${searchKey}">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          ${statusDot(host)}
          <h3 class="truncate font-medium text-zinc-100">${primary}</h3>
        </div>
        ${rest.length ? `<div class="mt-2 flex flex-wrap gap-1.5">${restBadges}</div>` : ""}
      </div>
    </div>
    <div class="mt-4 flex items-center gap-2 font-mono text-[12px] text-zinc-500">
      <span class="text-zinc-600">→</span>
      <span>${escapeHtml(host.forwardHost)}:${escapeHtml(String(host.forwardPort))}</span>
    </div>
    <div class="mt-3 flex items-center gap-1.5 border-t border-white/5 pt-3 text-[11px]">
      <span class="text-zinc-600">cert:</span>
      <span class="${host.certName ? "text-emerald-300/90" : "text-zinc-600"}">${host.certName ? escapeHtml(host.certName) : "ไม่มี certificate"}</span>
    </div>
  </div>`;
}

function renderPage({ hosts = [], errorMessage = null }) {
  const enabledCount = hosts.filter((h) => h.enabled).length;

  const hostsMarkup = errorMessage
    ? `<div class="col-span-full rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-6 text-center text-sm text-red-300">
         ${escapeHtml(errorMessage)}
       </div>`
    : hosts.length
    ? hosts.map(hostCard).join("")
    : `<div class="col-span-full rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center text-sm text-zinc-500">
         ยังไม่มี proxy host ที่ตั้งค่าไว้
       </div>`;

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Infrastructure Overview</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ["Prompt", "sans-serif"],
          mono: ["JetBrains Mono", "monospace"],
        },
      },
    },
  };
</script>
<style>
  html { background: #08080c; }
  body {
    background:
      radial-gradient(60rem 30rem at 12% -10%, rgba(59,108,255,0.16), transparent 60%),
      radial-gradient(50rem 26rem at 100% 0%, rgba(124,58,237,0.14), transparent 55%),
      radial-gradient(40rem 24rem at 50% 110%, rgba(16,185,129,0.06), transparent 60%),
      #08080c;
    background-attachment: fixed;
  }
  .grid-overlay {
    background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 26px 26px;
    mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 90%);
  }
</style>
</head>
<body class="min-h-screen font-sans text-zinc-200 antialiased">

  <div class="pointer-events-none fixed inset-0 grid-overlay"></div>

  <div class="relative mx-auto max-w-5xl px-6 pb-24 pt-10">

    <!-- Nav -->
    <nav class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="h-2 w-2 rounded-full bg-gradient-to-br from-sky-400 to-violet-500"></div>
        <span class="text-sm font-medium tracking-wide text-zinc-300">adocs / infra</span>
      </div>
      <div class="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
        ${errorMessage ? "offline" : `${enabledCount} host${enabledCount === 1 ? "" : "s"} online`}
      </div>
    </nav>

    <!-- Hero -->
    <header class="mt-24 max-w-2xl">
      <p class="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Internal · Live status</p>
      <h1 class="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 sm:text-5xl">
        Infrastructure<br />Overview
      </h1>
      <p class="mt-5 text-sm leading-relaxed text-zinc-500">
        รายการ proxy host ทั้งหมดที่ตั้งค่าไว้บน Nginx Proxy Manager และใบรับรองที่ใช้งานจริง สำหรับติดตั้งบนเครื่อง client
      </p>
    </header>

    <!-- Setup guide -->
    <section class="mt-16">
      <h2 class="text-sm font-medium text-zinc-400">ขั้นตอนตั้งค่าเครื่อง</h2>
      <p class="mt-1 text-xs text-zinc-600">ทำตามลำดับ 1 → 2 → 3 ครั้งเดียว ไม่ต้องทำซ้ำถ้าเข้าเครือข่ายเดิม</p>

      <ol class="mt-5 space-y-3">
        <li class="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <div class="flex items-baseline gap-3">
            <span class="font-mono text-xs text-zinc-600">01</span>
            <h3 class="text-sm font-medium text-zinc-100">ตั้งค่า DNS บน Windows</h3>
          </div>
          <div class="mt-3 space-y-2 pl-8 text-xs leading-relaxed text-zinc-400">
            <p>กด <kbd class="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">Win + R</kbd> พิมพ์ <span class="font-mono text-zinc-300">ncpa.cpl</span> แล้ว Enter (หรือเข้า Control Panel → Network and Internet → Network Connections)</p>
            <p>คลิกขวาที่การ์ดเน็ตที่ใช้งานอยู่ (Wi-Fi หรือ Ethernet) → Properties → เลือก <span class="font-mono text-zinc-300">Internet Protocol Version 4 (TCP/IPv4)</span> → Properties</p>
            <p>เลือก <span class="text-zinc-300">Use the following DNS server addresses</span> แล้วตั้งค่า:</p>
            <div class="mt-2 grid gap-2 sm:grid-cols-2">
              <div class="rounded-xl border border-white/8 bg-black/20 p-3">
                <p class="text-[11px] text-zinc-500">อยู่ในเครือข่าย RMUTI (internet ปกติ)</p>
                <p class="mt-1 font-mono text-sm text-zinc-200">Preferred: 172.22.110.1</p>
              </div>
              <div class="rounded-xl border border-white/8 bg-black/20 p-3">
                <p class="text-[11px] text-zinc-500">ต่อผ่าน VPN (นอกเครือข่าย RMUTI)</p>
                <p class="mt-1 font-mono text-sm text-zinc-200">Preferred: 172.27.110.1</p>
              </div>
            </div>
            <p class="mt-2">Alternate DNS server: <span class="font-mono text-zinc-300">1.1.1.1</span> หรือ <span class="font-mono text-zinc-300">8.8.8.8</span> → กด OK ทุกหน้าต่าง</p>
          </div>
        </li>

        <li class="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <div class="flex items-baseline gap-3">
            <span class="font-mono text-xs text-zinc-600">02</span>
            <h3 class="text-sm font-medium text-zinc-100">ดาวน์โหลดและติดตั้ง Certificate</h3>
          </div>
          <div class="mt-3 space-y-2 pl-8 text-xs leading-relaxed text-zinc-400">
            <p>กดปุ่มดาวน์โหลดด้านล่าง จะได้ไฟล์ <span class="font-mono text-zinc-300">addp-site.crt</span></p>
            <p>ดับเบิลคลิกไฟล์ → <span class="text-zinc-300">Install Certificate</span> → เลือก <span class="text-zinc-300">Local Machine</span> → Next</p>
            <p>เลือก <span class="text-zinc-300">Place all certificates in the following store</span> → Browse → <span class="text-zinc-300">Trusted Root Certification Authorities</span> → Finish</p>
            <p>ปิดและเปิด browser ใหม่ ก็จะไม่ขึ้นเตือน "ไม่ปลอดภัย" อีก</p>
          </div>
          <div class="mt-4 pl-8">
            <a
              href="/download-cert"
              class="inline-flex rounded-xl bg-gradient-to-b from-white to-zinc-200 px-4 py-2.5 text-xs font-medium text-zinc-900 transition hover:opacity-90"
            >
              Download certificate
            </a>
          </div>
        </li>

        <li class="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <div class="flex items-baseline gap-3">
            <span class="font-mono text-xs text-zinc-600">03</span>
            <h3 class="text-sm font-medium text-zinc-100">เช็ครายการ host และ certificate ที่ใช้</h3>
          </div>
          <p class="mt-3 pl-8 text-xs leading-relaxed text-zinc-400">
            เลื่อนลงไปดูรายการทั้งหมดด้านล่าง แต่ละ host จะบอกชื่อ certificate ที่ใช้จริงกำกับไว้
          </p>
        </li>
      </ol>
    </section>

    <!-- Proxy hosts -->
    <section class="mt-16">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <h2 class="text-sm font-medium text-zinc-400">Proxy hosts</h2>
          <span class="font-mono text-[11px] text-zinc-600">${hosts.length} total</span>
        </div>
        <input
          id="host-search"
          type="text"
          placeholder="ค้นหาโดเมนหรือชื่อ certificate..."
          class="w-full rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-white/20 sm:w-72"
        />
      </div>
      <div id="host-grid" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        ${hostsMarkup}
      </div>
      <p id="host-empty" class="hidden mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center text-sm text-zinc-500">
        ไม่พบ host ที่ตรงกับคำค้นหา
      </p>
    </section>

    <script>
      (function () {
        var input = document.getElementById("host-search");
        var grid = document.getElementById("host-grid");
        var empty = document.getElementById("host-empty");
        if (!input || !grid) return;

        input.addEventListener("input", function () {
          var q = input.value.trim().toLowerCase();
          var cards = grid.querySelectorAll(".host-card");
          var visible = 0;
          cards.forEach(function (card) {
            var match = card.getAttribute("data-search").indexOf(q) !== -1;
            card.style.display = match ? "" : "none";
            if (match) visible++;
          });
          empty.classList.toggle("hidden", visible !== 0 || cards.length === 0);
        });
      })();
    </script>

    <footer class="mt-20 flex items-center justify-between border-t border-white/5 pt-6 text-[11px] text-zinc-600">
      <span>adocs internal tools</span>
      <span class="font-mono">${new Date().toISOString().slice(0, 19).replace("T", " ")} UTC</span>
    </footer>

  </div>
</body>
</html>`;
}

module.exports = { renderPage };