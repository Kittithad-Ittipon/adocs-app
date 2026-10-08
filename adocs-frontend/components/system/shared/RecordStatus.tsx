import { cn } from "@/lib/utils";

export default function RecordStatus({ status, tone }: {
  status: string;
  tone?: "success" | "warning" | "danger" | "neutral";
}) {
  const normalized = status.toLowerCase();
  const resolved = tone ?? (["running", "success", "connected"].includes(normalized) ? "success" : ["pending", "pending request"].includes(normalized) ? "warning" : ["stopped", "failed", "failure", "error", "not connected", "deleting"].includes(normalized) ? "danger" : "neutral");
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", {
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400": resolved === "success",
      "bg-amber-500/10 text-amber-700 dark:text-amber-400": resolved === "warning",
      "bg-red-500/10 text-red-700 dark:text-red-400": resolved === "danger",
      "bg-muted text-muted-foreground": resolved === "neutral",
    })}>
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full bg-current", normalized === "running" && "motion-safe:animate-pulse")} />
      {status}
    </span>
  );
}
