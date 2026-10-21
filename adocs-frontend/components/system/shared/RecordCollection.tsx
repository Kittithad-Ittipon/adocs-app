"use client";

import { Fragment, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Inbox, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";

function subscribe(callback: () => void) {
  const query = window.matchMedia("(max-width: 767px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const mobileSnapshot = () => window.matchMedia("(max-width: 767px)").matches;
const serverSnapshot = () => true;

export type RecordColumn<T> = {
  id: string;
  label: string;
  cell: (record: T, index: number) => ReactNode;
  className?: string;
};

export default function RecordCollection<T>({ title, records, columns, recordKey, renderCard, renderDetails, headerContent, tableClassName }: {
  title: string;
  headerContent?: ReactNode;
  records: T[];
  columns: RecordColumn<T>[];
  recordKey: (record: T, index: number) => string;
  renderCard: (record: T, index: number) => ReactNode;
  renderDetails?: (record: T, index: number) => ReactNode;
  tableClassName?: string;
}) {
  const mobile = useSyncExternalStore(subscribe, mobileSnapshot, serverSnapshot);
  const [selectedView, setSelectedView] = useState<"table" | "cards" | null>(null);
  const view = selectedView ?? (mobile ? "cards" : "table");
  const reducedMotion = useReducedMotion();
  const views = [{ value: "table" as const, label: "Table view", icon: List }, { value: "cards" as const, label: "Card view", icon: LayoutGrid }];

  return (
    <section aria-label={title} className="@container min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-auto flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-medium">{title}</h2>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">{records.length}</span>
        </div>
        {headerContent && <div className="order-last w-full sm:order-none sm:w-auto">{headerContent}</div>}
        <div role="group" aria-label={title + " view"} className="flex items-center rounded-md border p-[3px]">
          {views.map(({ value, label, icon: Icon }) => (
            <Button key={value} type="button" variant="ghost" size="icon-xs" aria-label={label} aria-pressed={view === value} onClick={() => setSelectedView(value)} className={cn("size-7 text-muted-foreground", view === value && "bg-muted text-foreground")}><Icon aria-hidden="true" /></Button>
          ))}
        </div>
      </div>
      {records.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center"><Inbox className="size-6 text-muted-foreground" aria-hidden="true" /><p className="text-sm text-muted-foreground">No records found.</p></div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.15 }}>
            {view === "table" ? (
              <div className="overflow-hidden rounded-xl border">
                <Table className={tableClassName}>
                  <TableHeader><TableRow className="hover:bg-transparent">
                    {columns.map(({ id, label, className }) => <TableHead key={id} className={cn("h-10 whitespace-nowrap px-4 text-xs font-medium text-muted-foreground", className)}>{label}</TableHead>)}
                  </TableRow></TableHeader>
                  <TableBody>{records.map((record, index) => {
                    const details = renderDetails?.(record, index);
                    return <Fragment key={recordKey(record, index)}>
                      <TableRow className="hover:bg-muted/40">{columns.map((column) => <TableCell key={column.id} className={cn("px-4 py-3 text-sm", column.className)}>{column.cell(record, index)}</TableCell>)}</TableRow>
                      {details && <TableRow className="hover:bg-transparent"><TableCell colSpan={columns.length} className="p-3">{details}</TableCell></TableRow>}
                    </Fragment>;
                  })}</TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid grid-cols-1 items-stretch gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
                {records.map((record, index) => <Reveal key={recordKey(record, index)} className="h-full min-w-0" delay={(index % 3) * 0.04}>{renderCard(record, index)}</Reveal>)}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
