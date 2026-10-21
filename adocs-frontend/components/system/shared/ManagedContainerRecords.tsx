import DomainList, { recordDomains } from "@/components/system/shared/DomainList";
import RecordCard from "@/components/system/shared/RecordCard";
import RecordCollection from "@/components/system/shared/RecordCollection";
import RecordStatus from "@/components/system/shared/RecordStatus";
import { Button } from "@/components/ui/button";
import { Globe, Network, Settings, Share2 } from "lucide-react";
import type { ReactNode } from "react";

type ManagedContainer = { containerName: string; protocol: string; domain?: string | null; port: string; publish: boolean; status: string; projectPath: string; proxies?: { domains: string[] }[] };

export default function ManagedContainerRecords<T extends ManagedContainer>({ records, onEdit, headerContent }: { records: T[]; onEdit: (record: T) => void; headerContent?: ReactNode }) {
  const action = (record: T) => <Button type="button" variant="outline" size="sm" onClick={() => onEdit(record)} aria-label={"Manage container " + record.containerName}><Settings aria-hidden="true" /> Manage</Button>;
  const published = (record: T) => <RecordStatus status={record.publish ? "Published" : "Private"} tone={record.publish ? "success" : "neutral"} />;
  const domains = (record: T) => <DomainList domains={recordDomains(record)} title={record.containerName} />;
  return (
    <RecordCollection
      title="Containers"
      headerContent={headerContent}
      records={records}
      recordKey={(record) => record.containerName}
      columns={[
        { id: "name", label: "Container", cell: (record) => <span className="font-medium">{record.containerName}</span> },
        { id: "domain", label: "Domain", cell: domains },
        { id: "protocol", label: "Protocol", cell: (record) => <span className="uppercase text-muted-foreground">{record.protocol}</span> },
        { id: "port", label: "Port", cell: (record) => <span className="tabular-nums text-muted-foreground">{record.port}</span> },
        { id: "publish", label: "Visibility", cell: published },
        { id: "status", label: "Status", cell: (record) => <RecordStatus status={record.status} /> },
        { id: "actions", label: "Actions", className: "text-right", cell: action },
      ]}
      renderCard={(record) => <RecordCard title={record.containerName} status={<><RecordStatus status={record.status} />{published(record)}</>} fields={[
        { label: "Domain", value: domains(record), icon: Globe },
        { label: "Protocol", value: record.protocol.toUpperCase(), icon: Network },
        { label: "Port", value: record.port, icon: Share2 },
      ]} actions={action(record)} />}
    />
  );
}
