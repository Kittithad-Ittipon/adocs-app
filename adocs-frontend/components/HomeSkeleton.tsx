import { Skeleton } from "@/components/ui/skeleton";

export default function HomeSkeleton() {
  return (
    <div role="status" aria-label="Loading page" className="w-full bg-background">
      <div className="mx-auto flex min-h-[540px] max-w-7xl flex-col justify-center gap-7 px-6 py-16 md:min-h-[620px] md:px-10 xl:min-h-[calc(100dvh-120px)]">
        <Skeleton className="h-9 w-48 motion-reduce:animate-none" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-56 md:h-24 md:w-80 motion-reduce:animate-none" />
          <Skeleton className="h-16 w-52 md:h-24 md:w-72 motion-reduce:animate-none" />
          <Skeleton className="h-16 w-64 md:h-24 md:w-96 motion-reduce:animate-none" />
        </div>
        <Skeleton className="h-14 w-full max-w-lg motion-reduce:animate-none" />
        <div className="flex gap-3"><Skeleton className="h-12 w-36 motion-reduce:animate-none" /><Skeleton className="h-12 w-40 motion-reduce:animate-none" /></div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <Skeleton className="mx-auto mb-10 h-10 w-64 motion-reduce:animate-none" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-64 rounded-xl motion-reduce:animate-none" />)}
        </div>
      </div>
      <span className="sr-only">Loading page...</span>
    </div>
  );
}
