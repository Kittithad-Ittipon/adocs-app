import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";

export default function BrandMark({ className }: { className?: string }) {
  return <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-white", className)}><Rocket className="size-4" aria-hidden="true" /></span>;
}
