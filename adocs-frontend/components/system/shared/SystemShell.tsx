"use client";
import { ThemeToggle } from "@/components/ThemeToggle";
import Topbar from "@/components/system/Topbar";
import SessionMonitor from "@/components/system/shared/SessionMonitor";
import SystemNavigation, { systemMenu, type SystemRole } from "@/components/system/shared/SystemNavigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

export default function SystemShell({ role, children }: { role: SystemRole; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const page = systemMenu(role).find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  return (
    <TooltipProvider>
      <SessionMonitor />
      <div className="flex h-dvh w-full overflow-hidden bg-muted/20 font-sans text-foreground">
        <aside className={cn("hidden shrink-0 lg:block motion-safe:transition-[width] motion-safe:duration-200", collapsed ? "w-18" : "w-60")}>
          <SystemNavigation role={role} isCollapsed={collapsed} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-22 sm:h-24 shrink-0 items-center justify-between gap-3 bg-card/90 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</Button>
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation"><Menu /></Button></SheetTrigger>
                <SheetContent side="left" className="gap-0 p-0 data-[side=left]:w-72 motion-reduce:animate-none motion-reduce:transition-none">
                  <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
                  <SheetDescription className="sr-only">Navigate your ADOCS workspace.</SheetDescription>
                  <SystemNavigation role={role} onNavigate={() => setMobileOpen(false)} />
                </SheetContent>
              </Sheet>
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{page?.label ?? "ADOCS"}</p></div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3"><ThemeToggle /><Topbar /></div>
          </header>
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
