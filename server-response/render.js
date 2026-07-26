function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function domainHref(domain) {
  return `https://${domain}`;
}

function statusDot(host) {
  if (!host.enabled) return `<span class="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600"></span>`;
  if (host.ssl) return `<span class="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.45)] animate-pulse"></span>`;
  return `<span class="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.4)]"></span>`;
}

function hostCard(host) {
  const primaryDomain = host.domains[0] || "";
  const primary = escapeHtml(primaryDomain || "(no domain)");
  const rest = host.domains.slice(1);
  const restBadges = rest
    .map(
      (d) => `<a href="${domainHref(d)}" target="_blank" rel="noopener noreferrer"
        class="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 hover:underline dark:bg-white/5 dark:text-zinc-400">${escapeHtml(d)}</a>`
    )
    .join("");
  const searchKey = escapeHtml([...host.domains, host.certName || ""].join(" ").toLowerCase());

  return `
  <div class="host-card group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/16 dark:hover:bg-white/[0.05]" data-search="${searchKey}">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          ${statusDot(host)}
          ${
            primaryDomain
              ? `<a href="${domainHref(primaryDomain)}" target="_blank" rel="noopener noreferrer"
                   class="truncate font-medium text-zinc-900 hover:underline dark:text-zinc-100">${primary}</a>`
              : `<h3 class="truncate font-medium text-zinc-900 dark:text-zinc-100">${primary}</h3>`
          }
        </div>
        ${rest.length ? `<div class="mt-2 flex flex-wrap gap-1.5">${restBadges}</div>` : ""}
      </div>
    </div>
    <div class="mt-4 flex items-center gap-2 font-mono text-[12px] text-zinc-500">
      <span class="text-zinc-400 dark:text-zinc-600">→</span>
      <span>${escapeHtml(host.forwardHost)}:${escapeHtml(String(host.forwardPort))}</span>
    </div>
    <div class="mt-3 flex items-center gap-1.5 border-t border-zinc-100 pt-3 text-[11px] dark:border-white/5">
      <span class="text-zinc-400 dark:text-zinc-600">cert:</span>
      <span class="${host.certName ? "text-emerald-600 dark:text-emerald-300/90" : "text-zinc-400 dark:text-zinc-600"}">${host.certName ? escapeHtml(host.certName) : "ไม่มี certificate"}</span>
    </div>
  </div>`;
}

