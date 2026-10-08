"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const controls = useAnimationControls();
  const reducedMotion = useReducedMotion();

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    if (!reducedMotion) {
      void controls.start({
        rotate: [0, -12, 8, 0],
        scale: [1, 0.9, 1.04, 1],
        transition: { duration: 0.35, ease: "easeInOut" },
      });
    }
  }

  return (
    <Button asChild type="button" variant="ghost" size="icon" onClick={toggleTheme} className="relative size-[42px] overflow-hidden p-2 active:translate-y-0" aria-label="Toggle theme">
      <motion.button initial={false} animate={controls} whileTap={reducedMotion ? undefined : { scale: 0.92 }}>
        <Moon aria-hidden="true" className="size-[26px] rotate-0 scale-100 motion-safe:transition-transform motion-safe:duration-200 dark:-rotate-90 dark:scale-0" />
        <Sun aria-hidden="true" className="absolute size-[26px] rotate-90 scale-0 motion-safe:transition-transform motion-safe:duration-200 dark:rotate-0 dark:scale-100" />
      </motion.button>
    </Button>
  );
}