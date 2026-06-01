import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Globe2, Smartphone, Zap } from "lucide-react";
import { PageHeader, SimplePage, CTASection } from "@/components/site/page-parts";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/banking")({
  head: () => ({
    meta: [
      { title: "Online Banking — Crest Nova Holdings" },
      { name: "description", content: "A beautifully designed banking platform: instant transfers, multi-currency accounts, real-time insights." },
      { property: "og:title", content: "Online Banking — Crest Nova Holdings" },
      { property: "og:description", content: "The modern way to bank — on web and mobile." },
      { property: "og:url", content: "/banking" },
    ],
    links: [{ rel: "canonical", href: "/banking" }],
  }),
  component: BankingPage,
});

const features = [
  { icon: Zap, title: "Instant transfers", desc: "Move money between Crest Nova accounts in seconds, 24/7." },
  { icon: Globe2, title: "40+ currencies", desc: "Hold, send, and receive in major and emerging currencies." },
  { icon: Smartphone, title: "Designed for mobile", desc: "A native experience on iOS and Android, beautifully fast." },
];

const benefits = [
  "Zero monthly fees on personal accounts",
  "Real exchange rates with transparent pricing",
  "Virtual cards in seconds for safer online shopping",
  "Automatic categorization and spending insights",
  "Round-ups, savings vaults, and shared accounts",
  "Open banking integrations with your favorite tools",
];

function BankingPage() {
  return (
    <SimplePage>
      <PageHeader
        eyebrow="Online banking"
        title="Banking that finally feels modern"
        subtitle="A single app for every account, every currency, every goal — backed by humans whenever you need them."
        bgImage="https://dashboard.thefinanser.com/wp-content/uploads/2025/05/Branches.jpg"
      />

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <Card className="p-7 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mb-5">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="text-xs uppercase tracking-widest text-gold mb-3">Everything included</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold">A premium account, without the premium price</h2>
          <ul className="mt-8 grid sm:grid-cols-2 gap-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTASection />
    </SimplePage>
  );
}
