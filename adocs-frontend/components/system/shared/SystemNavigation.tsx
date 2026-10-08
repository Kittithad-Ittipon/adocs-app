"use client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion"; import { useId } from "react";
import { cn } from "@/lib/utils";
import { Box, FileText, Home, LayoutDashboard, Rocket, Upload, UserCircle, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type SystemRole = "admin" | "user";
export function systemMenu(role: SystemRole) {
  const prefix = role === "admin" ? "" : "/users";
  return [
    { label: "Dashboard", href: prefix + "/dashboard", icon: LayoutDashboard, section: "Main" },
    { label: "Upload", href: prefix + "/upload", icon: Upload, section: "Main" },
    { label: "Containers", href: prefix + "/container-manage", icon: Box, section: "Main" },
    ...(role === "admin" ? [{ label: "Users", href: "/users-manage", icon: Users, section: "Main" }] : []),
    { label: "Logs", href: prefix + "/logs", icon: FileText, section: "Main" },
    { label: "Profile", href: prefix + "/profile", icon: UserCircle, section: "Account" },
  ];
}

export default function SystemNavigation({ role, isCollapsed = false, onNavigate }: {
  role: SystemRole; isCollapsed?: boolean; onNavigate?: () => void;
}) {
  const pathname = usePathname(); const navigationId = useId(); const reducedMotion = useReducedMotion();
  return (
    <LayoutGroup id={navigationId}>
    <div className="flex h-full min-h-0 flex-col bg-card">
      <Link href="/" onClick={onNavigate} aria-label="ADOCS home" className={cn("flex h-22 sm:h-24 shrink-0 items-center gap-3 px-5 outline-none focus-visible:ring-2 focus-visible:ring-ring", isCollapsed && "justify-center px-2")}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 text-white shadow-sm"><Rocket className="size-5" aria-hidden="true" /></span>
        {!isCollapsed && <span className="min-w-0"><span className="block bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 bg-clip-text text-lg font-bold tracking-tight text-transparent dark:from-sky-400">ADOCS</span><span className="block text-[11px] text-muted-foreground">{role === "admin" ? "Admin workspace" : "Your account"}</span></span>}
      </Link>
      <motion.nav layoutScroll aria-label={role === "admin" ? "Admin navigation" : "User navigation"} className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {["Main", "Account"].map((section) => (
          <div key={section} className="space-y-1">
            {!isCollapsed && <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{section}</p>}
            {systemMenu(role).filter((item) => item.section === section).map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              const link = <Link href={item.href} onClick={onNavigate} aria-label={isCollapsed ? item.label : undefined} aria-current={active ? "page" : undefined} className={cn("group relative isolate flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none motion-safe:transition-colors motion-safe:duration-200 focus-visible:ring-2 focus-visible:ring-ring", active ? "text-sky-700 dark:text-sky-300" : "text-muted-foreground hover:bg-muted hover:text-foreground", isCollapsed && "justify-center px-0")}>{active && (reducedMotion ? <span className="pointer-events-none absolute inset-0 rounded-lg bg-sky-500/10" aria-hidden="true" /> : <motion.span layoutId="active-menu" initial={false} transition={{ type: "spring", stiffness: 420, damping: 38 }} className="pointer-events-none absolute inset-0 rounded-lg bg-sky-500/10" aria-hidden="true" />)}<Icon className="relative z-10 size-4 shrink-0" aria-hidden="true" />{!isCollapsed && <><span className="relative z-10 flex-1">{item.label}</span>{active && <span className="relative z-10 size-1.5 rounded-full bg-sky-500" aria-hidden="true" />}</>}</Link>;
              return isCollapsed ? <Tooltip key={item.href}><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></Tooltip> : <div key={item.href}>{link}</div>;
            })}
          </div>
        ))}
      </motion.nav>
      <div className="shrink-0 border-t p-3">
        <Link href="/" onClick={onNavigate} aria-label="Back to website" className={cn("flex h-10 items-center gap-3 rounded-lg px-3 text-xs text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring", isCollapsed && "justify-center px-0")}><Home className="size-4" aria-hidden="true" />{!isCollapsed && "Back to website"}</Link>
      </div>
    </div></LayoutGroup>
  );
}
