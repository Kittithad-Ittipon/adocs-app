"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import ContentSkeleton, { type SkeletonLayout } from "@/components/feedback/ContentSkeleton";

export default function LoadingSection({ children, loading, layout = "table", stats }: {
  children: ReactNode;
  loading: boolean;
  layout?: SkeletonLayout;
  stats?: number;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="relative w-full min-w-0" aria-busy={loading}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={loading ? "loading" : "content"}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {loading ? <ContentSkeleton layout={layout} stats={stats} /> : children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
