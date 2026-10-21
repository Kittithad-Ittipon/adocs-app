"use client";
import LogRecords from "@/components/system/shared/LogRecords";
import SystemPage from "@/components/system/shared/SystemPage";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import LoadingSection from "@/components/feedback/LoadingSection";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type logsItem = {
  username: string;
  containers: string;
  action: string;
  upDateTime: string;
  status: string;
  details: string;
};

const logColors = [
  { label: "Blue", text: "text-sky-400", dot: "bg-sky-400" },
  { label: "Gray", text: "text-zinc-300", dot: "bg-zinc-400" },
  { label: "Green", text: "text-emerald-400", dot: "bg-emerald-400" },
];

const ComponentLogs = () => {
  const { loading, run } = useLoadingTasks(["fetchLogsData"]);
  const [allData, setAllData] = useState<logsItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<logsItem | null>(null);
  const [isOpen, setIsOpen] = useState(false); const [error, setError] = useState<string | null>(null); const [retry, setRetry] = useState(0);
  const [isChange, setIsChange] = useState<string>("text-sky-400");

  useEffect(() => {
    const fetchLogsData = async () => {
      const toastID = "toast-logs"; setError(null);
      try {
        const res = await fetch("/api/logs", { method: "GET" });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const message = body?.error || "Unable to load logs (HTTP " + res.status + ").";
          setError(message);
          toast.error("Unable to load logs", { description: message, id: toastID });
          return;
        }
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid logs response"); setAllData(data);
      } catch {
        setError("Unable to load logs. Please try again.");
        toast.error("Error Fetch Data", {
          description: "Server error 500",
          id: toastID,
        });
      }
    };
    void run("fetchLogsData", fetchLogsData);
  }, [run, retry]);

  return (
    <SystemPage title="Logs" description="Browse activity and inspect detailed logs.">
      <LoadingSection loading={loading}>
        <div className="space-y-4">
          {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 px-4 py-3"><p className="text-sm text-destructive">{error}</p><Button variant="outline" size="sm" onClick={() => setRetry((value) => value + 1)}>Try again</Button></div>}
          <LogRecords records={allData} onDetails={(record) => { setSelectedLog(record); setIsOpen(true); }} />
        </div>
      </LoadingSection>
      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setSelectedLog(null); }}>
        <DialogContent className="gap-4 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="break-all">{selectedLog?.containers || "Log details"}</DialogTitle>
            <DialogDescription>{[selectedLog?.action, selectedLog?.upDateTime].filter(Boolean).join(" · ")}</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-lg border bg-zinc-950 dark:bg-transparent">
            <div className="flex items-center justify-end gap-1 border-b border-white/10 px-2 py-1.5 dark:border-border">
              {logColors.map((item) => (
                <Button key={item.label} type="button" size="icon-xs" variant="ghost" aria-label={item.label + " log text"} aria-pressed={isChange === item.text} onClick={() => setIsChange(item.text)} className="hover:bg-white/10 aria-pressed:bg-white/10 dark:hover:bg-muted dark:aria-pressed:bg-muted"><span className={cn("size-2 rounded-full", item.dot)} /></Button>
              ))}
            </div>
            <pre tabIndex={0} aria-label="Log output" className={"max-h-[60dvh] min-h-48 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring " + isChange}>{selectedLog?.details || "No log details available."}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </SystemPage>
  );
};
export default ComponentLogs;
