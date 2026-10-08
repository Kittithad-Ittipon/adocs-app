"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoadingLine({ loading, fixed = false, label = "Loading data" }: {
  loading: boolean;
  fixed?: boolean;
  label?: string;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn("pointer-events-none h-1 overflow-hidden bg-sky-500/10", fixed ? "fixed inset-x-0 top-0 z-[60]" : "absolute inset-x-0 top-0 rounded-t-xl")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-sky-500 via-cyan-300 to-violet-500"
            animate={reducedMotion ? { x: "100%" } : { x: ["-100%", "400%"] }}
            transition={reducedMotion ? { duration: 0 } : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
