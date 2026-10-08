"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

type AuthResponse = { error?: string; message?: string; href?: string };

export function useAuthRequest() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);

  async function submit(url: string, body: Record<string, string | boolean>, successTitle: string, method = "POST"): Promise<AuthResponse | null> {
    if (submitting.current) return null;
    submitting.current = true;
    setPending(true);
    setError("");
    const toastId = toast.loading("Please wait...");
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({})) as AuthResponse;
      if (!response.ok) {
        const message = data.error || "Unable to complete the request. Please try again.";
        setError(message);
        toast.error("Request failed", { id: toastId, description: message });
        return null;
      }
      toast.success(successTitle, { id: toastId, description: data.message });
      return data;
    } catch {
      const message = "Unable to connect to the server. Please try again.";
      setError(message);
      toast.error("Request failed", { id: toastId, description: message });
      return null;
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  return { pending, error, submit };
}