function renderPage({ hosts = [], errorMessage = null }) {
  const enabledCount = hosts.filter((h) => h.enabled).length;

  const hostsMarkup = errorMessage
    ? `<div class="col-span-full rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/[0.06] dark:text-red-300">
         ${escapeHtml(errorMessage)}
       </div>`
    : hosts.length
    ? hosts.map(hostCard).join("")
    : `<div class="col-span-full rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 dark:border-white/8 dark:bg-white/[0.03]">
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
<script>
  // ตั้ง theme ก่อน paint กัน flash สีผิด
  (function () {
    try {
      var t = localStorage.getItem("theme") || "dark";
      if (t === "dark") document.documentElement.classList.add("dark");
    } catch (e) {}
  })();
</script>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: "class",
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
  html { background: #f7f7fb; }
  html.dark { background: #08080c; }

  body {
    background:
      radial-gradient(60rem 30rem at 12% -10%, rgba(59,108,255,0.06), transparent 60%),
      radial-gradient(50rem 26rem at 100% 0%, rgba(124,58,237,0.05), transparent 55%),
      radial-gradient(40rem 24rem at 50% 110%, rgba(16,185,129,0.03), transparent 60%),
      #f7f7fb;
    background-attachment: fixed;
  }
  html.dark body {
    background:
      radial-gradient(60rem 30rem at 12% -10%, rgba(59,108,255,0.16), transparent 60%),
      radial-gradient(50rem 26rem at 100% 0%, rgba(124,58,237,0.14), transparent 55%),
      radial-gradient(40rem 24rem at 50% 110%, rgba(16,185,129,0.06), transparent 60%),
      #08080c;
    background-attachment: fixed;
  }
  .grid-overlay {
    background-image: radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px);
    background-size: 26px 26px;
    mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 90%);
  }
  html.dark .grid-overlay {
    background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
  }
</style>
</head>
<body class="min-h-screen font-sans text-zinc-700 antialiased dark:text-zinc-200">

  <div class="pointer-events-none fixed inset-0 grid-overlay"></div>

  <div class="relative mx-auto max-w-5xl px-6 pb-24 pt-10">

    <!-- Nav -->
    <nav class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="h-2 w-2 rounded-full bg-gradient-to-br from-sky-400 to-violet-500"></div>
        <span class="text-sm font-medium tracking-wide text-zinc-600 dark:text-zinc-300">adocs / infra</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          id="theme-toggle"
          aria-label="สลับธีมสว่าง/มืด"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
        >
          <svg class="hidden h-4 w-4 dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
          <svg class="h-4 w-4 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </button>
        <div class="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400">
          ${errorMessage ? "offline" : `${enabledCount} host${enabledCount === 1 ? "" : "s"} online`}
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <header class="mt-24 max-w-2xl">
      <p class="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Internal · Live status</p>
      <h1 class="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 sm:text-5xl">
        Infrastructure<br />Overview
      </h1>
      <p class="mt-5 text-sm leading-relaxed text-zinc-500">
        รายการ proxy host ทั้งหมดที่ตั้งค่าไว้บน Nginx Proxy Manager และใบรับรองที่ใช้งานจริง สำหรับติดตั้งบนเครื่อง client
      </p>
    </header>

    <!-- Setup guide -->
    <section class="mt-16">
      <h2 class="text-sm font-medium text-zinc-600 dark:text-zinc-400">ขั้นตอนตั้งค่าเครื่อง</h2>
      <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-600">ทำตามลำดับ 1 → 2 → 3 ครั้งเดียว ไม่ต้องทำซ้ำถ้าเข้าเครือข่ายเดิม</p>

      <ol class="mt-5 space-y-3">
        <li class="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/8 dark:bg-white/[0.03]">
          <div class="flex items-baseline gap-3">
            <span class="font-mono text-xs text-zinc-400 dark:text-zinc-600">01</span>
            <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-100">ตั้งค่า DNS บน Windows</h3>
          </div>
          <div class="mt-3 space-y-2 pl-8 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            <p>กด <kbd class="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700 dark:bg-white/10 dark:text-zinc-300">Win + R</kbd> พิมพ์ <span class="font-mono text-zinc-800 dark:text-zinc-300">ncpa.cpl</span> แล้ว Enter (หรือเข้า Control Panel → Network and Internet → Network Connections)</p>
            <p>คลิกขวาที่การ์ดเน็ตที่ใช้งานอยู่ (Wi-Fi หรือ Ethernet) → Properties → เลือก <span class="font-mono text-zinc-800 dark:text-zinc-300">Internet Protocol Version 4 (TCP/IPv4)</span> → Properties</p>
            <p>เลือก <span class="text-zinc-800 dark:text-zinc-300">Use the following DNS server addresses</span> แล้วตั้งค่า:</p>
            <div class="mt-2 grid gap-2 sm:grid-cols-2">
              <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/8 dark:bg-black/20">
                <p class="text-[11px] text-zinc-500">อยู่ในเครือข่าย RMUTI (internet ปกติ)</p>
                <p class="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-200">Preferred: 172.22.110.1</p>
              </div>
              <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/8 dark:bg-black/20">
                <p class="text-[11px] text-zinc-500">ต่อผ่าน VPN (นอกเครือข่าย RMUTI)</p>
                <p class="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-200">Preferred: 172.27.110.1</p>
              </div>
            </div>
            <p class="mt-2">Alternate DNS server: <span class="font-mono text-zinc-800 dark:text-zinc-300">1.1.1.1</span> หรือ <span class="font-mono text-zinc-800 dark:text-zinc-300">8.8.8.8</span> → กด OK ทุกหน้าต่าง</p>
          </div>
        </li>

        <li class="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/8 dark:bg-white/[0.03]">
          <div class="flex items-baseline gap-3">
            <span class="font-mono text-xs text-zinc-400 dark:text-zinc-600">02</span>
            <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-100">ดาวน์โหลดและติดตั้ง Certificate</h3>
          </div>
          <div class="mt-3 space-y-2 pl-8 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            <p>กดปุ่มดาวน์โหลดด้านล่าง จะได้ไฟล์ <span class="font-mono text-zinc-800 dark:text-zinc-300">addp-site.crt</span></p>
            <p>ดับเบิลคลิกไฟล์ → <span class="text-zinc-800 dark:text-zinc-300">Install Certificate</span> → เลือก <span class="text-zinc-800 dark:text-zinc-300">Local Machine</span> → Next</p>
            <p>เลือก <span class="text-zinc-800 dark:text-zinc-300">Place all certificates in the following store</span> → Browse → <span class="text-zinc-800 dark:text-zinc-300">Trusted Root Certification Authorities</span> → Finish</p>
            <p>ปิดและเปิด browser ใหม่ ก็จะไม่ขึ้นเตือน "ไม่ปลอดภัย" อีก</p>
          </div>
          <div class="mt-4 pl-8">
            <a
              href="/download-cert"
              class="inline-flex rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-medium text-white transition hover:opacity-90 dark:bg-gradient-to-b dark:from-white dark:to-zinc-200 dark:text-zinc-900"
            >
              Download certificate
            </a>
          </div>
        </li>

        <li class="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/8 dark:bg-white/[0.03]">
          <div class="flex items-baseline gap-3">
            <span class="font-mono text-xs text-zinc-400 dark:text-zinc-600">03</span>
            <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-100">เช็ครายการ host และ certificate ที่ใช้</h3>
          </div>
          <p class="mt-3 pl-8 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            เลื่อนลงไปดูรายการทั้งหมดด้านล่าง แต่ละ host จะบอกชื่อ certificate ที่ใช้จริงกำกับไว้ คลิกชื่อ domain เพื่อเปิดเว็บนั้นในแท็บใหม่ได้เลย
          </p>
        </li>
      </ol>
    </section>

    <!-- Proxy hosts -->
    <section class="mt-16">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <h2 class="text-sm font-medium text-zinc-600 dark:text-zinc-400">Proxy hosts</h2>
          <span class="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">${hosts.length} total</span>
        </div>
        <input
          id="host-search"
          type="text"
          placeholder="ค้นหาโดเมนหรือชื่อ certificate..."
          class="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 dark:border-white/8 dark:bg-white/[0.03] dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-white/20 sm:w-72"
        />
      </div>
      <div id="host-grid" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        ${hostsMarkup}
      </div>
      <p id="host-empty" class="hidden mt-4 rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 dark:border-white/8 dark:bg-white/[0.03]">
        ไม่พบ host ที่ตรงกับคำค้นหา
      </p>
    </section>

    <script>
      (function () {
        var input = document.getElementById("host-search");
        var grid = document.getElementById("host-grid");
        var empty = document.getElementById("host-empty");
        var themeBtn = document.getElementById("theme-toggle");

        if (themeBtn) {
          themeBtn.addEventListener("click", function () {
            var root = document.documentElement;
            var isDark = root.classList.toggle("dark");
            try {
              localStorage.setItem("theme", isDark ? "dark" : "light");
            } catch (e) {}
          });
        }

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

    <footer class="mt-20 flex items-center justify-between border-t border-zinc-200 pt-6 text-[11px] text-zinc-500 dark:border-white/5 dark:text-zinc-600">
      <span>adocs internal tools</span>
      <span class="font-mono">${new Date().toISOString().slice(0, 19).replace("T", " ")} UTC</span>
    </footer>

  </div>
</body>
</html>`;
}

module.exports = { renderPage };