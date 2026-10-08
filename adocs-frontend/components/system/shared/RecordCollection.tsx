"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Inbox, LayoutGrid, List, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  icon?: LucideIcon;
  cell: (record: T, index: number) => ReactNode;
  className?: string;
};

export default function RecordCollection<T>({ title, records, columns, recordKey, renderCard, headerContent }: {
  title: string;
  headerContent?: ReactNode;
  records: T[];
  columns: RecordColumn<T>[];
  recordKey: (record: T, index: number) => string;
  renderCard: (record: T, index: number) => ReactNode;
}) {
  const mobile = useSyncExternalStore(subscribe, mobileSnapshot, serverSnapshot);
  const [selectedView, setSelectedView] = useState<"table" | "cards" | null>(null);
  const view = selectedView ?? (mobile ? "cards" : "table");
  const reducedMotion = useReducedMotion();

  return (
    <section aria-label={title} className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3"><div className="flex shrink-0 items-center gap-2.5">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">{records.length}</span></div>{headerContent}
        </div>
        <div role="group" aria-label={title + " view"} className="flex gap-1 rounded-lg border bg-muted/30 p-1">
          <Button type="button" variant={view === "table" ? "secondary" : "ghost"} size="sm" aria-pressed={view === "table"} onClick={() => setSelectedView("table")} className="gap-2"><List aria-hidden="true" /> Table</Button>
          <Button type="button" variant={view === "cards" ? "secondary" : "ghost"} size="sm" aria-pressed={view === "cards"} onClick={() => setSelectedView("cards")} className="gap-2"><LayoutGrid aria-hidden="true" /> Card</Button>
        </div>
      </div>
      {records.length === 0 ? (
        <Card className="shadow-none"><CardContent className="flex flex-col items-center gap-3 py-8 text-center"><Inbox className="size-8 text-muted-foreground" aria-hidden="true" /><p className="text-sm text-muted-foreground">No records found.</p></CardContent></Card>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.15 }}>
            {view === "table" ? (
              <div className="overflow-hidden rounded-xl border bg-card">
                <Table>
                  <TableHeader className="bg-muted/40"><TableRow className="hover:bg-transparent">
                    {columns.map(({ id, label, icon: Icon, className }) => <TableHead key={id} className={cn("h-12 whitespace-nowrap px-4 text-xs font-medium", className)}><span className="inline-flex items-center gap-2">{Icon && <Icon className="size-3.5" aria-hidden="true" />}{label}</span></TableHead>)}
                  </TableRow></TableHeader>
                  <TableBody>{records.map((record, index) => <TableRow key={recordKey(record, index)} className="motion-safe:transition-colors hover:bg-muted/30">{columns.map((column) => <TableCell key={column.id} className={cn("px-4 py-4 text-sm", column.className)}>{column.cell(record, index)}</TableCell>)}</TableRow>)}</TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
                {records.map((record, index) => <Reveal key={recordKey(record, index)} className="h-full" delay={(index % 3) * 0.04} liftOnHover>{renderCard(record, index)}</Reveal>)}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
