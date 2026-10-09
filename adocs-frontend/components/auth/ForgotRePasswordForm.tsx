"use client";

import { LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import AuthFrame from "@/components/auth/AuthFrame";
import PasswordField from "@/components/auth/PasswordField";
import { useAuthRequest } from "@/components/auth/useAuthRequest";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function ForgotRePasswordForm() {
  const [otpValue, setOtpValue] = useState("");
  const [password, setPassword] = useState("");
  const { pending, submit } = useAuthRequest();

  async function toReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otpValue.length !== 6) return;
    const data = await submit("/api/auth/reset", { otpValue, password }, "Password reset", "PATCH");
    if (data) window.location.href = "/login";
  }

  return (
    <AuthFrame loading={pending} label="Password reset" footer={<Button asChild variant="link" size="sm"><Link href="/register">Register</Link></Button>}>
      <form onSubmit={toReset} aria-busy={pending} className="space-y-6">
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel htmlFor="otp"><Mail className="size-4" aria-hidden="true" /> OTP</FieldLabel>
            <InputOTP id="otp" name="otpValue" maxLength={6} minLength={6} required pattern={REGEXP_ONLY_DIGITS} autoComplete="one-time-code" inputMode="numeric" value={otpValue} onChange={setOtpValue} disabled={pending} aria-describedby="otp-help" containerClassName="w-full">
              <InputOTPGroup className="w-full">{Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} className="h-12 flex-1 text-lg" />)}</InputOTPGroup>
            </InputOTP>
            <FieldDescription id="otp-help" className="text-xs">Enter the 6-digit code sent to your email.</FieldDescription>
          </Field>
          <PasswordField value={password} onChange={setPassword} disabled={pending} newPassword label="New password" />
        </FieldGroup>
        <Button type="submit" size="lg" disabled={pending || otpValue.length !== 6} className="h-11 w-full">{pending ? <><LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> Resetting password...</> : <><ShieldCheck aria-hidden="true" /> Reset password</>}</Button>
      </form>
    </AuthFrame>
  );
}
