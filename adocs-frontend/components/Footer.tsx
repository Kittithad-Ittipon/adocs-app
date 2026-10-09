import Link from "next/link";
import Reveal from "@/components/Reveal";
import { Copyright } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-muted/30">
      <Reveal className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <Link href="/" className="rounded-sm bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 bg-clip-text text-xl font-bold tracking-tight text-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring dark:from-sky-400">ADOCS</Link>
            <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">2.1.0</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">Built with Docker, Next.js &amp; Flask.</p>
        </div>
        <Separator className="my-5" />
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs leading-relaxed text-muted-foreground sm:justify-start">
          <Copyright className="size-3.5 shrink-0" aria-hidden="true" />
          <span>2026 ADOCS Deployment Platform.</span>
        </p>
      </Reveal>
    </footer>
  );
}
