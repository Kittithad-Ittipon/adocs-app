"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Globe, LoaderCircle, LogOut, Monitor, RefreshCw, Search, Users, WifiOff, X } from "lucide-react";
import { toast } from "sonner";
import LoadingSection from "@/components/feedback/LoadingSection";
import SessionRecords, { type LoginSession } from "@/components/system/shared/SessionRecords";
import SystemPageHeader from "@/components/system/shared/SystemPageHeader";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    <LoadingSection loading={loading} layout="table">
    <div className="mx-auto min-w-0 w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SystemPageHeader title="Sessions" description="Users, devices and login activity." />
        <span role="status" className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <span className={cn("size-1.5 rounded-full", error ? "bg-amber-500" : "bg-emerald-500")} aria-hidden="true" />
          {error ? "Update interrupted" : "Auto refresh · 30s"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">{[
        { label: "Online users", value: onlineUsers, description: "Currently active accounts", icon: Users, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
        { label: "Online sessions", value: onlineSessions, description: "Devices active in the last 2 min", icon: Monitor, tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
        { label: "Offline sessions", value: sessions.length - onlineSessions, description: "Signed in, currently inactive", icon: WifiOff, tone: "bg-muted text-muted-foreground" },
      ].map((item) => <Card key={item.label} className="min-w-0 gap-0 py-3 shadow-none sm:py-4">
        <CardContent className="space-y-2 px-3 sm:px-4">
          <div className="flex items-center justify-between gap-2"><p className="min-h-10 text-xs leading-5 text-muted-foreground sm:min-h-0 sm:text-sm">{item.label}</p><span className={cn("hidden size-9 shrink-0 items-center justify-center rounded-lg sm:flex", item.tone)}><item.icon className="size-4" aria-hidden="true" /></span></div>
          <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{item.value}</p>
          <p className="hidden text-xs text-muted-foreground lg:block">{item.description}</p>
        </CardContent>
      </Card>)}</div>
      {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error} Use Refresh to try again. Previously loaded sessions may be out of date.</div>}
      <div className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-none">
        <div className="space-y-4 border-b p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="relative min-w-0 flex-1 sm:max-w-md">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users, IPs or browsers" aria-label="Search user, IP, browser or device" className="h-10 bg-background pl-9 pr-9 shadow-none" />
              {search && <Button type="button" variant="ghost" size="icon-sm" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-1 top-1"><X className="size-3.5" aria-hidden="true" /></Button>}
            </div>
            <Button type="button" variant="outline" disabled={refreshing || closing} onClick={() => { setRefreshing(true); void loadSessions(); }} aria-label="Refresh sessions" title="Refresh sessions" className="size-10 shrink-0 px-0 sm:ml-auto sm:w-auto sm:px-3"><RefreshCw className={refreshing ? "motion-safe:animate-spin" : ""} aria-hidden="true" /><span className="hidden sm:inline">Refresh</span></Button>
          </div>
          <div role="group" aria-label="Filter users by status" className="flex flex-wrap items-center gap-1.5">{[
            { value: "all" as const, label: "All", count: groups.length },
            { value: "online" as const, label: "Online", count: onlineUsers },
            { value: "offline" as const, label: "Offline", count: groups.length - onlineUsers },
          ].map((filter) => <Button key={filter.value} type="button" size="sm" variant="ghost" aria-pressed={presenceFilter === filter.value} onClick={() => setPresenceFilter(filter.value)} className={cn("gap-2 rounded-lg px-2.5 text-xs text-muted-foreground", presenceFilter === filter.value && "bg-sky-500/10 text-sky-700 hover:bg-sky-500/15 hover:text-sky-700 dark:text-sky-300 dark:hover:text-sky-300")}>
            {filter.label}<span className="rounded bg-background/70 px-1.5 py-0.5 text-[10px] tabular-nums">{filter.count}</span>
          </Button>)}</div>
        </div>
        <div className="min-w-0 p-3 sm:p-5">
          <SessionRecords records={filtered} expanded={expanded} onToggle={toggle} onClose={setSelected} closing={closing} />
          {filtered.length === 0 && (query || presenceFilter !== "all") && <div className="mt-3 flex justify-center"><Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(""); setPresenceFilter("all"); }}>Clear filters</Button></div>}
        </div>
        <div className="flex items-start gap-2 border-t bg-muted/20 px-4 py-3 text-xs leading-5 text-muted-foreground sm:px-5"><Activity className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /><p>Online: valid token and activity within 2 minutes. Expand a user to manage their devices.</p></div>
      </div>
      <AlertDialog open={selected !== null} onOpenChange={(open) => { if (!open && !closing) setSelected(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><LogOut className="size-5" aria-hidden="true" /></span>Log out this device?</AlertDialogTitle>
            <AlertDialogDescription>{selected?.is_current ? "This will sign you out of your current session." : "Sign out this device. Other sessions will stay active."}</AlertDialogDescription>
          </AlertDialogHeader>
          {selected && <div className="min-w-0 space-y-3 rounded-xl bg-muted/50 p-4 text-sm"><p className="truncate font-medium" title={selected.username}>{selected.username}</p><div className="flex min-w-0 items-center gap-2"><Monitor className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="min-w-0 flex-1 truncate" title={`${selected.device} · ${selected.browser}`}>{selected.device} · {selected.browser}</span></div><div className="flex min-w-0 items-center gap-2"><Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="min-w-0 flex-1 truncate font-mono text-xs" title={selected.ip_address}>{selected.ip_address}</span></div></div>}
          <AlertDialogFooter className="border-t pt-4"><AlertDialogCancel disabled={closing}>Cancel</AlertDialogCancel><Button variant="destructive" disabled={closing} onClick={() => void closeSession()}>{closing ? <LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> : <LogOut aria-hidden="true" />}{closing ? "Logging out..." : "Log out device"}</Button></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </LoadingSection>
  );
}
