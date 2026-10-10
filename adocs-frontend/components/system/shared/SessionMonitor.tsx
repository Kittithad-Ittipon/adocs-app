"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SessionMonitor() {
  const router = useRouter();
  useEffect(() => {
    let checking = false;
    const controller = new AbortController();
    async function check() {
      if (checking || document.visibilityState !== "visible") return;
      checking = true;
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store", signal: controller.signal });
        if (response.status === 401) {
          router.replace("/login");
          router.refresh();
        }
      } catch {
        // Temporary connection failures leave the cookie intact for retry.
      } finally {
        checking = false;
      }
    }
    void check();
    const interval = window.setInterval(() => void check(), 30_000);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, [router]);
  return null;
}
