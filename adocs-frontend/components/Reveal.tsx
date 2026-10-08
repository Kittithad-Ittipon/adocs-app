"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export default function Reveal({ children, className, delay = 0, liftOnHover = false }: {
  children: ReactNode;
  className?: string;
  delay?: number;
  liftOnHover?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reducedMotion ? { opacity: 1, y: 0 } : { opacity: [0, 1], y: [20, 0] }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {liftOnHover ? (
        <motion.div className="h-full" whileHover={reducedMotion ? undefined : { y: -5 }} transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 24 }}>
          {children}
        </motion.div>
      ) : children}
    </motion.div>
  );
}
