"use client";
import BrandMark from "@/components/BrandMark";
import NavUser from "@/components/system/shared/NavUser";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar } from "@/components/ui/sidebar";
import { Box, FileText, LayoutDashboard, Monitor, Upload, UserCircle, Users } from "lucide-react";
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
    ...(role === "admin" ? [{ label: "Sessions", href: "/sessions", icon: Monitor, section: "Main" }] : []),
    { label: "Logs", href: prefix + "/logs", icon: FileText, section: "Main" },
    { label: "Profile", href: prefix + "/profile", icon: UserCircle, section: "Account" },
  ];
}

export default function SystemNavigation({ role }: { role: SystemRole }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeMobile = () => { if (isMobile) setOpenMobile(false); };
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-(--header-height) shrink-0 justify-center border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="ADOCS home">
              <Link href="/" onClick={closeMobile} aria-label="ADOCS home">
                <BrandMark />
                <span className="grid flex-1 leading-tight"><span className="truncate text-sm font-semibold tracking-tight">ADOCS</span><span className="truncate text-xs text-muted-foreground">{role === "admin" ? "Admin workspace" : "Your account"}</span></span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label={role === "admin" ? "Admin navigation" : "User navigation"}>
        {["Main", "Account"].map((section) => (
          <SidebarGroup key={section}>
            <SidebarGroupLabel>{section}</SidebarGroupLabel>
            <SidebarMenu>
              {systemMenu(role).filter((item) => item.section === section).map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label} className="h-9">
                      <Link href={item.href} onClick={closeMobile} aria-current={active ? "page" : undefined}><Icon aria-hidden="true" /><span>{item.label}</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
        </nav>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser role={role} onNavigate={closeMobile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
