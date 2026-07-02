import { motion } from "framer-motion";
import {
  Inbox,
  MailCheck,
  FolderKanban,
  Network,
  Search,
  Database,
  Workflow,
  LayoutGrid,
  LifeBuoy,
  Sparkles,
  MessagesSquare,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import ContactDialog from "@/components/ContactDialog";

const OUTCOMES = [
  { Icon: Inbox, title: "Every Lead Accounted For", desc: "Build organized processes that reduce the chance of customer inquiries being forgotten." },
  { Icon: MailCheck, title: "Consistent Customer Follow-Up", desc: "Create reliable reminders and workflows so customers receive timely communication." },
  { Icon: FolderKanban, title: "More Organized Operations", desc: "Replace scattered notes and manual processes with one organized operational system." },
  { Icon: Network, title: "Built to Scale", desc: "As your business grows, your systems grow with it—without becoming more complicated." },
];

const TIMELINE = [
  { Icon: Search, label: "Discovery" },
  { Icon: Database, label: "CRM Setup" },
  { Icon: Workflow, label: "Workflow Automation" },
  { Icon: LayoutGrid, label: "Organized Operations" },
  { Icon: LifeBuoy, label: "Long-Term Support" },
];

const TRUST = ["Customized Systems", "Transparent Communication", "Reliable Support", "Continuous Improvement"];
const TRUST_ICONS = [Sparkles, MessagesSquare, ShieldCheck, RefreshCw];

export const Results = () => {
  return (
    <section id="results" data-testid="results-section" className="relative overflow-hidden bg-[#F8FAFC] py-24 lg:py-32 text-slate-900">
      {/* light blueprint grid + ambient */}
      <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      <div className="absolute top-24 right-0 h-72 w-72 rounded-full bg-[#5B21B6]/10 blur-[120px]" />
      <div className="absolute bottom-10 left-0 h-72 w-72 rounded-full bg-[#10B981]/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* heading */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="max-w-2xl">
          <span data-testid="results-label" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#5B21B6] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5B21B6]" />RESULTS
          </span>
          <h2 data-testid="results-heading" className="mt-6 font-manrope font-extrabold tracking-tighter text-slate-900 text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.05]">
            Better Systems.{" "}
            <span className="bg-gradient-to-r from-[#5B21B6] to-[#10B981] bg-clip-text text-transparent">Better Business.</span>
          </h2>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            The right systems don't just save time—they create consistency, improve
            customer experiences, and help businesses grow with confidence.
          </p>
        </motion.div>

        {/* outcome cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {OUTCOMES.map(({ Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: i * 0.1 }}
              data-testid={`outcome-card-${i}`}
              className="group rounded-[22px] border border-slate-900/10 bg-white/70 backdrop-blur-xl p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-2 hover:border-[#5B21B6]/50 hover:shadow-[0_20px_50px_rgba(91,33,182,0.15)]">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B21B6]/10 border border-[#5B21B6]/20 text-[#5B21B6] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#5B21B6] group-hover:text-white">
                <Icon size={22} />
              </span>
              <h3 className="mt-5 font-manrope font-bold text-lg text-slate-900 tracking-tight">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* case studies */}
        <div className="mt-24">
          <h3 className="font-manrope font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight text-center">Future Client Success Stories</h3>
          <p className="mt-3 text-center text-sm text-slate-500">This space will feature real client success stories as FloForge grows.</p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}
                data-testid={`case-study-${i}`}
                className="rounded-[22px] border border-slate-900/10 bg-white/60 backdrop-blur-xl p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#5B21B6] bg-[#5B21B6]/10 px-2.5 py-1 rounded-full">Future Success Story</span>
                  <span className="h-8 w-8 rounded-full bg-slate-200 grayscale" />
                </div>
                <div className="mt-5 space-y-3">
                  {[["Business Name", "w-2/3"], ["Industry", "w-1/2"], ["Challenge", "w-full"], ["Solution", "w-5/6"], ["Outcome", "w-3/4"]].map(([label, w]) => (
                    <div key={label}>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{label}</p>
                      <div className={`mt-1 h-2.5 rounded-full bg-slate-200/80 ${w}`} />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* timeline */}
        <div className="mt-24">
          <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="absolute top-7 left-6 right-6 hidden lg:block h-px bg-slate-200 overflow-hidden">
              <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: "easeInOut" }} style={{ transformOrigin: "left" }} className="h-full w-full bg-gradient-to-r from-[#5B21B6] to-[#10B981]" />
            </div>
            {TIMELINE.map(({ Icon, label }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.18 }} className="relative flex flex-col items-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-[#5B21B6]/30 text-[#5B21B6] shadow-[0_4px_20px_rgba(91,33,182,0.12)]">
                  <Icon size={20} />
                </span>
                <p className="mt-3 font-manrope font-semibold text-sm text-slate-800">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* trust card */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }}
          className="mt-24 rounded-[28px] border border-slate-900/10 bg-white/70 backdrop-blur-2xl p-10 sm:p-12 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="max-w-2xl">
            <h3 className="font-manrope font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">Built on Long-Term Partnerships</h3>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              We believe great operational systems are built through collaboration,
              continuous improvement, and a commitment to helping businesses become more
              organized every day.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST.map((t, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <div key={t} data-testid={`trust-badge-${i}`} className="group flex items-center gap-3 rounded-xl border border-slate-900/10 bg-white px-4 py-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#5B21B6]/40 hover:shadow-[0_8px_24px_rgba(91,33,182,0.12)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] transition-transform group-hover:scale-110">
                    <Icon size={16} />
                  </span>
                  <span className="text-sm font-medium text-slate-800">{t}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* closing CTA */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-24 text-center">
          <h3 className="font-manrope font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">Your Success Story Could Be Next</h3>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 leading-relaxed">
            We're currently working with early businesses to build smarter operational
            systems while developing real-world case studies and long-term partnerships.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <ContactDialog trigger={
              <button data-testid="results-primary-cta" className="group inline-flex items-center justify-center gap-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-manrope font-semibold px-8 py-4 rounded-lg shadow-[0_4px_24px_rgba(91,33,182,0.35)] hover:shadow-[0_8px_34px_rgba(91,33,182,0.5)] hover:-translate-y-1 transition-all duration-300">
                Schedule a Free Consultation
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            } />
            <a href="#how-it-works" data-testid="results-secondary-cta" className="inline-flex items-center justify-center border border-slate-900/15 hover:border-slate-900/40 bg-white/60 hover:bg-white text-slate-900 font-manrope font-semibold px-8 py-4 rounded-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
              See Our Process
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Results;
