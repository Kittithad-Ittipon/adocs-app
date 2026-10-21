import { cn } from "@/lib/utils";

export default function RecordStatus({ status, tone, dot = true }: {
  status: string;
  tone?: "success" | "warning" | "danger" | "neutral";
  dot?: boolean;
}) {
  const normalized = status.toLowerCase();
  const resolved = tone ?? (["running", "success", "connected"].includes(normalized) ? "success" : ["pending", "pending request"].includes(normalized) ? "warning" : ["stopped", "failed", "failure", "error", "not connected", "deleting"].includes(normalized) ? "danger" : "neutral");
  return (
    <span className="inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-md border px-1.5 text-xs font-medium text-foreground/80">
      {dot && <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", {
        "bg-emerald-500": resolved === "success",
        "bg-amber-500": resolved === "warning",
        "bg-red-500": resolved === "danger",
        "bg-muted-foreground/50": resolved === "neutral",
      }, normalized === "running" && "motion-safe:animate-pulse")} />}
      {status}
    </span>
  );
}
