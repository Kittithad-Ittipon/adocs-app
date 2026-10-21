import { ArrowUpRight } from "lucide-react";

export default function DomainLink({ domain }: { domain?: string | null }) {
  const value = domain?.trim();
  if (!value) return <span className="text-muted-foreground">-</span>;
  return (
    <a href={"https://" + value} target="_blank" rel="noopener noreferrer" aria-label={"Open " + value + " (opens in a new tab)"} className="group/domain inline-flex min-w-0 items-center gap-1 rounded-sm text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
      <span className="max-w-56 truncate">{value}</span><ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground group-hover/domain:text-foreground" aria-hidden="true" />
    </a>
  );
}
