"use client";

import { AtSign, Database, LoaderCircle, UserPlus, UserRound } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import AuthFrame from "@/components/auth/AuthFrame";
import PasswordField from "@/components/auth/PasswordField";
import { useAuthRequest } from "@/components/auth/useAuthRequest";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dbState, setDbState] = useState(false);
  const { pending, error, submit } = useAuthRequest();

  async function toRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = await submit("/api/users", { username: username.trim(), email: email.trim(), password, dbState }, "Register Success");
    if (data) window.location.href = "/login";
  }

  return (
    <AuthFrame loading={pending} label="Register" footer={<div className="flex items-center gap-1"><span>Already have an account?</span><Button asChild variant="link" size="sm" className="px-1"><Link href="/login">Login</Link></Button></div>}>
      <form onSubmit={toRegister} aria-busy={pending} className="space-y-6">
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel htmlFor="username"><UserRound className="size-4" aria-hidden="true" /> Username</FieldLabel>
            <Input id="username" name="username" required maxLength={15} pattern="[a-zA-Z0-9]+" title="Use letters and numbers only, up to 15 characters" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Choose a username" value={username} onChange={(event) => setUsername(event.target.value)} disabled={pending} className="h-11" />
          </Field>
          <Field>
            <FieldLabel htmlFor="email"><AtSign className="size-4" aria-hidden="true" /> Email</FieldLabel>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} className="h-11" />
          </Field>
          <PasswordField value={password} onChange={setPassword} disabled={pending} newPassword />
          <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
            <Checkbox id="managed-database" checked={dbState} onCheckedChange={(checked) => setDbState(checked === true)} disabled={pending} aria-describedby="database-description" className="mt-0.5" />
            <div className="space-y-2"><FieldLabel htmlFor="managed-database"><Database className="size-4" aria-hidden="true" /> Enable Managed Database</FieldLabel><FieldDescription id="database-description" className="text-xs">Create a database user and access phpMyAdmin with your username and password.</FieldDescription></div>
          </div>
        </FieldGroup>
        <p role="alert" className="text-sm text-destructive">{error}</p>
        <Button type="submit" size="lg" disabled={pending} className="h-11 w-full">{pending ? <><LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> Creating account...</> : <><UserPlus aria-hidden="true" /> Register</>}</Button>
      </form>
    </AuthFrame>
  );
}
