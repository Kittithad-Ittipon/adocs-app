"use client";
import Topbar from "@/components/system/Topbar";
import SessionMonitor from "@/components/system/shared/SessionMonitor";
import SystemNavigation, { type SystemRole } from "@/components/system/shared/SystemNavigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

export default function SystemShell({ role, defaultOpen = true, children }: { role: SystemRole; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <TooltipProvider>
      <SessionMonitor />
      <SidebarProvider defaultOpen={defaultOpen}>
        <SystemNavigation role={role} />
        <SidebarInset className="min-w-0">
          <Topbar role={role} />
          <div className="flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
