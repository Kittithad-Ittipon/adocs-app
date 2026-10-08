"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export default function MotionSurface({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div className={className} initial={false} animate={reducedMotion ? { opacity: 1 } : { opacity: [0, 1] }} transition={{ duration: reducedMotion ? 0 : 0.3 }}>
      {children}
    </motion.div>
  );
}
