import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Shield, Globe2, Banknote, CreditCard, TrendingUp, Smartphone,
  Users, Briefcase, ArrowRight, Check, Star,
} from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Crest Nova Holdings — Premium Digital Banking" },
      { name: "description", content: "Multi-currency accounts, global transfers, business banking, and wealth management in one secure platform." },
      { property: "og:title", content: "Crest Nova Holdings — Premium Digital Banking" },
      { property: "og:description", content: "Multi-currency accounts, global transfers, business banking, and wealth management." },
    ],
  }),
  component: Index,
});

const services = [
  { icon: Banknote, title: "Savings Accounts", desc: "Industry-leading rates with zero monthly fees." },
  { icon: Briefcase, title: "Business Banking", desc: "Scale globally with multi-currency business accounts." },
  { icon: Globe2, title: "International Transfers", desc: "Send money to 180+ countries at the real rate." },
  { icon: CreditCard, title: "Premium Cards", desc: "Metal cards with concierge and travel benefits." },
  { icon: Smartphone, title: "Mobile Banking", desc: "Manage everything from a beautifully designed app." },
  { icon: TrendingUp, title: "Investments", desc: "Build wealth with curated portfolios and advisors." },
  { icon: Shield, title: "Wealth Management", desc: "Bespoke strategies for high-net-worth individuals." },
  { icon: Users, title: "Personal Loans", desc: "Fast decisions with competitive interest rates." },
];

const whyUs = [
  { icon: Shield, title: "Bank-grade security", desc: "256-bit encryption, biometric auth, and 24/7 fraud monitoring." },
  { icon: Globe2, title: "Global by default", desc: "Multi-currency accounts in 40+ currencies, no hidden fees." },
  { icon: TrendingUp, title: "Smart insights", desc: "AI-powered analytics so your money works harder." },
  { icon: Smartphone, title: "Award-winning app", desc: "Designed for clarity and speed on any device." },
  { icon: Users, title: "Human support", desc: "Real people, available around the clock." },
  { icon: Briefcase, title: "Enterprise ready", desc: "From freelancers to corporations, we scale with you." },
];

const testimonials = [
  { name: "Olivia Bennett", country: "United Kingdom", text: "Crest Nova transformed how our family handles international finances. Service is impeccable.", img: "https://randomuser.me/api/portraits/women/12.jpg" },
  { name: "Marcus Chen", country: "Singapore", text: "Business banking that actually understands global commerce. Transfers settle in hours, not days.", img: "https://randomuser.me/api/portraits/men/22.jpg" },
  { name: "Sofia Rodríguez", country: "Spain", text: "The app is gorgeous and the rates beat every traditional bank I've used.", img: "https://randomuser.me/api/portraits/women/33.jpg" },
  { name: "James Whitmore", country: "United States", text: "Concierge banking without the snobbery. Truly modern private banking.", img: "https://randomuser.me/api/portraits/men/45.jpg" },
  { name: "Amara Okafor", country: "Nigeria", text: "Finally a bank that treats African entrepreneurs as global citizens.", img: "https://randomuser.me/api/portraits/women/56.jpg" },
  { name: "Henrik Larsen", country: "Norway", text: "I moved my entire portfolio. The wealth team is exceptional.", img: "https://randomuser.me/api/portraits/men/67.jpg" },
  { name: "Priya Sharma", country: "India", text: "Onboarding took minutes. International transfers are effortless.", img: "https://randomuser.me/api/portraits/women/78.jpg" },
  { name: "Daniel Müller", country: "Germany", text: "The most refined banking experience I have used. Highly recommended.", img: "https://randomuser.me/api/portraits/men/89.jpg" },
];

const faqs = [
  { q: "How do I open an account?", a: "Sign up in under 3 minutes — verify your identity, and your account is ready immediately." },
  { q: "Is my money safe?", a: "Yes. Deposits are insured up to applicable regulatory limits and we use bank-grade encryption." },
  { q: "Do you support multi-currency?", a: "We support 40+ currencies with real exchange rates and no hidden markups." },
  { q: "Are there monthly fees?", a: "Personal accounts are free. Business and premium tiers have transparent pricing." },
  { q: "Can I get a loan?", a: "Yes, we offer personal, home, vehicle, and business loans with competitive rates." },
  { q: "How fast are international transfers?", a: "Most transfers settle within hours; some routes are instant." },
  { q: "Do you offer cards?", a: "Yes — virtual and physical metal cards with worldwide acceptance." },
  { q: "How can I reach support?", a: "24/7 in-app chat, email, and phone support — staffed by real bankers." },
];

