"use client";

import {
  Rocket,
  UserKey,
  UserPlus,
  Menu,
  X,
  House,
  BookOpenText,
  SquareActivity,
  ArrowUpRight,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { motion, useScroll } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();
  const { scrollYProgress } = useScroll();

  const isActive = (path: string) => {
    scrollYProgress;
    if (path === pathName) {
      return "text-sky-500 hover:text-black transition duration-200 dark:text-cyan-300 dark:hover:text-white rounded-md p-2 text-center w-35 hover:bg-black/5 dark:hover:bg-white/10";
    } else {
      return "transition duration-200 dark:hover:text-white text-center rounded-md p-2 w-35 hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center gap-1";
    }
  };

  return (
    <nav className="w-full h-30 flex items-center justify-center px-4 sticky top-0 left-0 z-50 bg-white dark:bg-[oklch(0.2_0_0)]">
      <div className="w-[95%] xl:w-[80%] h-full flex items-center justify-between">
        <div className="flex items-center h-full w-[30%] xl:w-[20%] transition duration-100">
          <div className="flex w-auto h-auto cursor-pointer items-center gap-2 group">
            <Rocket
              size={50}
              className="hidden xl:flex text-sky-500 dark:text-cyan-300 group-hover:text-cyan-300 dark:group-hover:text-sky-500 transition duration-200"
            />
            <Rocket
              size={35}
              className="xl:hidden flex text-sky-500 dark:text-cyan-300 group-hover:text-cyan-300 dark:group-hover:text-sky-500 transition duration-200"
            />
            <p className="text-xl md:text-2xl xl:text-3xl font-[700] bg-[linear-gradient(to_right,#0ea5e9,#67e8f9,#818cf8,#0ea5e9)] bg-clip-text text-transparent animate-rgb">
              ADOCS
            </p>
          </div>
        </div>
        <div className="hidden xl:flex justify-center gap-15 xl:gap-2 2xl:gap-4 3xl:gap-15 h-full items-center w-[40%] text-lg font-[600]">
          <Link href="/" className={isActive("/")}>
            Home
          </Link>
          <a
            href="https://adocs-document.vercel.app/docs"
            className={isActive("https://adocs-document.vercel.app/docs")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Document <ArrowUpRight strokeWidth={2} className="w-4 h-4" />
          </a>
          <Link href="/containers" className={isActive("/containers")}>
            Containers
          </Link>
        </div>
        <div className="hidden xl:flex gap-4 h-full items-center justify-end w-[30%] text-md font-[500]">
          <Link
            href="/login"
            className="flex items-center gap-2 w-40 justify-center items-center p-3 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition duration-200"
          >
            <UserKey />
            Login
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 w-40 justify-center items-center p-3 rounded-md bg-black/85 text-white hover:text-black hover:bg-black/5 transition duration-200 dark:bg-white dark:text-black dark:hover:text-white dark:hover:bg-white/5"
          >
            <UserPlus />
            Register
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex xl:hidden gap-4 h-full items-center justify-end w-[30%]">
          <button
            type="button"
            className="transition duration-300 p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
          <ThemeToggle />
        </div>
        {isOpen && (
          <div className="xl:hidden w-full bg-white h-auto absolute top-25 left-0 z-50 text-md font-[500] dark:bg-[oklch(0.2_0_0)]">
            <div className="flex flex-col gap-3 p-5">
              <Link
                href="/"
                className="rounded-lg transition duration-200 flex items-center gap-2 p-3 border-b border-transparent hover:bg-black/5 dark:hover:bg-white/10"
              >
                <House size={23} />
                Home
              </Link>
              <a
                href="https://adocs-document.vercel.app/docs"
                className="rounded-lg transition duration-200 flex items-center gap-2 p-3 border-b border-transparent hover:bg-black/5 dark:hover:bg-white/10"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpenText size={23} />
                Document
              </a>
              <Link
                href="/containers"
                className="rounded-lg transition duration-200 flex items-center gap-2 p-3 border-b border-transparent hover:bg-black/5 dark:hover:bg-white/10"
              >
                <SquareActivity size={23} />
                Containers
              </Link>
              <Link
                href="/login"
                className="rounded-lg transition duration-200 flex items-center gap-2 p-3 border-b border-transparent hover:bg-black/5 dark:hover:bg-white/10"
              >
                <UserKey size={23} />
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg transition duration-200 flex items-center gap-2 p-3 border-b border-transparent hover:bg-black/5 dark:hover:bg-white/10"
              >
                <UserPlus size={23} />
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
      {!isOpen && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-[linear-gradient(to_right,#0ea5e9,#67e8f9,#818cf8,#0ea5e9)] origin-left z-50"
          style={{ scaleX: scrollYProgress }}
        />
      )}
    </nav>
  );
}
