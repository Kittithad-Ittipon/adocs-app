"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import HomeSkeleton from "@/components/HomeSkeleton";
import LoadingLine from "@/components/feedback/LoadingLine";

const subscribe = () => () => {};

export default function HomeExperience({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const loading = hydrated && !ready;

  useEffect(() => {
    let active = true;
    const image = new Image();
    const imageReady = new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = window.matchMedia("(min-width: 768px)").matches ? "/images/w07.jpg" : "/images/w02.webp";
      if (image.complete) resolve();
    });
    // Show completion when the actual hero image and fonts are ready.
    Promise.all([imageReady, document.fonts.ready]).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, []);

  return (
    <div className="relative w-full" aria-busy={loading}>
      <LoadingLine loading={loading} fixed label="Preparing page" />
      <AnimatePresence>
        
        {loading && (
          <motion.div key="skeleton" className="absolute inset-0 z-10 overflow-hidden bg-background" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.35 }}>
            <HomeSkeleton />
          </motion.div>
        )}
        {hydrated && ready && (
          <motion.div key="ready-bar" aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-sky-500 via-cyan-300 to-violet-500" initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: [1, 1, 0] }} transition={{ duration: reducedMotion ? 0 : 0.7, ease: "easeOut" }} />
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
