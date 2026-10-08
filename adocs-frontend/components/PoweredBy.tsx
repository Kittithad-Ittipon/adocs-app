import { BookOpen, Boxes, FlaskConical, PanelsTopLeft, Palette, Shapes } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const technologies = [
  { icon: Boxes, title: "Docker", color: "text-sky-600 dark:text-sky-400", description: "Containerization", link: "https://www.docker.com/" },
  { icon: PanelsTopLeft, title: "Next.js", color: "text-violet-600 dark:text-violet-400", description: "React Framework", link: "https://nextjs.org/" },
  { icon: FlaskConical, title: "Flask", color: "text-emerald-600 dark:text-emerald-400", description: "Python Backend", link: "https://flask.palletsprojects.com/" },
  { icon: Palette, title: "Tailwind", color: "text-cyan-600 dark:text-cyan-400", description: "Utility CSS", link: "https://tailwindcss.com/" },
  { icon: BookOpen, title: "Nextra", color: "text-amber-600 dark:text-amber-400", description: "Documentation", link: "https://nextra.site/" },
  { icon: Shapes, title: "Lucide", color: "text-rose-600 dark:text-rose-400", description: "Icon Library", link: "https://lucide.dev/" },
];

export default function PoweredBy() {
  return (
    <section aria-labelledby="powered-title" className="w-full max-w-7xl px-6 py-20 md:px-10">
      <Reveal className="mb-10 text-center"><h2 id="powered-title" className="text-2xl font-bold tracking-tight md:text-3xl">Powered By</h2></Reveal>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {technologies.map(({ icon: Icon, title, description, link, color }, index) => (
          <Reveal key={title} delay={(index % 3) * 0.06} className="h-full" liftOnHover>
            <Card className="h-full gap-3 text-center transition-colors hover:border-sky-500/50 motion-reduce:transition-none">
              <CardContent className="flex h-full flex-col items-center gap-3 px-3">
                <Icon className={`size-8 ${color}`} aria-hidden="true" />
                <Button asChild variant="link" className="h-auto p-0 text-base"><a href={link} target="_blank" rel="noopener noreferrer" aria-label={`${title} website (opens in a new tab)`}>{title}</a></Button>
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
