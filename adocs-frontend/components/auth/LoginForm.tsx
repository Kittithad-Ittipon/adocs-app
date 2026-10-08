"use client";

import { ArrowRight, LoaderCircle, UserRound } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import AuthFrame from "@/components/auth/AuthFrame";
import PasswordField from "@/components/auth/PasswordField";
import { useAuthRequest } from "@/components/auth/useAuthRequest";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { pending, error, submit } = useAuthRequest();

  async function toLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = await submit("/api/auth/login", { username: username.trim(), password }, "Login Success");
    if (data) window.location.href = data.href || "/";
  }

  return (
    <AuthFrame loading={pending} footer={<div className="flex items-center gap-1"><span>Don&apos;t have an account?</span><Button asChild variant="link" size="sm" className="px-1"><Link href="/register">Register</Link></Button></div>}>
      <form onSubmit={toLogin} aria-busy={pending} className="space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username"><UserRound className="size-4" aria-hidden="true" /> Username or Email</FieldLabel>
            <Input id="username" name="username" placeholder="Enter your username or email" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={username} disabled={pending} onChange={(event) => setUsername(event.target.value)} className="h-11" />
          </Field>
          <PasswordField value={password} onChange={setPassword} disabled={pending} extra={<Button asChild variant="link" size="sm" className="h-auto p-0 text-xs"><Link href="/forgot">Forgot password?</Link></Button>} />
        </FieldGroup>
        <p role="alert" className="text-sm text-destructive">{error}</p>
        <Button type="submit" size="lg" disabled={pending} className="h-11 w-full">{pending ? <><LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> Signing in...</> : <>Login <ArrowRight aria-hidden="true" /></>}</Button>
      </form>
    </AuthFrame>
  );
}
