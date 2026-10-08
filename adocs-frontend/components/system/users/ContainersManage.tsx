"use client";
import DomainLink from "@/components/system/shared/DomainLink";
import ManagedContainerRecords from "@/components/system/shared/ManagedContainerRecords";
import RecordStatus from "@/components/system/shared/RecordStatus";
import SystemPageHeader from "@/components/system/shared/SystemPageHeader";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import LoadingSection from "@/components/feedback/LoadingSection";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";

import React, { useEffect, useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { pollCeleryTask } from "@/lib/task-check";
import { Clock3, LoaderCircle, Play, Save, Settings, Square, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

type containersData = {
  containerName: string;
  protocol: string;
  domain: string;
  port: string;
  publish: boolean;
  status: string;
  projectPath: string;
};

const ComponentContainersManage = () => {
  const { loading, run } = useLoadingTasks(["fetchContainersData"]);
  const [pending, setPending] = useState(false); const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedContainers, setSelectedContainers] =
    useState<containersData | null>(null);
  const [port, setPort] = useState<string>("");
  const [protocol, setProtocol] = useState<string>("");
  const [publish, setPublish] = useState<boolean>(false);
  const [reFresh, setReFresh] = useState<number>(0);
  const [containersData, setContainersData] = useState<containersData[]>([]);
  useEffect(() => {
    const fetchContainersData = async () => {
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
    };
    void run("fetchContainersData", fetchContainersData);
  }, [reFresh, run]);
  const toEditContainers = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const toastID = toast.loading("Loading...");
    const containerName = selectedContainers?.containerName;
    try {
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
  return (
    <LoadingSection loading={loading} layout="table">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <SystemPageHeader title="Containers" description="Manage deployment settings and container resources." />
        <ManagedContainerRecords records={containersData} onEdit={(record) => { setSelectedContainers(record); setPort(record.port); setProtocol(record.protocol); setPublish(record.publish); setIsOpen(true); }} />
        <Dialog open={isOpen} onOpenChange={(open) => { if (!pending) setIsOpen(open); }}>
          <DialogContent className="sm:max-w-xl" onInteractOutside={(event) => { if (pending) event.preventDefault(); }}>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Settings className="size-5 text-sky-500" />Manage container</DialogTitle><DialogDescription>Update routing, visibility and container status.</DialogDescription></DialogHeader>
            <div className="space-y-3 rounded-xl bg-muted/50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="break-all text-sm font-semibold">{selectedContainers?.containerName}</p><RecordStatus status={selectedContainers?.status || "Unknown"} /></div><div className="text-xs"><DomainLink domain={selectedContainers?.domain} /></div></div>
            <form id="edit-container" className="space-y-5" onSubmit={(event) => { event.preventDefault(); void performAction(() => toEditContainers(event)); }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field><FieldLabel htmlFor="container-protocol">Protocol</FieldLabel><Select value={protocol.toLowerCase() || undefined} onValueChange={setProtocol} disabled={pending}><SelectTrigger id="container-protocol" className="w-full"><SelectValue placeholder="Select protocol" /></SelectTrigger><SelectContent><SelectItem value="http">HTTP</SelectItem><SelectItem value="https">HTTPS</SelectItem></SelectContent></Select><FieldDescription className="text-xs">Match your application&apos;s internal protocol.</FieldDescription></Field>
                <Field><FieldLabel htmlFor="container-port">Port</FieldLabel><Input id="container-port" value={port} disabled={pending} onChange={(event) => setPort(event.target.value)} className="h-9" /><FieldDescription className="text-xs">Internal service port, e.g. 3000.</FieldDescription></Field>
              </div>
              <Field orientation="horizontal" className="rounded-xl border p-4"><FieldContent><FieldLabel htmlFor="container-publish">Publish container</FieldLabel><FieldDescription className="text-xs">Expose this container to the local network.</FieldDescription></FieldContent><Switch id="container-publish" checked={publish} onCheckedChange={setPublish} disabled={pending} /></Field>
            </form>
            <section className="space-y-3 rounded-xl border bg-muted/20 p-4" aria-label="Container controls">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Container controls</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">Start or stop this container, or remove its entire stack.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full gap-2 bg-background"
                  disabled={pending || !["running", "stopped"].includes(selectedContainers?.status || "")}
                  onClick={(event) => { void performAction(() => toControlContainers(event)); }}
                >
                  {selectedContainers?.status === "running" ? <Square className="size-4 text-amber-500" aria-hidden="true" /> : selectedContainers?.status === "stopped" ? <Play className="size-4 text-emerald-500" aria-hidden="true" /> : <Clock3 className="size-4" aria-hidden="true" />}
                  {selectedContainers?.status === "running" ? "Stop container" : selectedContainers?.status === "stopped" ? "Start container" : "Pending"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={pending} className="h-10 w-full gap-2"><Trash2Icon className="size-4" aria-hidden="true" />Delete stack</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete entire stack?</AlertDialogTitle>
                      <AlertDialogDescription>This permanently deletes all containers in the same stack, along with mapped data, networks and configuration. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={() => { void performAction(toDeleteStack); }}>Delete stack</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </section>
            <DialogFooter className="grid grid-cols-2 gap-2 border-t pt-4 sm:flex sm:gap-3">
              <DialogClose asChild><Button type="button" variant="ghost" disabled={pending} className="h-10 w-full sm:w-auto sm:min-w-24">Cancel</Button></DialogClose>
              <Button type="submit" form="edit-container" disabled={pending} className="h-10 w-full gap-2 sm:w-auto sm:min-w-36">
                {pending ? <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                {pending ? "Working..." : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LoadingSection>
  );
};
export default ComponentContainersManage;