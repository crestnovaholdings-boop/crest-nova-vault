import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, Fingerprint, Lock, ServerCog, ShieldCheck, Vault } from "lucide-react";
import { PageHeader, SimplePage, CTASection } from "@/components/site/page-parts";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security — Crest Nova Holdings" },
      { name: "description", content: "Bank-grade security, biometric authentication, and 24/7 fraud monitoring on every account." },
      { property: "og:title", content: "Security at Crest Nova" },
      { property: "og:description", content: "How we protect your money, your data, and your peace of mind." },
      { property: "og:url", content: "/security" },
    ],
    links: [{ rel: "canonical", href: "/security" }],
  }),
  component: SecurityPage,
});

const pillars = [
  { icon: Lock, title: "End-to-end encryption", desc: "256-bit AES encryption at rest, TLS 1.3 in transit." },
  { icon: Fingerprint, title: "Biometric authentication", desc: "Face ID, Touch ID, and hardware security keys supported." },
  { icon: Eye, title: "24/7 fraud monitoring", desc: "ML-driven anomaly detection with instant alerts." },
  { icon: Vault, title: "Segregated custody", desc: "Client funds held with tier-1 custodian banks." },
  { icon: ServerCog, title: "SOC 2 Type II", desc: "Independently audited controls across our entire stack." },
  { icon: ShieldCheck, title: "FDIC insured", desc: "Eligible deposits insured up to applicable limits." },
];

function SecurityPage() {
  return (
    <SimplePage>
      <PageHeader
        eyebrow="Security"
        title="Your money, locked behind military-grade defenses"
        subtitle="Security isn't a feature at Crest Nova — it's the foundation. Here's how we keep every dollar and every byte safe."
      />

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className="p-7 h-full hover:shadow-elegant transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mb-5">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg">{p.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{p.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Compliance & certifications</h2>
          <p className="mt-3 text-muted-foreground">
            Crest Nova operates under strict regulatory oversight and maintains certifications including SOC 2 Type II, PCI DSS Level 1, and ISO 27001. We undergo continuous third-party penetration testing and publish a public bug bounty program for security researchers.
          </p>
        </div>
      </section>

      <CTASection />
    </SimplePage>
  );
}
