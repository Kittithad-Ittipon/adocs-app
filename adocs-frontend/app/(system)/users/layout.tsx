import type { ReactNode } from "react";
import { cookies } from "next/headers";
import SystemShell from "@/components/system/shared/SystemShell";
export default async function SystemLayout({ children }: { children: ReactNode }) {
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false";
  return <SystemShell role="user" defaultOpen={defaultOpen}>{children}</SystemShell>;
}
