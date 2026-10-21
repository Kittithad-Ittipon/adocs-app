import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

export default function SearchInput({ value, onChange, placeholder, label, className }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={label} className="pl-8 pr-8" />
      {value && <Button type="button" variant="ghost" size="icon-xs" onClick={() => onChange("")} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"><X aria-hidden="true" /></Button>}
    </div>
  );
}
