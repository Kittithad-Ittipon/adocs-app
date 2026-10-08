import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function RecordCard({ title, status, fields, actions }: {
  title: ReactNode;
  status?: ReactNode;
  fields: { label: string; value: ReactNode; icon?: LucideIcon }[];
  actions?: ReactNode;
}) {
  return (
    <Card className="h-full gap-5 shadow-none transition-[border-color,box-shadow] duration-300 hover:border-sky-500/40 hover:shadow-md motion-reduce:transition-none">
      <CardHeader>
        {status && <div className="flex flex-wrap gap-2">{status}</div>}
        <CardTitle className="min-w-0 break-words text-base [overflow-wrap:anywhere]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <dl className="space-y-4">
          {fields.map(({ label, value, icon: Icon }) => <div key={label} className="flex min-w-0 gap-3">{Icon && <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}<div className="min-w-0 flex-1"><dt className="mb-1 text-xs text-muted-foreground">{label}</dt><dd className="break-words text-sm [overflow-wrap:anywhere]">{value}</dd></div></div>)}
        </dl>
      </CardContent>
      {actions && <CardFooter className="justify-end border-t pt-4">{actions}</CardFooter>}
    </Card>
  );
}
