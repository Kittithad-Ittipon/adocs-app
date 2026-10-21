"use client";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";
import type { SystemRole } from "@/components/system/shared/SystemNavigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronsUpDown, House, LoaderCircle, LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Account = { username: string; email: string; role: string };

function Identity({ account }: { account: Account }) {
  return (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium uppercase text-foreground">{account.username ? account.username.slice(0, 2) : <UserCircle className="size-4" aria-hidden="true" />}</span>
      <span className="grid min-w-0 flex-1 text-left leading-tight">
        <span className="truncate text-sm font-medium">{account.username || "Account"}</span>
        <span className="truncate text-xs text-muted-foreground" title={account.email}>{account.email}</span>
      </span>
    </>
  );
}

export default function NavUser({ role, onNavigate }: { role: SystemRole; onNavigate: () => void }) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { loading, run } = useLoadingTasks(["profile"]);
  const [account, setAccount] = useState<Account>({ username: "", email: "", role: "" });
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    void run("profile", async () => {
      try {
        const response = await fetch("/api/users/profile");
        if (!response.ok) throw new Error("Unable to load profile");
        setAccount(await response.json());
      } catch {
        toast.error("Unable to load your account.");
      }
    });
  }, [run]);
  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "DELETE" });
      if (!response.ok) throw new Error("Logout failed");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Unable to log out. Please try again.");
      setLoggingOut(false);
    }
  }
  if (loading) {
    return (
      <div role="status" aria-label="Loading account" className="flex h-12 items-center gap-2 px-2 group-data-[collapsible=icon]:px-0">
        <Skeleton className="size-8 shrink-0 rounded-lg motion-reduce:animate-none" />
        <div className="grid flex-1 gap-1.5 group-data-[collapsible=icon]:hidden"><Skeleton className="h-3 w-20 motion-reduce:animate-none" /><Skeleton className="h-2.5 w-28 motion-reduce:animate-none" /></div>
      </div>
    );
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" aria-label="Open account menu" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Identity account={account} />
              <ChevronsUpDown className="ml-auto text-muted-foreground" aria-hidden="true" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" sideOffset={8} className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg">
            <DropdownMenuLabel className="flex items-center gap-2 px-1 py-1.5 font-normal"><Identity account={account} /></DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild><Link href={role === "admin" ? "/profile" : "/users/profile"} onClick={onNavigate}><UserCircle aria-hidden="true" />My profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/" onClick={onNavigate}><House aria-hidden="true" />Back to website</Link></DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={loggingOut} onSelect={(event) => { event.preventDefault(); void logout(); }}>
              {loggingOut ? <LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> : <LogOut aria-hidden="true" />}{loggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
