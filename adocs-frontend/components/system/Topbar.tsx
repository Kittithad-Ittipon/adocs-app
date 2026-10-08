"use client";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, LoaderCircle, LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Account = { username: string; email: string; role: string };

export default function Topbar() {
  const router = useRouter();
  const { loading, run } = useLoadingTasks(["profile"]);
  const [account, setAccount] = useState<Account>({ username: "", email: "", role: "" });
  const [loggingOut, setLoggingOut] = useState(false);
  const [open, setOpen] = useState(false);
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
  if (loading) return <div className="flex h-14 items-center gap-3" role="status" aria-label="Loading account"><Skeleton className="size-12 rounded-full" /><Skeleton className="hidden h-5 w-32 sm:block" /></div>;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-14 gap-3 rounded-xl px-1.5 sm:px-3" aria-label="Open account menu">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/15 to-teal-500/15 text-lg font-semibold text-sky-700 dark:text-sky-300">{account.username ? account.username.charAt(0).toUpperCase() : <UserCircle className="size-4" />}</span>
          <span className="hidden min-w-0 max-w-64 text-left sm:block"><span className="block truncate text-base font-semibold sm:text-lg">{account.username || "Account"}</span><span className="block text-xs font-normal capitalize text-muted-foreground">{account.role}</span></span>
          <ChevronDown className="hidden size-3.5 text-muted-foreground transition-transform group-data-[state=open]/button:rotate-180 sm:block" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-64 rounded-xl p-2 motion-reduce:animate-none">
        <div className="border-b px-2 pb-3 pt-2"><p className="truncate text-base font-semibold">{account.username || "Account"}</p><p className="mt-1 truncate text-xs text-muted-foreground" title={account.email}>{account.email}</p></div>
        <div className="space-y-1 pt-2">
          <Button asChild variant="ghost" className="h-11 w-full justify-start gap-3 rounded-lg px-3 py-2.5"><Link href={account.role === "admin" ? "/profile" : "/users/profile"} onClick={() => setOpen(false)}><UserCircle />My profile</Link></Button>
          <Button variant="ghost" disabled={loggingOut} onClick={logout} className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive">{loggingOut ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <LogOut />}{loggingOut ? "Logging out..." : "Log out"}</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
