"use client";
import type { ContainerProxy } from "@/components/system/shared/ContainerProxies";
import DomainLink from "@/components/system/shared/DomainLink";
import DomainList, { DomainScope, recordDomains } from "@/components/system/shared/DomainList";
import ManagedContainerRecords from "@/components/system/shared/ManagedContainerRecords";
import RecordStatus from "@/components/system/shared/RecordStatus";
import SearchInput from "@/components/system/shared/SearchInput";
import StatCard from "@/components/system/shared/StatCard";
import SystemPage from "@/components/system/shared/SystemPage";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import LoadingSection from "@/components/feedback/LoadingSection";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";

import React, { useCallback, useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { pollCeleryTask } from "@/lib/task-check";
import { Activity, Boxes, Clock3, Globe, Play, Square, Trash2Icon, User } from "lucide-react";
import { toast } from "sonner";

type containersData = {
  containerName: string;
  owner?: string;
  protocol: string;
  domain: string;
  port: string;
  publish: boolean;
  status: string;
  projectPath: string;
  proxies: ContainerProxy[];
  proxiesSynced: boolean;
  maxDomains: number;
};

const ComponentContainersManage = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const { loading, run } = useLoadingTasks(["fetchContainersData"]);
  const [pending, setPending] = useState(false); const [isOpen, setIsOpen] = useState<boolean>(false); const [search, setSearch] = useState(""); const [subdomain, setSubdomain] = useState("");
  const [selectedContainers, setSelectedContainers] =
    useState<containersData | null>(null);
  const [port, setPort] = useState<string>("");
  const [protocol, setProtocol] = useState<string>("");
  const [publish, setPublish] = useState<boolean>(false);
  const [reFresh, setReFresh] = useState<number>(0);
  const [containersData, setContainersData] = useState<containersData[]>([]);
  // Reloading without the loading state keeps the Manage dialog open after proxy changes.
  const fetchContainersData = useCallback(async () => {
    const toastID = "toast-containers-data";
    try {
      const res = await fetch("/api/containers", {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) {
        toast.error("Error Fetch Data", {
          description: "Failed to load",
          id: toastID,
        });
        return;
      }
      const data = await res.json();
      setContainersData(data);
    } catch {
      toast.error("Error Fetch Data", {
        description: "Server error 500",
        id: toastID,
      });
    }
  }, []);
  useEffect(() => {
    void run("fetchContainersData", fetchContainersData);
  }, [reFresh, run, fetchContainersData]);
  const selectedRecord = containersData.find((record) => record.containerName === selectedContainers?.containerName) ?? selectedContainers;
  const query = search.trim().toLowerCase();
  const filteredContainers = containersData.filter((record) => [record.containerName, record.owner ?? "", ...recordDomains(record)].some((value) => value.toLowerCase().includes(query)));
  const summary = [
    { label: "Containers", value: containersData.length, icon: Boxes },
    { label: "Running", value: containersData.filter((record) => record.status === "running").length, icon: Activity },
    { label: "Domains", value: containersData.reduce((total, record) => total + recordDomains(record).length, 0), icon: Globe },
  ];
  const toEditContainers = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const toastID = toast.loading("Loading...");
    const containerName = selectedContainers?.containerName;
    try {
      // A filled public domain is added first so a rejected domain keeps the dialog open.
      if (subdomain) {
        const domainRes = await fetch(`/api/containers/${encodeURIComponent(containerName ?? "")}/proxies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subdomain }),
        });
        const domainData = await domainRes.json();
        if (!domainRes.ok) {
          toast.error("Error", { id: toastID, description: domainData.error });
          return;
        }
        setSubdomain("");
      }
      const res = await fetch(`/api/containers/${containerName}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          port: String(port),
          containerName,
          protocol,
          publish: Boolean(publish),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      toast.success("Update Successfuly", {
        id: toastID,
        description: data.message,
      });
      setIsOpen(false);
    } catch {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
    setReFresh(Date.now());
  };
  const toControlContainers = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    const toastID = toast.loading("Loading...");
    const projectPath = selectedContainers?.projectPath;
    const containerStatus = selectedContainers?.status;
    const selectedContainerName = selectedContainers?.containerName;
    try {
      const res = await fetch(`/api/containers/${selectedContainerName}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectPath, containerStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      if (containerStatus === "running") {
        toast.info("Stopping Containers", {
          id: toastID,
          description: data.message,
        });
        setReFresh(Date.now());
        setIsOpen(false);
        const isSuccess = await pollCeleryTask(
          data.taskID,
          `Start '${selectedContainers?.containerName}' Successfully`,
          `Start '${selectedContainers?.containerName}' Failed `,
        );
        if (isSuccess) {
          setSelectedContainers(null);
          setReFresh(Date.now());
        }
        return;
      } else {
        toast.info("Starting Containers", {
          id: toastID,
          description: data.message,
        });
        setReFresh(Date.now());
        setIsOpen(false);
        const isSuccess = await pollCeleryTask(
          data.taskID,
          `Start '${selectedContainers?.containerName}' Successfully`,
          `Start '${selectedContainers?.containerName}' Failed `,
        );
        if (isSuccess) {
          setSelectedContainers(null);
          setReFresh(Date.now());
        }
        return;
      }
    } catch {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };
  const toRemoveDomain = async (proxyId: number, domain: string) => {
    const toastID = toast.loading("Loading...");
    try {
      const res = await fetch(`/api/containers/${encodeURIComponent(selectedContainers?.containerName ?? "")}/proxies/${proxyId}/domains/${encodeURIComponent(domain)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      toast.success("Domain Removed", { id: toastID, description: domain });
      await fetchContainersData();
    } catch {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };
  const toDeleteStack = async () => {
    const toastID = toast.loading("Loading...");
    const projectPath = selectedContainers?.projectPath;
    const selectedContainerName = selectedContainers?.containerName;
    try {
      const res = await fetch(`/api/containers/${selectedContainerName}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectPath }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      toast.info("Deleting Containers", {
        id: toastID,
        description: data.message,
      });
      setIsOpen(false);
      setReFresh(Date.now());
      const isSuccess = await pollCeleryTask(
        data.taskID,
        `Delete '${selectedContainers?.containerName}' Successfully`,
        `Delete '${selectedContainers?.containerName}' Failed `,
      );
      if (isSuccess) {
        setContainersData([]);
        setSelectedContainers(null);
        setReFresh(Date.now());
      }
    } catch {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };
  async function performAction(action: () => Promise<void>) {
    if (pending) return;
    setPending(true);
    try { await action(); } finally { setPending(false); }
  }
  const forwardHost = selectedRecord?.proxies.find((proxy) => proxy.primary)?.forwardHost || selectedContainers?.containerName || "";
  return (
    <SystemPage title="Containers" description={isAdmin ? "Manage every deployed container, its routing and public domains." : "Manage deployment settings and container resources."}>
      <LoadingSection loading={loading} stats={3}>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">{summary.map((item) => <StatCard key={item.label} {...item} />)}</div>
          <ManagedContainerRecords headerContent={<SearchInput value={search} onChange={setSearch} placeholder={isAdmin ? "Search container, owner or domain" : "Search container or domain"} label="Search containers" />} records={filteredContainers} onEdit={(record) => { setSelectedContainers(record); setSubdomain(""); setPort(record.port); setProtocol(record.protocol); setPublish(record.publish); setIsOpen(true); }} />
        </div>
      </LoadingSection>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!pending) setIsOpen(open); }}>
        <DialogContent className="sm:max-w-xl" onEscapeKeyDown={(event) => { if (pending) event.preventDefault(); }} onInteractOutside={(event) => { if (pending) event.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle className="break-all">{selectedContainers?.containerName}</DialogTitle>
            <DialogDescription asChild>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                <RecordStatus status={selectedContainers?.status || "Unknown"} />
                {isAdmin && <span className="inline-flex items-center gap-1.5"><User className="size-3.5" aria-hidden="true" />{selectedRecord?.owner || "-"}</span>}
                <span className="inline-flex min-w-0 items-center gap-1.5">{selectedRecord && recordDomains(selectedRecord).length <= 1 && <Globe className="size-3.5 shrink-0" aria-hidden="true" />}<DomainList domains={selectedRecord ? recordDomains(selectedRecord) : []} title={selectedRecord?.containerName} /></span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <form id="edit-container" onSubmit={(event) => { event.preventDefault(); void performAction(() => toEditContainers(event)); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[7rem_minmax(0,1fr)_6rem]">
              <Field className="gap-2">
                <FieldLabel htmlFor="container-protocol">Protocol</FieldLabel>
                <Select value={protocol.toLowerCase() || undefined} onValueChange={setProtocol} disabled={pending}><SelectTrigger id="container-protocol" className="w-full"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="http">HTTP</SelectItem><SelectItem value="https">HTTPS</SelectItem></SelectContent></Select>
              </Field>
              <Field className="gap-2 max-sm:order-first max-sm:col-span-2">
                <FieldLabel htmlFor="container-host">Host</FieldLabel>
                <Input id="container-host" readOnly value={forwardHost} title={forwardHost} className="truncate bg-muted/50 text-muted-foreground dark:bg-muted/30" />
              </Field>
              <Field className="gap-2">
                <FieldLabel htmlFor="container-port">Port</FieldLabel>
                <Input id="container-port" type="text" inputMode="numeric" placeholder="3000" value={port} disabled={pending} onChange={(event) => setPort(event.target.value)} />
              </Field>
            </div>
            <Field orientation="horizontal" className="rounded-lg border px-3 py-2.5">
              <FieldContent><FieldLabel htmlFor="container-publish">Publish container</FieldLabel><FieldDescription className="text-xs">Expose this container to the local network.</FieldDescription></FieldContent>
              <Switch id="container-publish" checked={publish} disabled={pending} onCheckedChange={setPublish} />
            </Field>
            {isAdmin && selectedRecord && (
              <Field className="gap-2">
                <FieldLabel htmlFor="container-domain" className="w-full justify-between">Domains<span className="text-xs font-normal tabular-nums text-muted-foreground">{recordDomains(selectedRecord).length}/{selectedRecord.maxDomains}</span></FieldLabel>
                <ul className="divide-y rounded-lg border">
                  {selectedRecord.proxies.flatMap((proxy) => proxy.domains.map((domain) => (
                    <li key={proxy.id + domain} className="flex min-w-0 items-center justify-between gap-3 py-1.5 pl-3 pr-1.5">
                      <span className="flex min-w-0 items-center gap-2 text-sm [&_a]:max-w-full [&_a>span]:min-w-0"><DomainLink domain={domain} /><DomainScope domain={domain} /></span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button type="button" variant="ghost" size="icon-sm" disabled={pending || proxy.domains.length <= 1} className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={"Remove " + domain}><Trash2Icon /></Button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="break-all">Remove {domain}?</AlertDialogTitle><AlertDialogDescription>This domain will stop forwarding to this container.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { void performAction(() => toRemoveDomain(proxy.id, domain)); }}>Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </li>
                  )))}
                  {recordDomains(selectedRecord).length < selectedRecord.maxDomains && <li className="p-1">
                    <InputGroup className="border-0 shadow-none dark:bg-transparent">
                      <InputGroupInput id="container-domain" placeholder="Add domain" value={subdomain} disabled={pending} autoComplete="off" spellCheck={false} onChange={(event) => setSubdomain(event.target.value.toLowerCase().replace(/\s/g, ""))} />
                      <InputGroupAddon align="inline-end"><InputGroupText>.adocs.site</InputGroupText></InputGroupAddon>
                    </InputGroup>
                  </li>}
                </ul>
              </Field>
            )}
          </form>
          <DialogFooter className="border-t pt-4">
            <div className="grid grid-cols-2 gap-2 sm:mr-auto sm:flex">
              <Button type="button" variant="outline" disabled={pending || !["running", "stopped"].includes(selectedContainers?.status || "")} onClick={(event) => { void performAction(() => toControlContainers(event)); }}>
                {selectedContainers?.status === "running" ? <Square className="text-amber-500" aria-hidden="true" /> : selectedContainers?.status === "stopped" ? <Play className="text-emerald-500" aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
                {selectedContainers?.status === "running" ? "Stop container" : selectedContainers?.status === "stopped" ? "Start container" : "Pending"}
              </Button>
              <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive" disabled={pending}><Trash2Icon />Delete stack</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete entire stack?</AlertDialogTitle><AlertDialogDescription>This permanently deletes all containers in the same stack, along with mapped data, networks and configuration. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { void performAction(toDeleteStack); }}>Delete stack</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
            </div>
            <DialogClose asChild><Button variant="outline" disabled={pending}>Cancel</Button></DialogClose>
            <Button type="submit" form="edit-container" disabled={pending}>{pending ? "Saving..." : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SystemPage>
  );
};
export default ComponentContainersManage;