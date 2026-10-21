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
    <Card className="h-full gap-3 py-4 shadow-none motion-safe:transition-colors hover:border-foreground/20">
      <CardHeader className="flex-row items-start justify-between gap-3 px-4">
        <CardTitle className="min-w-0 break-words text-sm font-medium [overflow-wrap:anywhere]">{title}</CardTitle>
        {status && <div className="flex shrink-0 flex-wrap justify-end gap-1.5">{status}</div>}
      </CardHeader>
      <CardContent className="flex-1 px-4">
        <dl className="divide-y">
          {fields.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex min-w-0 items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
              <dt className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">{Icon && <Icon className="size-3.5" aria-hidden="true" />}{label}</dt>
              <dd className="min-w-0 break-words text-right text-sm [overflow-wrap:anywhere]">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
      {actions && <CardFooter className="border-t px-4 pt-3 [&>*]:w-full">{actions}</CardFooter>}
    </Card>
  );
}
