"use client";

import { LoaderCircle, Mail, RotateCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";
import AuthFrame from "@/components/auth/AuthFrame";
import PasswordField from "@/components/auth/PasswordField";
import { useAuthRequest } from "@/components/auth/useAuthRequest";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type RecoveryResponse = { error?: string; message?: string; href?: string; retry_after?: number };

export default function ForgotRePasswordForm() {
  const [otpValue, setOtpValue] = useState("");
  const [password, setPassword] = useState("");
  const { pending, submit } = useAuthRequest();
  const [resending, setResending] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [resendError, setResendError] = useState("");
  const requestInFlight = useRef(false);
  const resendAt = useRef(0);
  const busy = pending || resending;
  const coolingDown = resendSeconds > 0;

  function startCooldown(seconds: number) {
    resendAt.current = Date.now() + seconds * 1000;
    setResendSeconds(seconds);
  }

  useEffect(() => {
    const controller = new AbortController();
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/resend", { cache: "no-store", signal: controller.signal });
        const data: RecoveryResponse = await response.json();
        if (data.href === "/forgot") {
          window.location.href = data.href;
          return;
        }
        if (response.ok) startCooldown(data.retry_after || 0);
        else setResendError(data.error || "Unable to check your recovery session. Please try again.");
      } catch {
        if (!controller.signal.aborted) setResendError("Unable to check your recovery session. Please try again.");
      } finally {
        if (!controller.signal.aborted) setCheckingSession(false);
      }
    }
    void checkSession();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!coolingDown) return;
    const timer = window.setInterval(() => {
      setResendSeconds(Math.max(0, Math.ceil((resendAt.current - Date.now()) / 1000)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [coolingDown]);

  async function toReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otpValue.length !== 6 || requestInFlight.current) return;
    requestInFlight.current = true;
    try {
      const data = await submit("/api/auth/reset", { otpValue, password }, "Password reset", "PATCH");
      if (data) window.location.href = "/login";
    } finally {
      requestInFlight.current = false;
    }
  }

  async function resendOtp() {
    if (requestInFlight.current || checkingSession || coolingDown) return;
    requestInFlight.current = true;
    setResending(true);
    setResendError("");
    const toastId = toast.loading("Sending a new code...");
    try {
      const response = await fetch("/api/auth/resend", { method: "POST" });
      const data: RecoveryResponse = await response.json();
      if (!response.ok) {
        if (data.retry_after) startCooldown(data.retry_after);
        const message = data.error || "Unable to send a new code. Please try again.";
        setResendError(message);
        toast.error("Unable to resend OTP", { id: toastId, description: message });
        if (data.href === "/forgot") window.location.href = data.href;
        return;
      }
      setOtpValue("");
      startCooldown(data.retry_after || 60);
      toast.success("OTP sent again", { id: toastId, description: data.message });
    } catch {
      const message = "Unable to connect to the server. Please try again.";
      setResendError(message);
      toast.error("Unable to resend OTP", { id: toastId, description: message });
    } finally {
      requestInFlight.current = false;
      setResending(false);
    }
  }

  return (
    <AuthFrame loading={busy} label="Password reset" footer={<Button asChild variant="link" size="sm"><Link href="/register">Register</Link></Button>}>
      <form onSubmit={toReset} aria-busy={busy} className="space-y-6">
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel htmlFor="otp"><Mail className="size-4" aria-hidden="true" /> OTP</FieldLabel>
            <InputOTP id="otp" name="otpValue" maxLength={6} minLength={6} required pattern={REGEXP_ONLY_DIGITS} autoComplete="one-time-code" inputMode="numeric" value={otpValue} onChange={setOtpValue} disabled={busy} aria-describedby="otp-help" containerClassName="w-full">
              <InputOTPGroup className="w-full">{Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} className="h-12 flex-1 text-lg" />)}</InputOTPGroup>
            </InputOTP>
            <FieldDescription id="otp-help" className="text-xs">Enter the 6-digit code from your email. Valid for 5 minutes.</FieldDescription>
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <span className="text-xs text-muted-foreground">Didn&apos;t receive a code?</span>
              <Button type="button" variant="link" size="sm" onClick={resendOtp} disabled={busy || checkingSession || coolingDown} className="h-8 px-0 text-xs">
                {resending ? <><LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> Sending...</> : <><RotateCw aria-hidden="true" /> {checkingSession ? "Checking..." : coolingDown ? `Resend in ${resendSeconds}s` : "Resend OTP"}</>}
              </Button>
            </div>
            {resendError && <p role="alert" className="text-xs text-destructive">{resendError}</p>}
          </Field>
          <PasswordField value={password} onChange={setPassword} disabled={busy} newPassword label="New password" />
        </FieldGroup>
        <Button type="submit" size="lg" disabled={busy || otpValue.length !== 6} className="h-11 w-full">{pending ? <><LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> Resetting password...</> : <><ShieldCheck aria-hidden="true" /> Reset password</>}</Button>
      </form>
    </AuthFrame>
  );
}
