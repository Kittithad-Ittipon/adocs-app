"use client";
import MotionSurface from "@/components/feedback/MotionSurface";
import ContainerRecords from "@/components/system/shared/ContainerRecords";
import type { SystemRole } from "@/components/system/shared/SystemNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, Upload, type LucideIcon } from "lucide-react";
import Link from "next/link";

type Metric = { title: string; description: string; value: string | number; icon: LucideIcon; iconColor: string; href?: string };
type Container = { containerName: string; domain?: string | null; image: string; upDateTime: string; status: string };

export default function DashboardOverview({ role, metrics, records }: { role: SystemRole; metrics: Metric[]; records: Container[] }) {
  const admin = role === "admin";
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1><p className="mt-2 text-sm text-muted-foreground">{admin ? "Manage accounts, deployments and platform activity." : "Your deployments, activity and tools in one place."}</p></div>
        <Button asChild className="w-fit gap-2"><Link href={admin ? "/upload" : "/users/upload"}><Upload className="size-4" />Upload project</Link></Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          const external = item.href?.startsWith("https://");
          const action = <>{item.value}{external ? <ArrowUpRight className="size-4" /> : <ArrowRight className="size-4" />}</>;
          return (
            <MotionSurface key={item.title} className="h-full">
              <Card className="h-full gap-5 rounded-2xl border-border/80 py-5 shadow-none motion-safe:transition-[border-color,box-shadow] motion-safe:duration-200 hover:border-sky-500/30 hover:shadow-sm">
                <CardHeader className="px-5">
                  <div className="flex items-center justify-between gap-3"><CardTitle className="text-sm font-medium">{item.title}</CardTitle><span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/70", item.iconColor)}><Icon className="size-4" aria-hidden="true" /></span></div>
                  <CardDescription className="min-h-10 text-xs">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto px-5">
                  {item.href ? <Button asChild variant="ghost" className="h-9 w-full justify-between rounded-lg bg-muted/50 px-3 text-xs">{external ? <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={String(item.value) + " (opens in a new tab)"}>{action}</a> : <Link href={item.href}>{action}</Link>}</Button> : <p className="text-3xl font-semibold tracking-tight tabular-nums">{typeof item.value === "number" ? item.value.toLocaleString("en-US") : item.value}</p>}
                </CardContent>
              </Card>
            </MotionSurface>
          );
        })}
      </div>
      <ContainerRecords records={records} />
    </div>
  );
}
