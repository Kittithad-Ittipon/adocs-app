"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-all overflow-hidden"
      aria-label="Toggle theme"
    >
      <Moon className="size-[26px] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
      <Sun className="absolute size-[26px] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
    </button>
  )
}