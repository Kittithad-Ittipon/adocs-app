import type { ReactNode } from "react";
import SystemShell from "@/components/system/shared/SystemShell";
export default function SystemLayout({ children }: { children: ReactNode }) {
  return <SystemShell role="user">{children}</SystemShell>;
}