function Counter({ to, suffix = "", duration = 1500 }: { to: number; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setN(Math.floor(p * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span>{n.toLocaleString()}{suffix}</span>;
}

function Index() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, []);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://lpc.com/wp-content/uploads/Bank-Building_Hero_V2.jpeg)" }}
          aria-hidden
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.18 0.06 260 / 0.92), oklch(0.22 0.08 260 / 0.78))" }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, oklch(0.78 0.11 80 / 0.4), transparent 50%), radial-gradient(circle at 80% 70%, oklch(0.6 0.2 260 / 0.5), transparent 50%)" }} />

        <div className="relative container mx-auto px-4 lg:px-8 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-primary-foreground">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              Trusted by 250,000+ customers worldwide
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Banking redefined for the <span className="text-gradient-gold">modern world</span>
            </h1>
            <p className="mt-6 text-lg opacity-90 max-w-xl">
              Premium digital banking with multi-currency accounts, global transfers, and white-glove service — designed for ambitious people and businesses.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-gold text-primary hover:bg-gold/90 shadow-gold">
                <Link to="/register">Open an account <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">
                <Link to="/login">Online banking</Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { v: 250000, s: "+", l: "Customers" },
                { v: 180, s: "+", l: "Countries" },
                { v: 12, s: "M+", l: "Transactions" },
                { v: 99, s: "%", l: "Uptime" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl md:text-3xl font-bold text-gold"><Counter to={s.v} suffix={s.s} /></div>
                  <div className="text-xs opacity-70 uppercase tracking-wider mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* dashboard mockup */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:block">
            <div className="glass rounded-3xl p-6 shadow-elegant">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs text-muted-foreground">Total balance</div>
                  <div className="font-display text-3xl font-bold">$284,592.40</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">+12.4%</div>
              </div>
              <div className="h-32 rounded-xl bg-gradient-hero p-4 text-primary-foreground flex flex-col justify-between mb-4 shadow-elegant">
                <div className="flex justify-between items-start">
                  <div className="text-xs opacity-80">CREST NOVA · PLATINUM</div>
                  <div className="text-xs">VISA</div>
                </div>
                <div>
                  <div className="font-mono tracking-widest text-sm">•••• •••• •••• 4821</div>
                  <div className="text-xs opacity-80 mt-1">JAMES W · 09/29</div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { t: "Transfer to Sofia", a: "-$1,240.00", c: "text-foreground" },
                  { t: "Salary deposit", a: "+$8,500.00", c: "text-success" },
                  { t: "Investment yield", a: "+$320.40", c: "text-success" },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                    <span>{r.t}</span><span className={`font-medium ${r.c}`}>{r.a}</span>
                  </div>
                ))}
              </div>
            </div>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-6 -right-6 glass rounded-2xl p-4 shadow-elegant">
              <div className="text-xs text-muted-foreground">Savings</div>
              <div className="font-display font-bold text-lg">€48,210</div>
            </motion.div>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 shadow-elegant">
              <div className="text-xs text-muted-foreground">Transfer sent</div>
              <div className="font-medium text-sm flex items-center gap-2"><Check className="h-4 w-4 text-success" /> £2,400 to UK</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-widest text-gold mb-3">What we do</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Premium banking, tailored to you</h2>
            <p className="mt-4 text-muted-foreground">Everything you need to manage, grow, and protect your wealth.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="p-6 h-full hover:-translate-y-1 hover:shadow-elegant transition-all group cursor-pointer border-border">
                  <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center text-gold mb-4 group-hover:bg-gradient-gold group-hover:text-primary transition-all">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-widest text-gold mb-3">Why Crest Nova</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Built for those who expect more</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((w) => (
              <div key={w.title} className="p-6 rounded-2xl border border-border bg-card hover:shadow-elegant transition">
                <div className="w-11 h-11 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-4">
                  <w.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{w.title}</h3>
                <p className="text-sm text-muted-foreground">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVATE BANKING SPLIT */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative rounded-3xl overflow-hidden shadow-elegant aspect-[4/3]">
            <img
              src="https://media.istockphoto.com/id/1927881398/photo/group-of-business-persons-talking-in-the-office.jpg"
              alt="Crest Nova advisors meeting with clients"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="text-xs uppercase tracking-widest text-gold mb-3">Private banking</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">A dedicated advisor for every chapter of your wealth</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              From your first paycheck to your family office, the Crest Nova private banking desk pairs you with a senior advisor and a discreet team that already knows your goals before you walk in.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Bespoke lending and structured credit", "Tax-aware portfolio construction", "Concierge and lifestyle services 24/7"].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8 bg-gradient-hero">
              <Link to="/services">Explore private banking <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* BRANCHES BANNER */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://dashboard.thefinanser.com/wp-content/uploads/2025/05/Branches.jpg)" }}
          aria-hidden
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.15 0.05 260 / 0.88), oklch(0.18 0.05 260 / 0.72))" }} />
        <div className="relative container mx-auto px-4 lg:px-8 text-primary-foreground text-center max-w-3xl">
          <div className="text-xs uppercase tracking-widest text-gold mb-3">Global footprint</div>
          <h2 className="font-display text-3xl md:text-5xl font-bold">A branch network without the branch lines</h2>
          <p className="mt-4 opacity-90 max-w-2xl mx-auto">
            Walk into one of our flagship lounges in New York, London, Singapore, or Dubai — or carry the same private bank in your pocket, everywhere else.
          </p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { v: "42", l: "Flagship lounges" },
              { v: "180+", l: "Countries served" },
              { v: "24/7", l: "Concierge desk" },
              { v: "$12B", l: "Custody assets" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl md:text-4xl font-bold text-gold">{s.v}</div>
                <div className="text-xs uppercase tracking-wider opacity-70 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IN-BRANCH EXPERIENCE */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="order-2 lg:order-1">
            <div className="text-xs uppercase tracking-widest text-gold mb-3">In-branch & in-app</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">The warmth of a teller, the speed of the cloud</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Cash services, notarisation, and document review at our branches — paired with one-tap transfers, virtual cards, and live chat in the app. One ledger, every channel.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { v: "< 2 min", l: "Avg branch wait" },
                { v: "98%", l: "First-contact resolution" },
              ].map((s) => (
                <Card key={s.l} className="p-5 bg-gradient-card">
                  <div className="font-display text-2xl font-bold text-primary">{s.v}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.l}</div>
                </Card>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative rounded-3xl overflow-hidden shadow-elegant aspect-[4/3] order-1 lg:order-2">
            <img
              src="https://onemoneyway.com/wp-content/uploads/2024/08/clerk-counting-cash-money-at-bank-office-2023-11-27-05-01-17-utc-1.jpg"
              alt="Crest Nova teller serving a client"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* FLAGSHIP HQ */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative rounded-3xl overflow-hidden shadow-elegant aspect-[4/3]">
            <img
              src="https://lpc.com/wp-content/uploads/Bank-Building_Hero_V2.jpeg"
              alt="Crest Nova flagship headquarters"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="text-xs uppercase tracking-widest text-gold mb-3">Our headquarters</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Anchored on Park Avenue. At home everywhere else.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Our New York flagship hosts the trading floor, the private banking lounge, and a 24/7 client studio. Visit us in person — or let us come to you, anywhere in the world.
            </p>
            <Button asChild variant="outline" size="lg" className="mt-6">
              <Link to="/contact">Plan a visit</Link>
            </Button>
          </motion.div>
        </div>
      </section>



      {/* TESTIMONIALS */}
      <section className="py-20 lg:py-28 bg-surface overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-widest text-gold mb-3">Testimonials</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Loved by customers worldwide</h2>
          </div>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5 px-4 lg:px-8">
            {testimonials.map((t) => (
              <div key={t.name} className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%]">
                <Card className="p-6 h-full">
                  <div className="flex gap-1 text-gold mb-3">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-sm leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.country}</div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-gold mb-3">FAQ</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Frequently asked questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-16 text-center text-primary-foreground shadow-elegant">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, oklch(0.78 0.11 80 / 0.5), transparent 50%)" }} />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-5xl font-bold">Ready to elevate your banking?</h2>
              <p className="mt-4 opacity-90 max-w-xl mx-auto">Open your account in minutes. No paperwork, no branch visits.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button size="lg" asChild className="bg-gold text-primary hover:bg-gold/90 shadow-gold">
                  <Link to="/register">Open an account <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">
                  <Link to="/contact">Talk to us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
