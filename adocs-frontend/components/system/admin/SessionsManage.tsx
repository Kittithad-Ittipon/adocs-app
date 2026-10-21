"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Globe, LoaderCircle, LogOut, Monitor, RefreshCw, Users, WifiOff } from "lucide-react";
import { toast } from "sonner";
import LoadingSection from "@/components/feedback/LoadingSection";
import SearchInput from "@/components/system/shared/SearchInput";
import SessionRecords, { type LoginSession } from "@/components/system/shared/SessionRecords";
import StatCard from "@/components/system/shared/StatCard";
import SystemPage from "@/components/system/shared/SystemPage";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PresenceFilter = "all" | "online" | "offline";

export default function SessionsManage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [presenceFilter, setPresenceFilter] = useState<PresenceFilter>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<LoginSession | null>(null);
  const [closing, setClosing] = useState(false);
  const requestVersion = useRef(0);

  const loadSessions = useCallback(async (signal?: AbortSignal) => {
    const version = ++requestVersion.current;
    try {
      const response = await fetch("/api/sessions", { cache: "no-store", signal });
      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load sessions.");
      if (version === requestVersion.current && !signal?.aborted) {
        setSessions(data);
        setError("");
      }
    } catch (failure) {
      if (version === requestVersion.current && !signal?.aborted) {
        setError(failure instanceof Error ? failure.message : "Unable to load sessions.");
      }
    } finally {
      if (version === requestVersion.current && !signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();
    void loadSessions(controller.signal);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadSessions(controller.signal);
    }, 30_000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, [loadSessions]);

  const groups = useMemo(() => {
    const grouped = new Map<string, { user: LoginSession; devices: LoginSession[] }>();
    for (const session of sessions) {
      const group = grouped.get(session.user_id);
      if (group) group.devices.push(session);
      else grouped.set(session.user_id, { user: session, devices: [session] });
    }
    const priority = (session: LoginSession) => session.status === "online" ? 0 : session.can_revoke ? 1 : 2;
    for (const group of grouped.values()) {
      group.devices.sort((first, second) => priority(first) - priority(second));
    }
    return [...grouped.values()];
  }, [sessions]);
  const onlineUsers = groups.filter((group) => group.devices.some((session) => session.status === "online")).length;
  const onlineSessions = sessions.filter((session) => session.status === "online").length;
  const query = search.trim().toLowerCase();
  const filtered = groups.filter(({ user, devices }) => {
    const online = devices.some((session) => session.status === "online");
    return (presenceFilter === "all" || online === (presenceFilter === "online")) &&
      [user.username, user.email, ...devices.flatMap((device) => [device.ip_address, device.browser, device.device, device.os, device.status])]
        .some((value) => value.toLowerCase().includes(query));
  });

  function toggle(userId: string) {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(userId)) next.delete(userId); else next.add(userId);
      return next;
    });
  }

  async function closeSession() {
    if (!selected || closing || !selected.can_revoke) return;
    setClosing(true);
    try {
      const response = await fetch(`/api/sessions/${encodeURIComponent(selected.id)}`, { method: "DELETE" });
      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }
      const data = await response.json();
      if (!response.ok && response.status !== 404) throw new Error(data.error || "Unable to close session.");
      ++requestVersion.current;
      setSessions((previous) => previous.filter((session) => session.id !== selected.id));
      setSelected(null);
      toast.success(response.status === 404 ? "Session already closed." : "Session closed.");
      if (data.is_current) {
        router.replace("/login");
        router.refresh();
      } else {
        await loadSessions();
      }
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : "Unable to close session.");
    } finally {
      setClosing(false);
    }
  }

  return (
    <SystemPage
      title="Sessions"
      description="Users, devices and login activity."
      actions={<span role="status" className="inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs text-muted-foreground">
        <span className={cn("size-1.5 rounded-full", error ? "bg-amber-500" : "bg-emerald-500")} aria-hidden="true" />
        {error ? "Update interrupted" : "Auto refresh · 30s"}
      </span>}
    >
      <LoadingSection loading={loading} stats={3}>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">{[
            { label: "Online users", value: onlineUsers, icon: Users },
            { label: "Online sessions", value: onlineSessions, icon: Monitor },
            { label: "Offline sessions", value: sessions.length - onlineSessions, icon: WifiOff },
          ].map((item) => <StatCard key={item.label} {...item} />)}</div>
          {error && <div role="alert" className="rounded-lg border border-destructive/30 px-4 py-3 text-sm text-destructive">{error} Use Refresh to try again. Previously loaded sessions may be out of date.</div>}
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput value={search} onChange={setSearch} placeholder="Search users, IPs or browsers" label="Search user, IP, browser or device" className="min-w-0 flex-1 sm:max-w-sm sm:flex-none" />
              <div role="group" aria-label="Filter users by status" className="flex items-center rounded-md border p-[3px] max-sm:order-last">{[
                { value: "all" as const, label: "All", count: groups.length },
                { value: "online" as const, label: "Online", count: onlineUsers },
                { value: "offline" as const, label: "Offline", count: groups.length - onlineUsers },
              ].map((filter) => <Button key={filter.value} type="button" size="xs" variant="ghost" aria-pressed={presenceFilter === filter.value} onClick={() => setPresenceFilter(filter.value)} className={cn("h-7 gap-1.5 px-2.5 text-muted-foreground", presenceFilter === filter.value && "bg-muted text-foreground")}>
                {filter.label}<span className="tabular-nums text-muted-foreground">{filter.count}</span>
              </Button>)}</div>
              <Button type="button" variant="outline" disabled={refreshing || closing} onClick={() => { setRefreshing(true); void loadSessions(); }} aria-label="Refresh sessions" className="shrink-0 max-sm:size-9 max-sm:px-0 sm:ml-auto"><RefreshCw className={refreshing ? "motion-safe:animate-spin" : ""} aria-hidden="true" /><span className="hidden sm:inline">Refresh</span></Button>
            </div>
            <SessionRecords records={filtered} expanded={expanded} onToggle={toggle} onClose={setSelected} closing={closing} />
            {filtered.length === 0 && (query || presenceFilter !== "all") && <div className="flex justify-center"><Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(""); setPresenceFilter("all"); }}>Clear filters</Button></div>}
            <p className="flex items-start gap-2 text-xs text-muted-foreground"><Activity className="mt-px size-3.5 shrink-0" aria-hidden="true" />Online: valid token and activity within 2 minutes. Expand a user to manage their devices.</p>
          </div>
        </div>
      </LoadingSection>
      <AlertDialog open={selected !== null} onOpenChange={(open) => { if (!open && !closing) setSelected(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out this device?</AlertDialogTitle>
            <AlertDialogDescription>{selected?.is_current ? "This will sign you out of your current session." : "Sign out this device. Other sessions will stay active."}</AlertDialogDescription>
          </AlertDialogHeader>
          {selected && <div className="min-w-0 space-y-2 rounded-lg border p-3 text-sm"><p className="truncate font-medium" title={selected.username}>{selected.username}</p><div className="flex min-w-0 items-center gap-2 text-muted-foreground"><Monitor className="size-4 shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1 truncate" title={`${selected.device} · ${selected.browser}`}>{selected.device} · {selected.browser}</span></div><div className="flex min-w-0 items-center gap-2 text-muted-foreground"><Globe className="size-4 shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1 truncate font-mono text-xs" title={selected.ip_address}>{selected.ip_address}</span></div></div>}
          <AlertDialogFooter><AlertDialogCancel disabled={closing}>Cancel</AlertDialogCancel><Button variant="destructive" disabled={closing} onClick={() => void closeSession()}>{closing ? <LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> : <LogOut aria-hidden="true" />}{closing ? "Logging out..." : "Log out device"}</Button></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SystemPage>
  );
}
