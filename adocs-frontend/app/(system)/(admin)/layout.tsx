"use client";

import Sidebar from "@/components/system/Sidebar";
import Topbar from "@/components/system/Topbar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Menu, PanelRightClose, PanelRightOpen, X } from "lucide-react";
import React, { useState } from "react";

export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const toSetSidebar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };
  const toMobileSidebar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsMobileOpen((prev) => !prev);
  };
  return (
    <div className="h-full w-full flex flex-col font-sans items-center">
      <main className="flex h-screen w-full">
        <TooltipProvider>
          <aside
            className={`hidden xl:flex border-r md:flex-3 min-h-full tranition duration-300 flex items-center ${isOpen ? "!flex-1" : ""}`}
          >
            <Sidebar isCollapsed={isOpen} />
          </aside>
          <aside
            className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[oklch(0.2_0_0)] transform transition-transform duration-300 xl:hidden flex flex-col w-full md:w-80 md:border-r ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="flex justify-end p-4">
              <button
                onClick={toMobileSidebar}
                className="flex items-center justify-center p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-all"
              >
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar isCollapsed={false} />
            </div>
          </aside>
        </TooltipProvider>
        <div className="flex-14 flex flex-col">
          <div className="border-b min-h-25 xl:min-h-30 flex w-full items-center justify-between px-4 xl:px-10">
            <div className="flex gap-4">
              <button
                onClick={toSetSidebar}
                className="hidden xl:flex items-center justify-center transition duration-200 p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-all overflow-hidden"
              >
                {isOpen ? (
                  <PanelRightClose size={26} />
                ) : (
                  <PanelRightOpen size={26} />
                )}
              </button>
              <button
                onClick={toMobileSidebar}
                className="flex xl:hidden items-center justify-center transition duration-200 p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-all overflow-hidden"
              >
                <Menu />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Topbar />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
