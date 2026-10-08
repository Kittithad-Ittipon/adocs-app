"use client";
import LogRecords from "@/components/system/shared/LogRecords";
import SystemPageHeader from "@/components/system/shared/SystemPageHeader";
import { Card } from "@/components/ui/card";

import LoadingSection from "@/components/feedback/LoadingSection";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Terminal, X } from "lucide-react";
import { toast } from "sonner";

type logsItem = {
  username: string;
  containers: string;
  action: string;
  upDateTime: string;
  status: string;
  details: string;
};

const ComponentLogs = () => {
  const { loading, run } = useLoadingTasks(["fetchLogsData"]);
  const [allData, setAllData] = useState<logsItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<logsItem | null>(null);
  const [isOpen, setIsOpen] = useState(false); const [error, setError] = useState<string | null>(null); const [retry, setRetry] = useState(0);
  const [isChange, setIsChange] = useState<string>("text-sky-500");

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
    <LoadingSection loading={loading} layout="table">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <SystemPageHeader title="Logs" description="Browse activity and inspect detailed logs." />
        {error && <Card className="gap-3 p-5 shadow-none" role="alert"><p className="text-sm text-destructive">{error}</p><Button variant="outline" className="w-fit" onClick={() => setRetry((value) => value + 1)}>Try again</Button></Card>}
        <LogRecords records={allData} onDetails={(record) => { setSelectedLog(record); setIsOpen(true); }} />
        {isOpen && (
          <Card className="gap-0 overflow-hidden rounded-2xl bg-zinc-950 py-0 text-zinc-200 shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2"><Terminal className="size-4 text-zinc-400" /><h2 className="break-all text-sm font-medium">{selectedLog?.containers || "Log details"}</h2></div>
              <div className="flex items-center gap-1">
                {[{ label: "Blue", color: "text-sky-400" }, { label: "Gray", color: "text-zinc-300" }, { label: "Green", color: "text-emerald-400" }].map((item) => (
                  <Button key={item.label} type="button" size="icon-sm" variant="ghost" aria-label={item.label + " log text"} aria-pressed={isChange === item.color} onClick={() => setIsChange(item.color)} className={"hover:bg-white/10 hover:text-zinc-100 " + item.color}><span className="size-2.5 rounded-full bg-current" /></Button>
                ))}
                <Button type="button" size="icon-sm" variant="ghost" aria-label="Close log details" onClick={() => { setSelectedLog(null); setIsOpen(false); }} className="ml-2 hover:bg-white/10 hover:text-zinc-100"><X /></Button>
              </div>
            </div>
            <pre tabIndex={0} aria-label="Log output" className={"max-h-96 min-h-40 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-5 sm:text-sm " + isChange}>{selectedLog?.details || "No log details available."}</pre>
          </Card>
        )}
      </div>
    </LoadingSection>
  );
};
export default ComponentLogs;
