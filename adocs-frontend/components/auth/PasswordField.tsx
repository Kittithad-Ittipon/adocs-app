"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function PasswordField({ value, onChange, disabled, newPassword = false, label = "Password", extra }: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  newPassword?: boolean;
  label?: string;
  extra?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor="password"><LockKeyhole className="size-4" aria-hidden="true" /> {label}</FieldLabel>
        {extra}
      </div>
      <div className="relative">
        <Input id="password" name="password" type={visible ? "text" : "password"} placeholder={newPassword ? "Create a password" : "Enter your password"} autoComplete={newPassword ? "new-password" : "current-password"} minLength={newPassword ? 8 : undefined} required value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="h-11 pr-12" />
        <Button type="button" variant="ghost" size="icon" disabled={disabled} onClick={() => setVisible((previous) => !previous)} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} aria-controls="password" className="absolute right-1 top-1 text-muted-foreground transition-colors active:translate-y-0">
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      {newPassword && <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>}
    </Field>
  );
}
