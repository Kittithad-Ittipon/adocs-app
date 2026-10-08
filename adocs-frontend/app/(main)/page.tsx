import AboutUs from "@/components/AboutUs";
import ContactUs from "@/components/ContactUs";
import PoweredBy from "@/components/PoweredBy";
import Reveal from "@/components/Reveal";
import HomeExperience from "@/components/HomeExperience";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowUpRight, Boxes, Braces, CodeXml, Database, Globe, Rocket, Server, Settings, Terminal, Workflow } from "lucide-react";
import Link from "next/link";

const features = [
  { title: "Deployment", description: "Deploy your applications quickly and seamlessly with automated workflows.", icon: Rocket, link: "https://hub.docker.com/" },
  { title: "Docker Containers", description: "Run and manage isolated environments safely using Docker integration.", icon: Boxes, link: "https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04" },
  { title: "Local DNS", description: "Easily map your internal services with custom local domain names.", icon: Globe, link: "https://technitium.com/dns/" },
  { title: "Containers Management", description: "Take full control to start, stop, publish, or delete your containers.", icon: Settings, link: "https://docs.docker.com/reference/cli/docker/container/" },
];

const stacks = [
  { title: "HTML", description: "Jumpstart static websites with ready-to-deploy HTML, CSS, and JavaScript templates.", icon: CodeXml, link: "https://adocs-document.vercel.app/docs/html" },
  { title: "Python", description: "Build and deploy Python web applications with ready-to-use Flask templates.", icon: Terminal, link: "https://adocs-document.vercel.app/docs/python/flask" },
  { title: "PHP", description: "Optimized PHP and Laravel templates for dynamic applications.", icon: Braces, link: "https://adocs-document.vercel.app/docs/php/php" },
  { title: "Node.js", description: "Node.js, Express, and Next.js templates for full-stack deployment.", icon: Server, link: "https://adocs-document.vercel.app/docs/nodejs/express" },
  { title: "Databases", description: "Ready-made MySQL and PostgreSQL templates for instant database setups.", icon: Database, link: "https://adocs-document.vercel.app/docs/mysql" },
  { title: "Management Tools", description: "Container applications to manage your system. Follow the docs to get started.", icon: Workflow, link: "https://adocs-document.vercel.app/docs/docker-app" },
];

export default function Main() {
  return (
    <HomeExperience>
    <main className="flex min-h-screen w-full flex-col items-center">
      <section aria-labelledby="hero-title" className="relative isolate flex min-h-[540px] w-full items-center overflow-hidden bg-[url('/images/w02.webp')] bg-cover bg-center md:min-h-[620px] md:bg-[url('/images/w07.jpg')] xl:min-h-[calc(100dvh-120px)]">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10">
          <Reveal className="max-w-2xl space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Boxes className="size-4" aria-hidden="true" /> Build with containers
            </p>
            <h1 id="hero-title" className="text-6xl font-bold tracking-tight text-white md:text-8xl">Learn.<br />Build.<br /><span className="text-cyan-300">Deploy.</span></h1>
            <p className="max-w-lg text-base leading-relaxed text-white/85 md:text-lg">Manage containers, launch environments, and deploy websites through a user-friendly platform designed for developers.</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 bg-white px-6 text-black hover:bg-white/90">
                <Link href="https://adocs-document.vercel.app">Get Started <ArrowUpRight aria-hidden="true" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-white/30 bg-black/20 px-6 text-white hover:bg-white/15 hover:text-white dark:bg-black/20">
                <Link href="#features">Explore features <ArrowRight aria-hidden="true" /></Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="features" aria-labelledby="features-title" className="w-full max-w-7xl scroll-mt-24 px-6 py-20 md:px-10">
        <Reveal className="mx-auto mb-10 max-w-2xl space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-600 dark:text-cyan-300">Your deployment toolkit</p>
          <h2 id="features-title" className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to ship</h2>
          <p className="text-muted-foreground">Core tools for deploying applications and managing your local environment.</p>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ title, description, icon: Icon, link }, index) => (
            <Reveal key={title} delay={index * 0.06} className="h-full" liftOnHover>
              <Card className="group h-full transition-[border-color,box-shadow,background-color] duration-300 ease-out hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/10 motion-reduce:transition-none">
                <CardHeader className="flex-1">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-cyan-300"><Icon className="size-6" aria-hidden="true" /></div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild variant="ghost" className="-ml-2 text-sky-600 dark:text-cyan-300">
                    <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`Learn more about ${title} (opens in a new tab)`}>Learn More <ArrowRight className="motion-safe:transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" /></a>
                  </Button>
                </CardFooter>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="stacks-title" className="w-full border-y bg-muted/35">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <Reveal className="mx-auto mb-10 max-w-2xl space-y-3 text-center">
            <h2 id="stacks-title" className="text-3xl font-bold tracking-tight md:text-4xl">Frameworks &amp; Databases</h2>
            <p className="text-muted-foreground">Deploy a wide range of applications with our officially documented stacks.</p>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stacks.map(({ title, description, icon: Icon, link }, index) => (
              <Reveal key={title} delay={(index % 3) * 0.06} className="h-full" liftOnHover>
                <Card className="group h-full transition-[border-color,box-shadow,background-color] duration-300 ease-out hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/10 motion-reduce:transition-none">
                  <CardHeader className="flex-1">
                    <Icon className="mb-4 size-8 text-sky-600 dark:text-cyan-300" aria-hidden="true" />
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardFooter><Button asChild variant="ghost" className="-ml-2"><a href={link} target="_blank" rel="noopener noreferrer" aria-label={`Read ${title} documentation (opens in a new tab)`}>Read Docs <ArrowUpRight aria-hidden="true" /></a></Button></CardFooter>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <AboutUs />
      <ContactUs />
      <PoweredBy />
    </main>
    </HomeExperience>
  );
}
