import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, Globe } from "lucide-react";

export function AuthShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative bg-gradient-hero text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#C9A961_0%,transparent_50%)]" />
        <Link to="/" className="relative flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <span className="text-gold font-display font-bold">C</span>
          </div>
          <div>
            <div className="font-display text-lg">Crest Nova</div>
            <div className="text-[10px] tracking-widest uppercase text-white/70">Holdings</div>
          </div>
        </Link>
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-display leading-tight">Banking, reimagined for the modern era.</h2>
          <div className="space-y-3 text-white/80 text-sm">
            <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-gold" /> Bank-grade encryption</div>
            <div className="flex items-center gap-3"><Lock className="h-4 w-4 text-gold" /> Segregated custody</div>
            <div className="flex items-center gap-3"><Globe className="h-4 w-4 text-gold" /> Operating in 40+ countries</div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/60">© {new Date().getFullYear()} Crest Nova Holdings</p>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
              <span className="text-gold font-display font-bold">C</span>
            </div>
            <span className="font-display">Crest Nova Holdings</span>
          </Link>
          <h1 className="text-2xl font-display font-semibold">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
