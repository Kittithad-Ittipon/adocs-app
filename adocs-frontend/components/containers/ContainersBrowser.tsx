"use client";
import RecordStatus from "@/components/system/shared/RecordStatus";
import DomainLink from "@/components/system/shared/DomainLink";


import Reveal from "@/components/Reveal";
import LoadingLine from "@/components/feedback/LoadingLine";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Box, Clock, FileBox, Globe, LayoutGrid, List, RefreshCw, Search, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

type Container = {
  containerName: string;
  domain?: string | null;
  image: string;
  owner: string;
  upDateTime: string;
  status: string;
};

function Status({ status }: { status: string }) { return <RecordStatus status={status} />; }

function ContainerTable({ containers }: { containers: Container[] }) {
  const columns = [
    { label: "Container", icon: Box },
    { label: "Domain", icon: Globe },
    { label: "Image", icon: FileBox },
    { label: "Owner", icon: User },
    { label: "Updated", icon: Clock },
    { label: "Status", icon: null },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <Table className="w-full min-w-[680px] table-fixed md:min-w-0"><colgroup><col className="w-[22%]" /><col className="w-[24%]" /><col className="w-[12%]" /><col className="w-[12%]" /><col className="w-[18%]" /><col className="w-[12%]" /></colgroup>
        <TableCaption className="sr-only">Deployed containers, domains, owners and current status.</TableCaption>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {columns.map(({ label, icon: Icon }) => (
              <TableHead key={label} scope="col" className={cn("h-12 px-3 lg:px-4 text-xs font-medium text-muted-foreground", label === "Container" && "sticky left-0 z-10 bg-muted")}>
                <span className="inline-flex min-w-0 items-center gap-2">{Icon && <Icon className="size-3.5" aria-hidden="true" />}{label}</span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {containers.map((container) => (
            <TableRow key={container.containerName} className="group motion-safe:transition-colors hover:bg-muted/30 motion-reduce:transition-none">
              <TableCell className="sticky left-0 z-10 bg-card px-3 py-4 lg:px-4 group-hover:bg-muted motion-safe:transition-colors">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="hidden size-8 shrink-0 xl:flex items-center justify-center rounded-xl border border-sky-500/10 bg-sky-500/5 text-sky-600 dark:text-sky-300"><Box className="size-4" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1 truncate text-xs font-normal" title={container.containerName}>{container.containerName || "-"}</span>
                </div>
              </TableCell>
              <TableCell className="px-3 lg:px-4 [&_a]:max-w-full [&_a>span]:min-w-0"><DomainLink domain={container.domain} /></TableCell>
              <TableCell className="px-3 lg:px-4"><span className="inline-block max-w-full truncate rounded-md border bg-muted/40 px-2 py-1 font-mono text-xs text-muted-foreground" title={container.image}>{container.image || "-"}</span></TableCell>
              <TableCell className="px-3 lg:px-4">
                <div className="flex min-w-0 items-center gap-2"><span className="hidden size-7 shrink-0 lg:flex items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground" aria-hidden="true">{container.owner?.slice(0, 2).toUpperCase() || <User className="size-3" />}</span><span className="min-w-0 flex-1 truncate text-sm" title={container.owner}>{container.owner || "-"}</span></div>
              </TableCell>
              <TableCell className="whitespace-normal break-words px-3 text-xs leading-relaxed tabular-nums text-muted-foreground lg:px-4">{container.upDateTime || "-"}</TableCell>
              <TableCell className="px-2 lg:px-3 [&>span]:px-2 [&>span]:text-[11px]"><Status status={container.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
function ContainerCards({ containers }: { containers: Container[] }) {
  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {containers.map((container, index) => {
        const domain = container.domain?.trim();
        return (
          <Reveal key={container.containerName} className="h-full min-w-0" delay={(index % 3) * 0.04} liftOnHover>
            <Card className="group h-full gap-5 overflow-hidden rounded-2xl border-border/80 py-5 shadow-none motion-safe:transition-[border-color,box-shadow] motion-safe:duration-300 hover:border-sky-500/30 hover:shadow-md">
              <CardHeader className="gap-4 px-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-sky-500/10 bg-gradient-to-br from-sky-500/10 to-teal-500/10 text-sky-600 dark:text-sky-300"><Box className="size-5" aria-hidden="true" /></span>
                  <Status status={container.status} />
                </div>
                <CardTitle className="break-words text-base font-medium leading-snug [overflow-wrap:anywhere]">{container.containerName || "Container"}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-5 px-5">
                <div className="min-w-0 rounded-xl border bg-muted/30 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">{domain && <Globe className="size-3.5" aria-hidden="true" />}Domain</p>
                  <div className="min-w-0 text-sm [&_a]:max-w-full [&_a>span]:min-w-0"><DomainLink domain={domain} /></div>
                </div>
                <dl className="grid min-w-0 grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <dt className="mb-2 text-[11px] font-medium text-muted-foreground">Owner</dt>
                    <dd className="flex min-w-0 items-center gap-2">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground" aria-hidden="true">{container.owner?.slice(0, 2).toUpperCase() || <User className="size-3.5" />}</span>
                      <span className="truncate text-sm font-medium" title={container.owner}>{container.owner || "-"}</span>
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-2 text-[11px] font-medium text-muted-foreground">Image</dt>
                    <dd className="flex min-w-0 items-start gap-1.5 rounded-lg bg-muted/50 px-2 py-1.5"><FileBox className="mt-0.5 size-3.5 shrink-0 text-violet-500" aria-hidden="true" /><span className="break-all font-mono text-xs leading-relaxed text-muted-foreground">{container.image || "-"}</span></dd>
                  </div>
                </dl>
              </CardContent>
              <CardFooter className="mt-auto justify-between gap-3 border-t px-5 pb-0 pt-4">
                <div className="flex min-w-0 items-start gap-2 text-muted-foreground"><Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /><div className="min-w-0"><p className="text-[10px]">Updated</p><p className="mt-0.5 break-words text-xs leading-relaxed">{container.upDateTime || "-"}</p></div></div>
              </CardFooter>
            </Card>
          </Reveal>
        );
      })}
    </div>
  );
}
function subscribeToMobile(callback: () => void) {
  const query = window.matchMedia("(max-width: 767px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const mobileSnapshot = () => window.matchMedia("(max-width: 767px)").matches;
const serverSnapshot = () => true;
export default function ContainersBrowser() {
  const [containers, setContainers] = useState<Container[]>([]);
  const mobile = useSyncExternalStore(subscribeToMobile, mobileSnapshot, serverSnapshot);
  const [selectedView, setView] = useState<"table" | "cards" | null>(null);
  const view = selectedView ?? (mobile ? "cards" : "table");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/containers/active", { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load containers. Please try again.");
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Unexpected response. Please try again.");
        if (!controller.signal.aborted) setContainers(data as Container[]);
      } catch (cause) {
        if (controller.signal.aborted) return;
        const message = cause instanceof Error ? cause.message : "Unable to load containers.";
        setError(message);
        toast.error("Error Fetch Data", { description: message });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [reload]);

  function retry() {
    setError("");
    setLoading(true);
    setReload((value) => value + 1);
  }
  const query = search.trim().toLowerCase();
  const filtered = containers.filter((container) => container.owner.toLowerCase().includes(query) || (container.domain ?? "").toLowerCase().includes(query));

  return (
    <main className="min-h-[70dvh] w-full max-w-7xl px-6 py-10 md:px-10">
      <LoadingLine loading={loading} fixed label="Loading containers" />
      <Breadcrumb className="mb-8"><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Containers</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2"><h1 className="text-3xl font-bold tracking-tight">Containers</h1><p className="text-sm text-muted-foreground">Explore deployed applications and their owners.</p></div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-72"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input type="search" aria-label="Search containers by owner or domain" placeholder="Owner or domain" value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 pl-9" /></div>
          <div role="group" aria-label="Container view" className="flex shrink-0 gap-1 rounded-lg border bg-muted/50 p-1">
            <Button type="button" size="icon" variant={view === "cards" ? "secondary" : "ghost"} onClick={() => setView("cards")} aria-label="Card view" aria-pressed={view === "cards"}><LayoutGrid aria-hidden="true" /></Button>
            <Button type="button" size="icon" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")} aria-label="Table view" aria-pressed={view === "table"}><List aria-hidden="true" /></Button>
          </div>
        </div>
      </div>
      <div aria-busy={loading}>
        {loading ? (
          <div role="status" aria-label="Loading containers" className="space-y-3"><Skeleton className="h-12 w-full motion-reduce:animate-none" />{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-16 w-full motion-reduce:animate-none" />)}<span className="sr-only">Loading containers...</span></div>
        ) : error ? (
          <Card><CardContent className="flex flex-col items-center gap-4 py-8 text-center"><p role="alert" className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" onClick={retry}><RefreshCw aria-hidden="true" /> Try again</Button></CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center gap-3 py-10 text-center"><Box className="size-10 text-muted-foreground" aria-hidden="true" /><h2 className="font-semibold">{query ? "No results found" : "No containers available"}</h2><p className="text-sm text-muted-foreground">{query ? "Try another owner or domain." : "Deployed containers will appear here."}</p>{query && <Button type="button" variant="outline" onClick={() => setSearch("")}>Clear search</Button>}</CardContent></Card>
        ) : (
          <><p aria-live="polite" className="mb-4 text-xs text-muted-foreground">{filtered.length} container{filtered.length === 1 ? "" : "s"}</p><AnimatePresence mode="wait" initial={false}><motion.div key={view} initial={reducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.18 }}>{view === "table" ? <ContainerTable containers={filtered} /> : <ContainerCards containers={filtered} />}</motion.div></AnimatePresence></>
        )}
      </div>
    </main>
  );
}
