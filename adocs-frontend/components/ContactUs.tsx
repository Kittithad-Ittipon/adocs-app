"use client";

import { Mail, MessageSquare, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactUs() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function sendMail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.open(`https://mail.google.com/mail/u/0/?fs=1&to=adocs.deploy@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}&view=cm`, "_blank", "noopener,noreferrer");
  }

  return (
    <section aria-labelledby="contact-title" className="w-full border-y bg-muted/35 px-6 py-20 md:px-10">
      <Reveal className="mx-auto max-w-xl">
        <div className="mb-10 space-y-3 text-center">
          <h2 id="contact-title" className="text-3xl font-bold tracking-tight md:text-4xl">Contact Us</h2>
          <p className="text-muted-foreground">Questions about our container platform? Send us an email.</p>
        </div>
        <Card>
          <CardContent>
            <form onSubmit={sendMail} className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="contact-subject"><Mail className="size-4" aria-hidden="true" /> Subject</FieldLabel>
                  <Input id="contact-subject" name="subject" required placeholder="Enter your subject" className="h-11" value={subject} onChange={(event) => setSubject(event.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="contact-message"><MessageSquare className="size-4" aria-hidden="true" /> Message</FieldLabel>
                  <Textarea id="contact-message" name="message" required placeholder="How can we help?" className="min-h-36 resize-y" value={message} onChange={(event) => setMessage(event.target.value)} />
                  <FieldDescription>Opens a draft in Gmail so you can review and send your message.</FieldDescription>
                </Field>
              </FieldGroup>
              <Button type="submit" size="lg" className="h-11 w-full">Send Message <Send aria-hidden="true" /></Button>
            </form>
          </CardContent>
        </Card>
      </Reveal>
    </section>
  );
}
