import { Skeleton } from "@/components/ui/skeleton";

export type SkeletonLayout = "profile" | "table";

export default function ContentSkeleton({ layout = "table", stats = 0 }: { layout?: SkeletonLayout; stats?: number }) {
  return (
    <div role="status" aria-label="Loading content" className="w-full space-y-6">
      {stats > 0 && (
        <div className={stats === 4 ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-4" : "grid grid-cols-3 gap-3 sm:gap-4"}>
          {Array.from({ length: stats }, (_, index) => <div key={index} className="space-y-3 rounded-xl border p-3 sm:p-4"><Skeleton className="h-3.5 w-2/3 motion-reduce:animate-none" /><Skeleton className="h-7 w-12 motion-reduce:animate-none" /></div>)}
        </div>
      )}
      {layout === "profile" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-20 rounded-xl motion-reduce:animate-none lg:col-span-3" />
          <div className="space-y-5 rounded-xl border p-5 lg:col-span-2">{Array.from({ length: 2 }, (_, row) => <div key={row} className="space-y-2"><Skeleton className="h-3.5 w-28 motion-reduce:animate-none" /><Skeleton className="h-9 w-full motion-reduce:animate-none" /></div>)}</div>
          <div className="space-y-4">{Array.from({ length: 2 }, (_, index) => <Skeleton key={index} className="h-32 rounded-xl motion-reduce:animate-none" />)}</div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3"><Skeleton className="h-5 w-32 motion-reduce:animate-none" /><Skeleton className="h-9 w-full max-w-64 motion-reduce:animate-none" /></div>
          <div className="overflow-hidden rounded-xl border">
            <Skeleton className="h-10 w-full rounded-none motion-reduce:animate-none" />
            {Array.from({ length: 5 }, (_, index) => <div key={index} className="flex items-center gap-4 border-t px-4 py-3.5"><Skeleton className="h-4 w-1/4 motion-reduce:animate-none" /><Skeleton className="h-4 flex-1 motion-reduce:animate-none" /><Skeleton className="h-5 w-16 motion-reduce:animate-none" /></div>)}
          </div>
        </div>
      )}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
