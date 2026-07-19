import { Link } from "react-router-dom";
import { Mail, Linkedin, Facebook, Instagram, Twitter } from "lucide-react";
import ContactDialog from "@/components/ContactDialog";

const NAV = [
  { name: "Services", id: "services" },
  { name: "How It Works", id: "how-it-works" },
  { name: "Industries", id: "industries" },
  { name: "Results", id: "results" },
  { name: "Contact", id: "contact" },
];

const SERVICES = [
  "CRM Setup & Organization",
  "Lead Management Systems",
  "Workflow Automation",
  "Business Operations",
  "Ongoing Support",
];

const SOCIALS = [
  { Icon: Linkedin, label: "LinkedIn" },
  { Icon: Facebook, label: "Facebook" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Twitter, label: "X (Twitter)" },
];

export const Footer = () => {
  return (
    <footer data-testid="footer" className="relative overflow-hidden bg-[#0F172A] border-t border-white/10 pt-16 pb-8">
      {/* animated workflow line across the top */}
      <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-[#5B21B6] to-transparent opacity-70" />
        <div className="absolute top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-[#10B981] to-transparent animate-glow-pulse" />
      </div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-96 rounded-full bg-[#5B21B6]/15 blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* brand */}
          <div className="md:col-span-2">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B21B6] shadow-[0_0_18px_rgba(91,33,182,0.6)]">
                <span className="h-3 w-3 rounded-sm bg-[#10B981]" />
              </span>
              <span className="text-lg font-extrabold font-manrope tracking-tight text-white">
                FloForge <span className="text-slate-400 font-semibold">Automations</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Reliable systems that organize your leads, automate your follow-ups, and keep
              your business running smoothly—so you can focus on growth, not paperwork.
            </p>
            <a href="mailto:hello@floforge.io" data-testid="footer-email" className="mt-5 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <Mail size={15} className="text-[#10B981]" /> hello@floforge.io
            </a>
            <div className="mt-6">
              <ContactDialog trigger={
                <button data-testid="footer-cta" className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-sm font-semibold font-manrope px-5 py-2.5 rounded-md transition-all duration-300 shadow-[0_0_15px_rgba(91,33,182,0.4)] hover:shadow-[0_0_25px_rgba(91,33,182,0.7)] hover:-translate-y-0.5">
                  Start Now
                </button>
              } />
            </div>
          </div>

          {/* nav */}
          <div>
            <h4 className="font-manrope font-semibold text-white text-sm mb-4">Navigate</h4>
            <ul className="space-y-2.5">
              {NAV.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} data-testid={`footer-link-${l.id}`} className="text-sm text-slate-400 hover:text-white transition-colors">{l.name}</a>
                </li>
              ))}
              <li>
                <Link to="/pricing" data-testid="footer-link-pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</Link>
              </li>
            </ul>
          </div>

          {/* services */}
          <div>
            <h4 className="font-manrope font-semibold text-white text-sm mb-4">Services</h4>
            <ul className="space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s}><a href="#services" className="text-sm text-slate-400 hover:text-white transition-colors">{s}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-xs text-slate-500 order-3 sm:order-1">© {new Date().getFullYear()} FloForge Automations. All rights reserved.</p>

          {/* social placeholders */}
          <div className="flex items-center gap-3 order-1 sm:order-2">
            {SOCIALS.map(({ Icon, label }) => (
              <span
                key={label}
                data-testid={`footer-social-${label.toLowerCase().split(" ")[0]}`}
                aria-label={`${label} (coming soon)`}
                title={`${label} — coming soon`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-500 hover:text-[#a78bfa] hover:border-[#5B21B6]/40 hover:-translate-y-0.5 transition-all duration-300 cursor-default"
              >
                <Icon size={15} />
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6 order-2 sm:order-3">
            <Link to="/privacy" data-testid="footer-privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <a href="#contact" data-testid="footer-terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
