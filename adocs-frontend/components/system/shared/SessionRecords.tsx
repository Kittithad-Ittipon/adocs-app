"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Activity, ChevronDown, ChevronRight, Clock, Globe, LogOut, Monitor, Smartphone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import RecordCollection, { type RecordColumn } from "@/components/system/shared/RecordCollection";
import RecordStatus from "@/components/system/shared/RecordStatus";

export type LoginSession = {
  id: string;
  user_id: string;
  username: string;
  email: string;
  role: string;
  ip_address: string;
  user_agent: string;
  browser: string;
  device: string;
  os: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  revoked_at: string | null;
  status: "online" | "offline";
  can_revoke: boolean;
  is_current: boolean;
};

type SessionGroup = { user: LoginSession; devices: LoginSession[] };

function Presence({ online }: { online: boolean }) {
  return <RecordStatus status={online ? "Online" : "Offline"} tone={online ? "success" : "neutral"} />;
}

function SessionPresence({ session }: { session: LoginSession }) {
  const description = session.status === "online" ? "Active within the last 2 minutes"
    : session.revoked_at ? "Session closed"
    : !session.can_revoke ? "Token expired"
    : "No activity in the last 2 minutes";
  return <span title={description}><Presence online={session.status === "online"} /></span>;
}

function timestamp(value: string) {
  return new Date(value).toLocaleString();
}

function Summary({ values }: { values: string[] }) {
  const unique = [...new Set(values)];
  return <span className="flex min-w-0 items-center gap-1" title={unique.join(", ")}><span className="min-w-0 truncate">{unique[0]}</span>{unique.length > 1 && <span className="shrink-0 text-xs text-muted-foreground">+{unique.length - 1} more</span>}</span>;
}

function DeviceName({ session }: { session: LoginSession }) {
  const Icon = /Mobile|Tablet|iPad/.test(session.device) ? Smartphone : Monitor;
  return <div className="flex min-w-0 items-center gap-2.5"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400"><Icon className="size-4" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium" title={session.device}>{session.device}</p><p className="truncate text-xs text-muted-foreground" title={session.os}>{session.os}</p></div></div>;
}

function UserIdentity({ user, table = false }: { user: LoginSession; table?: boolean }) {
  return <div className="flex min-w-0 items-center gap-2.5">
    <span aria-hidden="true" className={`size-9 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-xs font-semibold uppercase text-sky-700 dark:text-sky-300 ${table ? "hidden @[36rem]/sessions:flex" : "flex"}`}>{user.username.slice(0, 2)}</span>
    <div className="min-w-0 flex-1 space-y-1">
      <p className="truncate text-sm font-medium" title={user.username}>{user.username}</p>
      <p className="truncate text-xs text-muted-foreground" title={user.email}>{user.email || "No email"}</p>
      <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground" title={user.role}>{user.role}</p>
    </div>
  </div>;
}

function DeviceStatus({ session }: { session: LoginSession }) {
  return <div className="flex flex-wrap items-center gap-2"><SessionPresence session={session} />{session.is_current && <span className="rounded-md bg-sky-500/10 px-2 py-1 text-[10px] font-medium text-sky-700 dark:text-sky-300">This device</span>}</div>;
}

function Connection({ sessions }: { sessions: LoginSession[] }) {
  return <div className="min-w-0 space-y-1">
    <p className="text-xs"><Summary values={sessions.map((session) => session.browser)} /></p>
    <p className="font-mono text-xs text-muted-foreground"><Summary values={sessions.map((session) => session.ip_address)} /></p>
  </div>;
}

