import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, subtitle, bgImage }: { eyebrow: string; title: string; subtitle: string; bgImage?: string }) {
  return (
    <section className="relative bg-gradient-hero text-primary-foreground py-20 md:py-28 overflow-hidden">
      {bgImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-hero/90" style={{ background: "linear-gradient(135deg, oklch(0.2 0.05 260 / 0.85), oklch(0.15 0.05 260 / 0.75))" }} />
        </>
      )}
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, oklch(0.78 0.11 80 / 0.4), transparent 50%)" }} />
      <div className="container relative mx-auto px-4 lg:px-8 text-center max-w-3xl">
        <div className="text-xs uppercase tracking-widest text-gold mb-3">{eyebrow}</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold">{title}</h1>
        <p className="mt-4 opacity-90">{subtitle}</p>
      </div>
    </section>
  );
}

export function SimplePage({ children }: { children: ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="rounded-3xl bg-gradient-hero p-10 md:p-14 text-center text-primary-foreground shadow-elegant">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Open your Crest Nova account today</h2>
          <p className="mt-3 opacity-90">It only takes a few minutes.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-primary hover:bg-gold/90"><Link to="/register">Get started</Link></Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20"><Link to="/contact">Contact us</Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}

