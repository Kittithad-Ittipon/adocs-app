"use client";

import { ArrowUpRight, BookOpenText, House, LogIn, Menu, Rocket, SquareActivity, UserPlus } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Home", href: "/", icon: House, external: false },
  { label: "Document", href: "https://adocs-document.vercel.app/docs", icon: BookOpenText, external: true },
  { label: "Containers", href: "/containers", icon: SquareActivity, external: false },
];

export default function Navbar() {
  const pathname = usePathname();
  const logoGradientId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 150, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (desktop.matches) setIsOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <motion.header initial={false} animate={reducedMotion ? { opacity: 1 } : { opacity: [0, 1], y: [-8, 0] }} transition={{ duration: 0.4 }} className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-6 px-6 md:px-10 xl:h-30">
        <Link href="/" aria-label="ADOCS home" className="group flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Rocket stroke={"url(#" + logoGradientId + ")"} className="size-8 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-rotate-12 md:size-10" aria-hidden="true">
            <defs>
              <linearGradient id={logoGradientId} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </Rocket>
          <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-violet-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-sky-400 dark:via-cyan-300 dark:to-violet-400 md:text-3xl">ADOCS</span>
        </Link>
        <div className="hidden items-center gap-2 xl:flex">
          {navigation.map(({ label, href, icon: Icon, external }) => (
            <Button key={href} asChild variant="ghost" className={cn("relative isolate h-11 px-4 text-sm", isActive(href) && "text-sky-600 dark:text-cyan-300")}>
              <Link href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} aria-current={isActive(href) ? "page" : undefined}>
                {isActive(href) && <motion.span layoutId="navigation-active" className="absolute inset-0 -z-10 rounded-md bg-sky-500/10" transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 30 }} />}
                <Icon aria-hidden="true" /> {label} {external && <ArrowUpRight className="size-3" aria-hidden="true" />}
              </Link>
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden items-center gap-2 xl:flex">
            <Button asChild variant="ghost" className="h-11 px-4"><Link href="/login"><LogIn aria-hidden="true" /> Login</Link></Button>
            <Button asChild className="h-11 px-5"><Link href="/register"><UserPlus aria-hidden="true" /> Register</Link></Button>
          </div>
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild><Button type="button" variant="outline" size="icon" className="size-[42px] xl:hidden" aria-label="Open navigation menu"><Menu className="size-6" aria-hidden="true" /></Button></SheetTrigger>
            <SheetContent className="w-[min(88vw,360px)] motion-reduce:transition-none" side="right">
              <SheetHeader className="px-6 pt-8">
                <SheetTitle className="bg-gradient-to-r from-sky-600 via-cyan-500 to-violet-500 bg-clip-text text-xl font-bold text-transparent dark:from-sky-400 dark:via-cyan-300 dark:to-violet-400">ADOCS</SheetTitle>
                <SheetDescription>Build, deploy, and manage your applications.</SheetDescription>
              </SheetHeader>
              <div className="space-y-2 px-4">
                {navigation.map(({ label, href, icon: Icon, external }, index) => (
                  <motion.div key={href} initial={reducedMotion ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: reducedMotion ? 0 : index * 0.04 }}>
                    <SheetClose asChild>
                      <Button asChild variant={isActive(href) ? "secondary" : "ghost"} className="h-12 w-full justify-start gap-3 px-4">
                        <Link href={href} onClick={() => setIsOpen(false)} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} aria-current={isActive(href) ? "page" : undefined}><Icon aria-hidden="true" /> {label} {external && <ArrowUpRight className="ml-auto size-4" aria-hidden="true" />}</Link>
                      </Button>
                    </SheetClose>
                  </motion.div>
                ))}
              </div>
              <Separator />
              <div className="space-y-3 px-4">
                <SheetClose asChild><Button asChild variant="outline" className="h-11 w-full"><Link href="/login" onClick={() => setIsOpen(false)}><LogIn aria-hidden="true" /> Login</Link></Button></SheetClose>
                <SheetClose asChild><Button asChild className="h-11 w-full"><Link href="/register" onClick={() => setIsOpen(false)}><UserPlus aria-hidden="true" /> Register</Link></Button></SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left bg-gradient-to-r from-sky-500 via-cyan-300 to-violet-500" style={{ scaleX: reducedMotion ? scrollYProgress : smoothProgress }} />
    </motion.header>
  );
}
