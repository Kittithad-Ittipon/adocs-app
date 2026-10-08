import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import LoadingLine from "@/components/feedback/LoadingLine";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AuthFrame({ children, footer, label = "Login", loading = false }: {
  children: ReactNode;
  footer: ReactNode;
  label?: string;
  loading?: boolean;
}) {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-muted/30 px-4 py-4 sm:px-6 sm:py-6">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      <LoadingLine loading={loading} fixed label="Submitting form" />
      <div className="relative w-full max-w-md [&_[data-slot=button]:active]:translate-y-0">
        <div className="mb-4 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm"><Link href="/"><ArrowLeft aria-hidden="true" /> Back to home</Link></Button>
          <ThemeToggle />
        </div>
        <Card className="gap-5 py-6 shadow-lg shadow-black/5">
          <CardHeader className="items-center text-center">
            <Link href="/" className="rounded-md bg-gradient-to-r from-sky-600 to-violet-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring">ADOCS</Link>
            <h1 className="sr-only">{label}</h1>
          </CardHeader>
          <CardContent>{children}</CardContent>
          <Separator />
          <CardFooter className="flex-col justify-center gap-2 text-sm text-muted-foreground">{footer}</CardFooter>
        </Card>
      </div>
    </div>
  );
}
