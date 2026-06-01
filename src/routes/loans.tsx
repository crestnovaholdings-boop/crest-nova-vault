import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, Car, GraduationCap, Home } from "lucide-react";
import { PageHeader, SimplePage, CTASection } from "@/components/site/page-parts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/loans")({
  head: () => ({
    meta: [
      { title: "Loans — Crest Nova Holdings" },
      { name: "description", content: "Personal, mortgage, auto, and business loans with transparent rates and instant decisions." },
      { property: "og:title", content: "Loans — Crest Nova Holdings" },
      { property: "og:description", content: "Transparent rates, instant decisions, and white-glove service." },
      { property: "og:url", content: "/loans" },
    ],
    links: [{ rel: "canonical", href: "/loans" }],
  }),
  component: LoansPage,
});

const loans = [
  { icon: Home, title: "Mortgage", rate: "from 4.95% APR", desc: "Buy or refinance with personal guidance from a mortgage advisor." },
  { icon: Car, title: "Auto loans", rate: "from 5.49% APR", desc: "Finance new or used vehicles with flexible terms up to 7 years." },
  { icon: GraduationCap, title: "Education", rate: "from 5.99% APR", desc: "Invest in your future with deferred payments while studying." },
  { icon: Building2, title: "Business", rate: "from 6.25% APR", desc: "Working capital and expansion loans for growing companies." },
];

function LoansPage() {
  return (
    <SimplePage>
      <PageHeader
        eyebrow="Borrow with confidence"
        title="Loans designed around your life"
        subtitle="Decisions in minutes, transparent pricing, and human advisors when the numbers get serious."
        bgImage="https://s.hdnux.com/photos/01/41/40/63/25562360/3/ratio3x2_1920.jpg"
      />

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loans.map((l, i) => (
            <motion.div key={l.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className="p-7 h-full flex flex-col hover:shadow-elegant transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-5">
                  <l.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display font-semibold text-lg">{l.title}</h3>
                <div className="text-sm text-gold font-medium mt-1">{l.rate}</div>
                <p className="text-sm text-muted-foreground mt-2 flex-1">{l.desc}</p>
                <Button asChild variant="outline" className="mt-5 w-full">
                  <Link to="/register">Apply now</Link>
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Pre-qualify in 60 seconds</h2>
          <p className="mt-3 text-muted-foreground">No impact on your credit score. Real rates from real underwriters.</p>
          <Button asChild size="lg" className="mt-6 bg-gradient-hero">
            <Link to="/register">Check my rate</Link>
          </Button>
        </div>
      </section>

      <CTASection />
    </SimplePage>
  );
}
