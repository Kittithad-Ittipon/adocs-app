"use client";

import Image from "next/image";
import { UserRound } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamPortrait({ src, name }: { src: string; name: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative size-32 overflow-hidden rounded-full border bg-muted">
      {!loaded && !failed && <Skeleton aria-label={"Loading portrait of " + name} className="absolute inset-0 z-10 rounded-full motion-reduce:animate-none" />}
      {failed ? (
        <div role="img" aria-label={name} className="flex h-full items-center justify-center"><UserRound className="size-12 text-muted-foreground" aria-hidden="true" /></div>
      ) : (
        <Image src={src} alt={"Portrait of " + name} width={128} height={128} className="size-32 object-cover motion-safe:transition-opacity motion-safe:duration-300" style={{ opacity: loaded ? 1 : 0 }} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
      )}
    </div>
  );
}
