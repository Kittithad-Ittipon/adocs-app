import { Activity, Box, Clock, Terminal, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecordCollection from "@/components/system/shared/RecordCollection";
import RecordCard from "@/components/system/shared/RecordCard";
import RecordStatus from "@/components/system/shared/RecordStatus";

type LogRecord = { username: string; containers: string; action: string; upDateTime: string; status: string; details: string };

export default function LogRecords<T extends LogRecord>({ records, onDetails }: { records: T[]; onDetails: (record: T) => void }) {
  const action = (record: T) => <Button type="button" variant="outline" size="sm" onClick={() => onDetails(record)} aria-label={"View details for " + record.action + " on " + record.containers}><Terminal aria-hidden="true" /> Details</Button>;
  return (
    <RecordCollection
      title="Activity logs"
      records={records}
      recordKey={(record, index) => record.upDateTime + "-" + index}
      columns={[
        { id: "user", label: "User", icon: UserRound, cell: (record) => <span className="font-medium">{record.username}</span> },
        { id: "container", label: "Container", icon: Box, cell: (record) => record.containers },
        { id: "action", label: "Action", icon: Activity, cell: (record) => <span className="rounded-md bg-muted px-2 py-1 text-xs">{record.action}</span> },
        { id: "updated", label: "Updated", icon: Clock, cell: (record) => <span className="whitespace-nowrap text-muted-foreground">{record.upDateTime}</span> },
        { id: "status", label: "Status", cell: (record) => <RecordStatus status={record.status} /> },
        { id: "details", label: "Details", className: "text-right", cell: action },
      ]}
      renderCard={(record) => <RecordCard title={record.containers || "System activity"} status={<RecordStatus status={record.status} />} fields={[
        { label: "User", value: record.username, icon: UserRound },
        { label: "Action", value: record.action, icon: Activity },
        { label: "Updated", value: record.upDateTime, icon: Clock },
      ]} actions={action(record)} />}
    />
  );
}
