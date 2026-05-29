import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 lg:px-8 py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center">
              <span className="text-primary font-display font-bold text-lg">C</span>
            </div>
            <div className="leading-tight">
              <div className="font-display font-semibold">Crest Nova</div>
              <div className="text-[10px] tracking-widest opacity-70 uppercase">Holdings</div>
            </div>
          </div>
          <p className="text-sm opacity-80 max-w-xs">
            Premium digital banking with global reach, multi-currency accounts, and white-glove service.
          </p>
          <div className="flex gap-3 mt-6">
            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-gold hover:text-primary flex items-center justify-center transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-gold mb-4">Banking</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/services" className="hover:text-gold">Personal banking</Link></li>
            <li><Link to="/services" className="hover:text-gold">Business banking</Link></li>
            <li><Link to="/banking" className="hover:text-gold">Online banking</Link></li>
            <li><Link to="/loans" className="hover:text-gold">Loans</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-gold mb-4">Company</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/about" className="hover:text-gold">About us</Link></li>
            <li><Link to="/security" className="hover:text-gold">Security</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            <li><a href="#" className="hover:text-gold">Careers</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-gold mb-4">Newsletter</h4>
          <p className="text-sm opacity-80 mb-4">Get insights from our finance experts.</p>
          <form action="https://formsubmit.co/info@crestnovaholdings.com" method="POST" className="flex gap-2">
            <input type="hidden" name="_subject" value="Newsletter subscription" />
            <input type="hidden" name="_captcha" value="false" />
            <input
              name="email"
              type="email"
              required
              placeholder="you@email.com"
              className="flex-1 px-3 py-2 rounded-md bg-white/10 placeholder:text-white/50 text-sm outline-none focus:ring-2 focus:ring-gold"
            />
            <button type="submit" className="px-4 py-2 rounded-md bg-gold text-primary text-sm font-medium hover:opacity-90">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-70">
          <p>© {new Date().getFullYear()} Crest Nova Holdings. All rights reserved.</p>
          <p>Member FDIC · Equal Housing Lender</p>
        </div>
      </div>
    </footer>
  );
}
