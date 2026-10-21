import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

export type Stat = { label: string; value: string | number; icon: LucideIcon; description?: string; href?: string };

export default function StatCard({ label, value, icon: Icon, description, href }: Stat) {
  const external = href?.startsWith("https://");
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const card = (
    <Card className={cn("h-full gap-1.5 py-3 shadow-none sm:gap-2 sm:py-4", href && "motion-safe:transition-colors group-hover:border-foreground/20 group-hover:bg-muted/40")}>
      <CardHeader className="flex-row items-center justify-between gap-2 px-3 sm:px-4">
        <CardDescription className="text-xs sm:text-sm">{label}</CardDescription>
        <Icon className="hidden size-4 shrink-0 text-muted-foreground sm:block" aria-hidden="true" />
      </CardHeader>
      <CardContent className="space-y-1 px-3 sm:px-4">
        {href ? (
          <p className="flex h-7 items-center gap-1.5 text-base font-medium sm:h-8">{value}<Arrow className="size-4 text-muted-foreground motion-safe:transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></p>
        ) : (
          <p className="flex h-7 items-center text-xl font-semibold tracking-tight tabular-nums sm:h-8 sm:text-2xl">{typeof value === "number" ? value.toLocaleString("en-US") : value}</p>
        )}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
  if (!href) return card;
  const linkClass = "group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label + ": " + value + " (opens in a new tab)"} className={linkClass}>{card}</a>
    : <Link href={href} className={linkClass}>{card}</Link>;
}