function SessionTimestamp({ value }: { value: string }) {
  const date = new Date(value);
  return <time dateTime={value} title={timestamp(value)} className="block min-w-0 text-xs">
    <span className="block truncate">{date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</span>
    <span className="block truncate text-muted-foreground">{date.toLocaleTimeString()}</span>
  </time>;
}

function SessionTimes({ session }: { session: LoginSession }) {
  return <dl className="space-y-1.5 text-xs">{[
    { label: "Signed in", value: session.created_at },
    { label: "Last activity", value: session.last_seen_at },
    { label: "Expires", value: session.expires_at },
  ].map((field) => {
    const date = new Date(field.value);
    return <div key={field.label} className="min-w-0 space-y-0.5 @[32rem]/devices:flex @[32rem]/devices:items-center @[32rem]/devices:justify-between @[32rem]/devices:gap-3 @[32rem]/devices:space-y-0">
      <dt className="shrink-0 text-muted-foreground">{field.label}</dt>
      <dd className="min-w-0"><time dateTime={field.value} title={timestamp(field.value)} className="block truncate tabular-nums">{date.toLocaleDateString(undefined, { day: "2-digit", month: "short" })} · {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</time></dd>
    </div>;
  })}</dl>;
}

export default function SessionRecords({ records, expanded, onToggle, onClose, closing, headerContent }: {
  records: SessionGroup[];
  expanded: ReadonlySet<string>;
  onToggle: (userId: string) => void;
  onClose: (session: LoginSession) => void;
  closing: boolean;
  headerContent?: ReactNode;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  const closeButton = (session: LoginSession) => <Tooltip><TooltipTrigger asChild><Button type="button" variant="outline" size="icon-sm" disabled={closing || !session.can_revoke} onClick={() => onClose(session)} aria-label={`Log out ${session.browser} session for ${session.username} from ${session.ip_address}`} title={session.is_current ? "Log out your current session" : "Log out this device"} className="shrink-0 rounded-lg text-destructive shadow-none hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"><LogOut className="size-3.5" aria-hidden="true" /></Button></TooltipTrigger><TooltipContent>{session.is_current ? "Log out your current session" : "Log out this device"}</TooltipContent></Tooltip>;
  const detailsId = (group: SessionGroup) => `sessions-user-${group.user.user_id}`;
  const expandButton = (group: SessionGroup, iconOnly = false) => {
    const open = expanded.has(group.user.user_id);
    const Icon = open ? ChevronDown : ChevronRight;
    return <Button type="button" variant={iconOnly ? "ghost" : "outline"} size={iconOnly ? "icon" : "sm"} onClick={() => onToggle(group.user.user_id)} aria-label={`${open ? "Collapse" : "Expand"} sessions for ${group.user.username}`} aria-expanded={open} aria-controls={open ? detailsId(group) : undefined} className={iconOnly ? "size-8 rounded-lg text-muted-foreground aria-expanded:bg-sky-500/10 aria-expanded:text-sky-700 dark:aria-expanded:text-sky-300" : "w-full justify-between shadow-none"}>{iconOnly ? <Icon className="size-4" aria-hidden="true" /> : <><span>{open ? "Hide devices" : `View ${group.devices.length} ${group.devices.length === 1 ? "device" : "devices"}`}</span><Icon className="size-4" aria-hidden="true" /></>}</Button>;
  };

  const columns: (RecordColumn<SessionGroup> & { minWidth?: number })[] = [
    { id: "details", label: "", className: "w-10 px-1", cell: (group) => expandButton(group, true) },
    { id: "name", label: "User", icon: UserRound, className: "whitespace-normal px-3", cell: (group) => <div className="min-w-0 space-y-2">
      <UserIdentity user={group.user} table />
      <span className="inline-flex @[36rem]/sessions:hidden"><Presence online={group.devices.some((session) => session.status === "online")} /></span>
      <p className="text-xs tabular-nums text-muted-foreground @[48rem]/sessions:hidden">{group.devices.length} {group.devices.length === 1 ? "session" : "sessions"}</p>
      <div className="space-y-0.5 text-xs text-muted-foreground @[56rem]/sessions:hidden"><p>Last activity</p><SessionTimestamp value={group.user.last_seen_at} /></div>
    </div> },
    { id: "status", label: "Status", icon: Activity, minWidth: 576, className: "w-24 whitespace-normal px-2 text-center", cell: (group) => <Presence online={group.devices.some((session) => session.status === "online")} /> },
    { id: "sessions", label: "Sessions", icon: Monitor, minWidth: 768, className: "w-20 whitespace-normal px-2 text-center", cell: (group) => <span className="inline-flex min-w-7 items-center justify-center rounded-md bg-muted px-2 py-1 text-xs font-medium tabular-nums">{group.devices.length}</span> },
    { id: "connection", label: "Connection", icon: Globe, className: "w-[38%] whitespace-normal px-3 @[36rem]/sessions:w-[30%] @[48rem]/sessions:w-[26%]", cell: (group) => <Connection sessions={group.devices} /> },
    { id: "activity", label: "Last activity", icon: Clock, minWidth: 896, className: "w-32 whitespace-normal px-3", cell: (group) => <SessionTimestamp value={group.user.last_seen_at} /> },
  ];

  return (
    <div ref={container} className="@container/sessions min-w-0">
    <RecordCollection
      title="Users"
      headerContent={headerContent}
      tableClassName="table-fixed [&>thead_svg]:hidden [&>tbody>tr>td[colspan]]:p-2 sm:[&>tbody>tr>td[colspan]]:p-3"
      records={records}
      recordKey={(group) => group.user.user_id}
      columns={columns.filter((column) => containerWidth >= (column.minWidth ?? 0))}
      renderDetails={(group) => expanded.has(group.user.user_id) ? (
        <div id={detailsId(group)} className="@container/devices min-w-0 rounded-xl border bg-background">
          <div className="flex items-center gap-2 border-b px-3 py-3"><Monitor className="size-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" /><h3 className="text-xs font-medium">Devices</h3><span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">{group.devices.length}</span></div>
          <Table className="table-fixed" aria-label={`Device sessions for ${group.user.username}`}>
            <TableHeader className="bg-muted/40"><TableRow className="hover:bg-transparent">
              <TableHead className="h-9 whitespace-normal px-3 text-[11px] font-medium text-muted-foreground">Device</TableHead>
              <TableHead className="hidden w-[30%] whitespace-normal px-3 text-[11px] font-medium text-muted-foreground @[32rem]/devices:table-cell">Connection</TableHead>
              <TableHead className="hidden w-[34%] whitespace-normal px-3 text-[11px] font-medium text-muted-foreground @[48rem]/devices:table-cell">Activity</TableHead>
              <TableHead className="w-16 whitespace-normal px-2 text-center text-[11px] font-medium text-muted-foreground">Action</TableHead>
            </TableRow></TableHeader>
            <TableBody>{group.devices.map((session) => (
              <TableRow key={session.id} className="hover:bg-muted/30">
                <TableCell className="whitespace-normal px-3 py-3 align-top"><div className="min-w-0 space-y-3">
                  <DeviceName session={session} /><DeviceStatus session={session} />
                  <div className="@[32rem]/devices:hidden" title={session.user_agent}><Connection sessions={[session]} /></div>
                  <div className="@[48rem]/devices:hidden"><SessionTimes session={session} /></div>
                </div></TableCell>
                <TableCell className="hidden whitespace-normal px-3 py-3 align-top @[32rem]/devices:table-cell" title={session.user_agent}><Connection sessions={[session]} /></TableCell>
                <TableCell className="hidden whitespace-normal px-3 py-3 align-top @[48rem]/devices:table-cell"><SessionTimes session={session} /></TableCell>
                <TableCell className="whitespace-normal px-2 py-3 text-center align-top">{closeButton(session)}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      ) : null}
      renderCard={(group) => <Card className="h-full min-w-0 gap-4 py-4 shadow-none">
        <CardHeader className="min-w-0 px-4"><UserIdentity user={group.user} /><div className="mt-2 flex flex-wrap items-center justify-between gap-2"><Presence online={group.devices.some((session) => session.status === "online")} /><span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground"><Monitor className="size-3.5" aria-hidden="true" />{group.devices.length} {group.devices.length === 1 ? "session" : "sessions"}</span></div></CardHeader>
        <CardContent className="min-w-0 space-y-4 px-4">
          <div className="min-w-0 rounded-lg bg-muted/30 p-3"><Connection sessions={group.devices} /></div>
          <div className="flex min-w-0 items-start justify-between gap-3 text-xs"><span className="inline-flex shrink-0 items-center gap-1.5 text-muted-foreground"><Clock className="size-3.5" aria-hidden="true" />Last activity</span><SessionTimestamp value={group.user.last_seen_at} /></div>
          {expanded.has(group.user.user_id) && <div id={detailsId(group)} className="@container/devices min-w-0 space-y-3 border-t pt-4">{group.devices.map((session) => <div key={session.id} className="min-w-0 space-y-3 rounded-lg border p-3">
            <div className="flex min-w-0 items-start justify-between gap-2"><DeviceName session={session} />{closeButton(session)}</div>
            <DeviceStatus session={session} />
            <Connection sessions={[session]} />
            <div className="border-t pt-3"><SessionTimes session={session} /></div>
          </div>)}</div>}
        </CardContent>
        <CardFooter className="mt-auto px-4">{expandButton(group)}</CardFooter>
      </Card>}
    />
    </div>
  );
}
