"use client";

import { LoaderCircle, Send, UserRound } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import AuthFrame from "@/components/auth/AuthFrame";
import { useAuthRequest } from "@/components/auth/useAuthRequest";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ForgotForm() {
  const [username, setUsername] = useState("");
  const { pending, submit } = useAuthRequest();

  async function toForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = await submit("/api/auth/forgot", { username: username.trim() }, "OTP sent");
    if (data) window.location.href = "/forgot-repassword";
  }

  return (
    <AuthFrame loading={pending} label="Password recovery" footer={<><Button asChild variant="link" size="sm"><Link href="/login">Back to Login</Link></Button><div className="flex items-center gap-1"><span>Don&apos;t have an account?</span><Button asChild variant="link" size="sm" className="px-1"><Link href="/register">Register</Link></Button></div></>}>
      <form onSubmit={toForgot} aria-busy={pending} className="space-y-6">
        <Field>
          <FieldLabel htmlFor="username"><UserRound className="size-4" aria-hidden="true" /> Username or Email</FieldLabel>
          <Input id="username" name="username" required autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Enter your username or email" value={username} onChange={(event) => setUsername(event.target.value)} disabled={pending} aria-describedby="otp-description" className="h-11" />
          <FieldDescription id="otp-description" className="text-xs">We&apos;ll send an OTP to the email address on your account.</FieldDescription>
        </Field>
        <Button type="submit" size="lg" disabled={pending} className="h-11 w-full">{pending ? <><LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> Sending code...</> : <>Send OTP <Send aria-hidden="true" /></>}</Button>
      </form>
    </AuthFrame>
  );
}
