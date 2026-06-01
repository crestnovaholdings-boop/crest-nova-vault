import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Banknote, Briefcase, CreditCard, Globe2, Shield, Smartphone, TrendingUp, Users } from "lucide-react";
import { PageHeader, SimplePage, CTASection } from "@/components/site/page-parts";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Crest Nova Holdings" },
      { name: "description", content: "Personal, business, and private banking services — built around your goals." },
      { property: "og:title", content: "Services — Crest Nova Holdings" },
      { property: "og:description", content: "Multi-currency accounts, cards, loans, investments, and wealth management." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const services = [
  { icon: Banknote, title: "Savings Accounts", desc: "Industry-leading rates, instant access, zero monthly fees." },
  { icon: Briefcase, title: "Business Banking", desc: "Multi-currency business accounts that scale with you." },
  { icon: Globe2, title: "International Transfers", desc: "Send to 180+ countries at the mid-market rate." },
  { icon: CreditCard, title: "Premium Cards", desc: "Metal debit and credit cards with travel perks and concierge." },
  { icon: Smartphone, title: "Mobile Banking", desc: "Award-winning iOS and Android app — beautifully designed." },
  { icon: TrendingUp, title: "Investments", desc: "Curated portfolios, ETFs, and access to private markets." },
  { icon: Shield, title: "Wealth Management", desc: "Bespoke strategies for high-net-worth clients and families." },
  { icon: Users, title: "Personal Loans", desc: "Transparent rates, instant decisions, no hidden fees." },
];

function ServicesPage() {
  return (
    <SimplePage>
      <PageHeader
        eyebrow="What we do"
        title="A complete financial stack, in one platform"
        subtitle="Whether you're managing a household, scaling a company, or preserving generational wealth — Crest Nova has the right product."
        bgImage="https://onemoneyway.com/wp-content/uploads/2024/08/clerk-counting-cash-money-at-bank-office-2023-11-27-05-01-17-utc-1.jpg"
      />

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
              <Card className="p-7 h-full hover:shadow-elegant hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-5">
                  <s.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold mb-3">Built around you</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Real bankers. Real branches. Real reach.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Behind every Crest Nova product is a global team of bankers, advisors, and engineers — ready to help you make the next move with confidence.
            </p>
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-elegant aspect-[4/3]">
            <img
              src="https://lpc.com/wp-content/uploads/Bank-Building_Hero_V2.jpeg"
              alt="Crest Nova flagship building"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <CTASection />
    </SimplePage>
  );
}
