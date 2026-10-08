"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import ContentSkeleton, { type SkeletonLayout } from "@/components/feedback/ContentSkeleton";
import LoadingLine from "@/components/feedback/LoadingLine";
import { cn } from "@/lib/utils";

export default function LoadingSection({ children, loading, layout = "table" }: {
  children: ReactNode;
  loading: boolean;
  layout?: SkeletonLayout;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <div className={cn("relative min-w-0", layout !== "compact" && "w-full")} aria-busy={loading}>
      {layout !== "compact" && <LoadingLine loading={loading} />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={loading ? "loading" : "content"}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {loading ? <ContentSkeleton layout={layout} /> : children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
