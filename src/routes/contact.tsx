import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHeader, SimplePage } from "@/components/site/page-parts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRef } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Crest Nova Holdings" },
      { name: "description", content: "Reach the Crest Nova concierge team — available 24/7 by email, phone, or message." },
      { property: "og:title", content: "Contact Crest Nova Holdings" },
      { property: "og:description", content: "Get in touch with our concierge banking team." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().min(2, "Please enter your name").max(120),
  email: z.string().email("Enter a valid email").max(200),
  subject: z.string().min(2).max(200),
  message: z.string().min(10, "Tell us a little more").max(2000),
});

type FormValues = z.infer<typeof schema>;

function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = () => {
    formRef.current?.submit();
  };

  return (
    <SimplePage>
      <PageHeader
        eyebrow="We're here"
        title="Talk to a real human, 24/7"
        subtitle="Our concierge team replies in minutes — not days. Reach us however you like."
        bgImage="https://media.istockphoto.com/id/1927881398/photo/group-of-business-persons-talking-in-the-office.jpg"
      />

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "info@crestnovaholdings.com" },
              { icon: Phone, label: "Phone", value: "+1 (272) 363-8441" },
              { icon: MapPin, label: "HQ", value: "200 Park Avenue, New York, NY" },
            ].map((c) => (
              <Card key={c.label} className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center shrink-0">
                  <c.icon className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
                  <div className="text-sm font-medium mt-1">{c.value}</div>
                </div>
              </Card>
            ))}
            <Card className="overflow-hidden">
              <iframe
                title="Crest Nova HQ map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-73.9776%2C40.7536%2C-73.9684%2C40.7600&layer=mapnik"
                className="w-full h-56 border-0"
                loading="lazy"
              />
            </Card>
          </div>

          <Card className="p-7 lg:col-span-2">
            <h2 className="font-display text-2xl font-bold">Send us a message</h2>
            <p className="text-sm text-muted-foreground mt-1">We'll get back to you within one business hour.</p>
            <Form {...form}>
              <form
                ref={formRef}
                action="https://formsubmit.co/info@crestnovaholdings.com"
                method="POST"
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-6 grid gap-5"
              >
                <input type="hidden" name="_subject" value="New Crest Nova contact form" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value={typeof window !== "undefined" ? window.location.origin + "/contact?sent=1" : "/contact?sent=1"} />

                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="Ada Lovelace" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl><Input placeholder="How can we help?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl><Textarea rows={6} placeholder="Tell us a bit more..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" size="lg" className="bg-gradient-hero w-full sm:w-auto">
                  Send message
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </section>
    </SimplePage>
  );
}
