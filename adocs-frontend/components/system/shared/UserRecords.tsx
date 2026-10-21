import type { ReactNode } from "react";
import { Boxes, Database, Mail, UserPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecordCollection from "@/components/system/shared/RecordCollection";
import RecordCard from "@/components/system/shared/RecordCard";
import RecordStatus from "@/components/system/shared/RecordStatus";

type UserRecord = { username: string; email: string; role: string; container: string; maxContainer: string; db: boolean; requestDB: boolean; usersStatus: unknown };

function DatabaseStatus({ record }: { record: UserRecord }) {
  return <RecordStatus status={record.db ? "Connected" : record.requestDB ? "Pending Request" : "Not Connected"} />;
}

export default function UserRecords<T extends UserRecord>({ records, onEdit, headerContent }: { records: T[]; onEdit: (record: T) => void; headerContent?: ReactNode }) {
  const action = (record: T) => <Button type="button" variant="outline" size="sm" onClick={() => onEdit(record)} aria-label={"Manage user " + record.username}><UserPen aria-hidden="true" /> Manage</Button>;
  return (
    <RecordCollection
      title="Users"
      headerContent={headerContent}
      records={records}
      recordKey={(record) => record.username}
      columns={[
        { id: "name", label: "Username", cell: (record) => <div className="flex items-center gap-2"><span className="font-medium">{record.username}</span>{record.usersStatus !== null && <RecordStatus status="Deleting" />}</div> },
        { id: "email", label: "Email", cell: (record) => <span className="text-muted-foreground">{record.email || "No email"}</span> },
        { id: "role", label: "Role", cell: (record) => <RecordStatus status={record.role} tone="neutral" dot={false} /> },
        { id: "containers", label: "Containers", cell: (record) => <span className="tabular-nums">{record.container} <span className="text-muted-foreground">/ {record.maxContainer}</span></span> },
        { id: "database", label: "Database", cell: (record) => <DatabaseStatus record={record} /> },
        { id: "actions", label: "Actions", className: "text-right", cell: action },
      ]}
      renderCard={(record) => <RecordCard title={record.username} status={<><RecordStatus status={record.role} tone="neutral" dot={false} />{record.usersStatus !== null && <RecordStatus status="Deleting" />}</>} fields={[
        { label: "Email", value: record.email || "No email", icon: Mail },
        { label: "Containers", value: record.container + " / " + record.maxContainer, icon: Boxes },
        { label: "Database", value: <DatabaseStatus record={record} />, icon: Database },
      ]} actions={action(record)} />}
    />
  );
}
