import { Skeleton } from "@/components/ui/skeleton";

export type SkeletonLayout = "dashboard" | "profile" | "table" | "compact";

export default function ContentSkeleton({ layout = "table" }: { layout?: SkeletonLayout }) {
  if (layout === "compact") {
    return (
      <div role="status" aria-label="Loading account" className="flex items-center gap-3 p-2">
        <Skeleton className="size-12 shrink-0 rounded-full motion-reduce:animate-none" />
        <div className="space-y-2"><Skeleton className="h-4 w-28 motion-reduce:animate-none" /><Skeleton className="h-3 w-16 motion-reduce:animate-none" /></div>
        <span className="sr-only">Loading account...</span>
      </div>
    );
  }
  return (
    <div role="status" aria-label="Loading content" className="w-full space-y-6 px-4 py-8 md:px-8">
      <Skeleton className="h-5 w-40 motion-reduce:animate-none" />
      {layout === "dashboard" && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="space-y-5 rounded-xl border p-6"><Skeleton className="size-10 rounded-lg motion-reduce:animate-none" /><Skeleton className="h-5 w-3/4 motion-reduce:animate-none" /><Skeleton className="h-10 w-1/2 motion-reduce:animate-none" /></div>)}
        </div>
      )}
      {layout === "profile" ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => <div key={index} className="space-y-6 rounded-xl border p-6"><Skeleton className="h-6 w-36 motion-reduce:animate-none" />{Array.from({ length: 4 }, (_, row) => <div key={row} className="space-y-2"><Skeleton className="h-4 w-24 motion-reduce:animate-none" /><Skeleton className="h-11 w-full motion-reduce:animate-none" /></div>)}</div>)}
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border p-4">
          <Skeleton className="h-12 w-full motion-reduce:animate-none" />
          {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-14 w-full motion-reduce:animate-none" />)}
        </div>
      )}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
