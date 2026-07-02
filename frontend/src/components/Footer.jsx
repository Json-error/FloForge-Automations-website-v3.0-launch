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

export const Footer = () => {
  return (
    <footer data-testid="footer" className="relative overflow-hidden bg-[#0F172A] border-t border-white/10 pt-16 pb-8">
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

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} FloForge Automations. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" data-testid="footer-privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#terms" data-testid="footer-terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
