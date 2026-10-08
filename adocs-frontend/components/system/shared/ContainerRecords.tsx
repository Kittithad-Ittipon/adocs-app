import DomainLink from "@/components/system/shared/DomainLink";
import RecordCard from "@/components/system/shared/RecordCard";
import RecordCollection from "@/components/system/shared/RecordCollection";
import RecordStatus from "@/components/system/shared/RecordStatus";
import { Box, Clock, FileBox, Globe } from "lucide-react";

type ContainerRecord = { containerName: string; domain?: string | null; image: string; upDateTime: string; status: string };

export default function ContainerRecords({ records }: { records: ContainerRecord[] }) {
  return (
    <RecordCollection
      title="Recent containers"
      records={records}
      recordKey={(record) => record.containerName}
      columns={[
        { id: "name", label: "Container", icon: Box, cell: (record) => <span className="font-medium">{record.containerName}</span> },
        { id: "domain", label: "Domain", icon: Globe, cell: (record) => <DomainLink domain={record.domain} /> },
        { id: "image", label: "Image", icon: FileBox, cell: (record) => <span className="rounded-md bg-muted px-2 py-1 text-xs">{record.image}</span> },
        { id: "updated", label: "Updated", icon: Clock, cell: (record) => <span className="whitespace-nowrap text-muted-foreground">{record.upDateTime}</span> },
        { id: "status", label: "Status", cell: (record) => <RecordStatus status={record.status} /> },
      ]}
      renderCard={(record) => <RecordCard title={record.containerName} status={<RecordStatus status={record.status} />} fields={[
        { label: "Domain", value: <DomainLink domain={record.domain} />, icon: record.domain?.trim() ? Globe : undefined },
        { label: "Image", value: record.image, icon: FileBox },
        { label: "Updated", value: record.upDateTime, icon: Clock },
      ]} />}
    />
  );
}
