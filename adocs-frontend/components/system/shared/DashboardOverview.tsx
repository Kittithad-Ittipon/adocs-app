"use client";
import LoadingSection from "@/components/feedback/LoadingSection";
import ContainerRecords from "@/components/system/shared/ContainerRecords";
import StatCard from "@/components/system/shared/StatCard";
import SystemPage from "@/components/system/shared/SystemPage";
import type { SystemRole } from "@/components/system/shared/SystemNavigation";
import { Button } from "@/components/ui/button";
import { Upload, type LucideIcon } from "lucide-react";
import Link from "next/link";

type Metric = { title: string; description: string; value: string | number; icon: LucideIcon; href?: string };
type Container = { containerName: string; domain?: string | null; image: string; upDateTime: string; status: string };

export default function DashboardOverview({ role, loading, metrics, records }: { role: SystemRole; loading: boolean; metrics: Metric[]; records: Container[] }) {
  const admin = role === "admin";
  return (
    <SystemPage
      title="Dashboard"
      description={admin ? "Manage accounts, deployments and platform activity." : "Your deployments, activity and tools in one place."}
      actions={<Button asChild size="sm"><Link href={admin ? "/upload" : "/users/upload"}><Upload aria-hidden="true" />Upload project</Link></Button>}
    >
      <LoadingSection loading={loading} stats={4}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item) => <StatCard key={item.title} label={item.title} value={item.value} icon={item.icon} description={item.description} href={item.href} />)}
          </div>
          <ContainerRecords records={records} />
        </div>
      </LoadingSection>
    </SystemPage>
  );
}
