import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, Globe2, Heart, Shield, Target, Users } from "lucide-react";
import { PageHeader, SimplePage, CTASection } from "@/components/site/page-parts";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Crest Nova Holdings" },
      { name: "description", content: "Our story, our mission, and the team building the future of premium digital banking." },
      { property: "og:title", content: "About Crest Nova Holdings" },
      { property: "og:description", content: "Premium digital banking, built on trust, security, and global reach." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const values = [
  { icon: Shield, title: "Integrity", desc: "We safeguard your money and your trust with uncompromising standards." },
  { icon: Heart, title: "Client-first", desc: "Every product decision starts and ends with the people we serve." },
  { icon: Globe2, title: "Borderless", desc: "Finance should move as freely as the people and businesses it powers." },
  { icon: Target, title: "Precision", desc: "Beautifully engineered banking, down to every basis point." },
  { icon: Users, title: "Inclusive", desc: "Premium service for individuals, families, and enterprises alike." },
  { icon: Award, title: "Excellence", desc: "Awarded for innovation, design, and customer satisfaction." },
];

const stats = [
  { v: "180+", l: "Countries served" },
  { v: "$12B", l: "Assets under custody" },
  { v: "240k", l: "Active clients" },
  { v: "4.9 / 5", l: "App store rating" },
];

function AboutPage() {
  return (
    <SimplePage>
      <PageHeader
        eyebrow="Our story"
        title="Banking, reimagined for a global generation"
        subtitle="Founded by veterans of private banking and fintech, Crest Nova exists to make premium financial services feel effortless — wherever you live, work, or invest."
        bgImage="https://media.istockphoto.com/id/1927881398/photo/group-of-business-persons-talking-in-the-office.jpg"
      />

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="text-xs uppercase tracking-widest text-gold mb-3">Mission</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Move money the way the world actually works.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              The legacy banking system was built for a world of borders and branches. Crest Nova was built for a world of marketplaces, remote teams, and global families. We pair private-bank-grade service with modern technology so that opening an account, sending an international wire, or applying for a loan feels instant and human.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Today we serve clients across six continents from a single, secure platform — with a 24/7 concierge desk staffed by real people who care.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <Card key={s.l} className="p-6 text-center bg-gradient-card">
                <div className="font-display text-3xl font-bold text-primary">{s.v}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">{s.l}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs uppercase tracking-widest text-gold mb-3">What we stand for</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Values that shape every decision</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="p-6 h-full hover:shadow-elegant transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-gradient-hero flex items-center justify-center mb-4">
                    <v.icon className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="font-display font-semibold text-lg">{v.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{v.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </SimplePage>
  );
}
