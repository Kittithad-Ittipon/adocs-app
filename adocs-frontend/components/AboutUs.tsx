import { Boxes, Github, Mail, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import TeamPortrait from "@/components/TeamPortrait";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const developers = [
  { name: "Kittithad Ittipon", role: "Software & Infrastructure Developer", fbLink: "https://www.facebook.com/a.kittihad", gmLink: "https://mail.google.com/mail/u/0/?fs=1&to=a.kittithad.ittipon@gmail.com&tf=cm", gitLink: "https://github.com/Kittithad-Ittipon", docker: "https://hub.docker.com/u/adocsdeploy", image: "/images/a_2.jpg" },
  { name: "Natthawut Ploenprom", role: "Technical Media Creator & API Tester", fbLink: "https://www.facebook.com/natthawut.ploenprom.2025", gmLink: "https://mail.google.com/mail/u/0/?fs=1&to=nat65.pwk@gmail.com&tf=cm", image: "/images/n.jpg" },
  { name: "Netnapha Wijitkhajee", role: "QA Tester & Documentation", fbLink: "https://www.facebook.com/netnapha.wijitkhajee", gmLink: "https://mail.google.com/mail/u/0/?fs=1&to=netnaphawijit4@gmail.com&tf=cm", image: "/images/d.jpg" },
];

export default function AboutUs() {
  return (
    <section aria-labelledby="team-title" className="w-full max-w-7xl px-6 py-20 md:px-10">
      <Reveal className="mx-auto mb-10 max-w-2xl space-y-3 text-center">
        <h2 id="team-title" className="text-3xl font-bold tracking-tight md:text-4xl">Our Team</h2>
        <p className="text-muted-foreground">The development team behind the Platform for Web Application Deployment and Management using Container Technology.</p>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {developers.map((developer, index) => (
          <Reveal key={developer.name} delay={index * 0.06} className="h-full" liftOnHover>
            <Card className="h-full items-center py-8 text-center transition-shadow hover:shadow-md motion-reduce:transition-none">
              <CardContent>
                <TeamPortrait src={developer.image} name={developer.name} />
              </CardContent>
              <CardHeader className="flex-1"><CardTitle className="text-lg">{developer.name}</CardTitle><CardDescription>{developer.role}</CardDescription></CardHeader>
              <CardFooter className="gap-2">
                <Button asChild variant="outline" size="icon"><a href={developer.fbLink} target="_blank" rel="noopener noreferrer" aria-label={`${developer.name} on Facebook (opens in a new tab)`}><Users aria-hidden="true" /></a></Button>
                <Button asChild variant="outline" size="icon"><a href={developer.gmLink} target="_blank" rel="noopener noreferrer" aria-label={`Email ${developer.name} (opens in a new tab)`}><Mail aria-hidden="true" /></a></Button>
                {developer.gitLink && <Button asChild variant="outline" size="icon"><a href={developer.gitLink} target="_blank" rel="noopener noreferrer" aria-label={`${developer.name} on GitHub (opens in a new tab)`}><Github aria-hidden="true" /></a></Button>}
                {developer.docker && <Button asChild variant="outline" size="icon"><a href={developer.docker} target="_blank" rel="noopener noreferrer" aria-label={`${developer.name} on Docker Hub (opens in a new tab)`}><Boxes aria-hidden="true" /></a></Button>}
              </CardFooter>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
