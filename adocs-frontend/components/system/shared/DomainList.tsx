"use client";
import DomainLink from "@/components/system/shared/DomainLink";
import RecordStatus from "@/components/system/shared/RecordStatus";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Globe } from "lucide-react";

// .addp.site resolves only inside the LAN, .adocs.site is the public domain.
export function DomainScope({ domain }: { domain: string }) {
  if (domain.endsWith(".addp.site")) return <RecordStatus status="LAN" tone="neutral" />;
  if (domain.endsWith(".adocs.site")) return <RecordStatus status="Public" tone="success" />;
  return null;
}

export function recordDomains(record: { domain?: string | null; proxies?: { domains: string[] }[] }) {
  const domains = record.proxies?.flatMap((proxy) => proxy.domains) ?? [];
  if (domains.length) return domains;
  return record.domain?.trim() ? [record.domain.trim()] : [];
}

export default function DomainList({ domains, title }: { domains: string[]; title?: string }) {
  const values = [...new Set(domains.map((domain) => domain.trim()).filter(Boolean))];
  if (values.length <= 1) return <DomainLink domain={values[0]} />;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="xs" className="gap-1.5" aria-label={"Show " + values.length + " domains" + (title ? " for " + title : "")}>
          <Globe aria-hidden="true" />{values.length} domains
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{values.length} domains</DialogTitle>
          <DialogDescription className="break-all">{title}</DialogDescription>
        </DialogHeader>
        <ul className="divide-y rounded-lg border">
          {values.map((domain) => (
            <li key={domain} className="flex min-w-0 items-center justify-between gap-3 px-3 py-2.5 text-sm">
              <span className="min-w-0 [&_a]:max-w-full [&_a>span]:min-w-0"><DomainLink domain={domain} /></span>
              <DomainScope domain={domain} />
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
