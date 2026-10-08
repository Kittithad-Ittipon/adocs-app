export default function SystemPageHeader({ title, description }: { title: string; description: string }) {
  return <header className="space-y-2"><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1><p className="max-w-2xl text-sm text-muted-foreground">{description}</p></header>;
}
