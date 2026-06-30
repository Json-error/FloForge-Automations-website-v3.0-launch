import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  XCircle,
  CheckCircle2,
  Clock,
  Target,
  Heart,
  Settings2,
  TrendingUp,
  HandshakeIcon,
  ArrowRight,
  Activity,
  ListChecks,
  CalendarClock,
  Trophy,
  Workflow,
  Zap,
} from "lucide-react";
import ContactDialog from "@/components/ContactDialog";

const WITHOUT = [
  "Missed leads",
  "Forgotten follow-ups",
  "Sticky notes",
  "Disorganized spreadsheets",
  "Repetitive manual work",
  "Scattered customer information",
  "Lost opportunities",
  "Inconsistent communication",
];

const WITH = [
  "Every lead organized",
  "Automated follow-ups",
  "Centralized customer records",
  "Clear sales pipeline",
  "Automated reminders",
  "Organized daily operations",
  "Reliable business systems",
  "Time saved every week",
];

const BENEFITS = [
  { Icon: Clock, title: "Save Time", desc: "Automate repetitive work and spend more time growing your business." },
  { Icon: Target, title: "Never Miss a Lead", desc: "Every customer inquiry is captured, organized, and tracked." },
  { Icon: Heart, title: "Better Customer Experience", desc: "Consistent follow-ups and organized communication improve every interaction." },
  { Icon: Settings2, title: "Built Around You", desc: "Every workflow is customized to match how your business actually operates." },
  { Icon: TrendingUp, title: "Grow With Confidence", desc: "Your systems evolve as your business expands." },
  { Icon: HandshakeIcon, title: "Ongoing Partnership", desc: "Receive continuous optimization and support—not just a one-time setup." },
];

const Counter = ({ to, suffix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 1200;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      setVal(Math.round((0.5 - Math.cos(p * Math.PI) / 2) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => (start = 0);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
};

const Widget = ({ Icon, label, children, delay = 0, accent = "#5B21B6" }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.5, delay }}
    className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md hover:border-white/20 transition-colors"
  >
    <div className="flex items-center gap-2 text-slate-400">
      <Icon size={14} style={{ color: accent === "#10B981" ? "#6ee7b7" : "#a78bfa" }} />
      <span className="text-[11px] font-medium tracking-wide">{label}</span>
    </div>
    <div className="mt-2.5">{children}</div>
  </motion.div>
);

export const WhyFloForge = () => {
  return (
    <section
      id="results"
      data-testid="why-section"
      className="relative overflow-hidden bg-[#0F172A] py-24 lg:py-32 border-t border-white/5"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(49,46,129,0.3),transparent_55%)]" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-40 right-10 h-72 w-72 rounded-full bg-[#5B21B6]/15 blur-[120px] animate-glow-pulse" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[16, 36, 55, 74, 90].map((left, i) => (
          <span key={left} className="absolute bottom-0 h-1 w-1 rounded-full bg-white/30" style={{ left: `${left}%`, animation: `particle-drift ${9 + i}s linear ${i * 1.4}s infinite` }} />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* heading */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="max-w-2xl">
          <span data-testid="why-label" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#a78bfa]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5B21B6]" />
            WHY FLOFORGE
          </span>
          <h2 data-testid="why-heading" className="mt-6 font-manrope font-extrabold tracking-tighter text-white text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.05]">
            Built Around Your Business,{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#10B981] bg-clip-text text-transparent">Not Generic Software</span>
          </h2>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            Technology should adapt to your business—not the other way around. Every
            system we build is designed around your processes, your customers, and the
            way your team works.
          </p>
        </motion.div>

        {/* comparison */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }} data-testid="why-without-panel" className="relative rounded-[24px] border border-red-500/20 bg-red-950/10 backdrop-blur-xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-2 mb-5">
              <XCircle size={18} className="text-red-400/80" />
              <h3 className="font-manrope font-bold text-lg text-slate-200">Without FloForge</h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WITHOUT.map((t, i) => (
                <motion.li key={t} initial={{ opacity: 0.3 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2.5 rounded-lg border border-red-500/10 bg-white/[0.02] px-3 py-2.5 text-sm text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500/60 shrink-0" />
                  <span className="line-through decoration-red-500/40">{t}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: 0.15 }} data-testid="why-with-panel" className="relative overflow-hidden rounded-[24px] border border-[#10B981]/30 bg-gradient-to-b from-[#312E81]/20 to-[#10B981]/5 backdrop-blur-xl p-7 shadow-[0_20px_60px_rgba(16,185,129,0.12)]">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#10B981]/20 blur-[60px]" />
            <div className="relative flex items-center gap-2 mb-5">
              <CheckCircle2 size={18} className="text-[#10B981]" />
              <h3 className="font-manrope font-bold text-lg text-white">With FloForge</h3>
            </div>
            <ul className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WITH.map((t, i) => (
                <motion.li key={t} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.06 }} className="flex items-center gap-2.5 rounded-lg border border-[#10B981]/15 bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-slate-200">
                  <CheckCircle2 size={14} className="text-[#10B981] shrink-0" />
                  {t}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* command-center dashboard */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }} data-testid="why-dashboard" className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-6 shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#5B21B6]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="ml-3 font-manrope font-semibold text-sm text-slate-200">Operations Command Center</span>
            </div>
            <span className="text-[10px] font-medium text-[#6ee7b7] flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />Live</span>
          </div>

          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Widget Icon={Activity} label="Lead Pipeline" delay={0}>
              <div className="flex items-end justify-between">
                <span className="font-manrope font-extrabold text-2xl text-white"><Counter to={18} /></span>
                <div className="flex items-end gap-1 h-8">
                  {[40, 65, 50, 80, 60, 90].map((h, i) => (
                    <span key={i} className="w-1.5 rounded-sm bg-[#5B21B6]/70" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <p className="mt-1 text-[10px] text-slate-500">active opportunities</p>
            </Widget>
            <Widget Icon={ListChecks} label="Today's Tasks" delay={0.08} accent="#10B981">
              <span className="font-manrope font-extrabold text-2xl text-white"><Counter to={7} /></span>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: "70%" }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3 }} className="h-full bg-[#10B981]" />
              </div>
              <p className="mt-1 text-[10px] text-slate-500">5 completed</p>
            </Widget>
            <Widget Icon={CalendarClock} label="Upcoming Follow-Ups" delay={0.16}>
              <span className="font-manrope font-extrabold text-2xl text-white"><Counter to={12} /></span>
              <p className="mt-1 text-[10px] text-slate-500">auto-scheduled</p>
            </Widget>
            <Widget Icon={Trophy} label="Recently Won Deals" delay={0.24} accent="#10B981">
              <span className="font-manrope font-extrabold text-2xl text-[#6ee7b7]"><Counter to={4} /></span>
              <p className="mt-1 text-[10px] text-slate-500">this week</p>
            </Widget>
            <Widget Icon={Clock} label="Customer Timeline" delay={0.28}>
              <div className="space-y-1.5">
                {["Call logged", "Estimate sent", "Follow-up set"].map((s, i) => (
                  <motion.div key={s} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.15 }} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="h-1 w-1 rounded-full bg-[#a78bfa]" />{s}
                  </motion.div>
                ))}
              </div>
            </Widget>
            <Widget Icon={Workflow} label="Workflow Activity" delay={0.32} accent="#10B981">
              <div className="flex items-center gap-2">
                <Workflow size={26} className="text-[#10B981]" />
                <div className="flex-1 h-px bg-gradient-to-r from-[#5B21B6] to-[#10B981] relative overflow-hidden">
                  <span className="connector-flow absolute inset-0 border-t-2 border-dashed border-white/40" />
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">3 automations running</p>
            </Widget>
            <Widget Icon={Zap} label="Automation Status" delay={0.36}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 px-2 py-0.5 text-[11px] font-medium text-[#6ee7b7]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />All systems active
              </span>
            </Widget>
            <Widget Icon={TrendingUp} label="Performance Overview" delay={0.4} accent="#10B981">
              <svg viewBox="0 0 100 30" className="w-full h-8">
                <motion.path d="M0,25 L20,18 L40,20 L60,10 L80,12 L100,4" fill="none" stroke="#10B981" strokeWidth="2"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.5 }} />
              </svg>
              <p className="mt-1 text-[10px] text-slate-500">steady upward trend</p>
            </Widget>
          </div>
        </motion.div>

        {/* benefits grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => {
            const { Icon } = b;
            return (
              <motion.div key={b.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: (i % 3) * 0.1 }} data-testid={`benefit-card-${i}`} className="group rounded-[22px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#5B21B6]/50 hover:bg-white/[0.05]">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B21B6]/15 border border-[#5B21B6]/30 text-[#a78bfa] transition-all duration-300 group-hover:scale-110 group-hover:text-white group-hover:bg-[#5B21B6]/30">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 font-manrope font-bold text-lg text-white tracking-tight">{b.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{b.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* final callout */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }} className="relative mt-24 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#312E81]/30 to-[#0F172A]/60 backdrop-blur-2xl p-10 sm:p-14 text-center shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full bg-[#5B21B6]/30 blur-[80px] animate-glow-pulse" />
          <h3 className="relative font-manrope font-extrabold text-3xl sm:text-4xl text-white tracking-tight">Simple Systems. Smarter Business.</h3>
          <p className="relative mx-auto mt-5 max-w-2xl text-base text-slate-300 leading-relaxed">
            When your operations are organized, your team works more efficiently, your
            customers receive better service, and your business is free to focus on growth.
          </p>
          <div className="relative mt-8 flex justify-center">
            <ContactDialog
              trigger={
                <button data-testid="why-cta" className="group inline-flex items-center justify-center gap-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-manrope font-semibold px-9 py-4 rounded-lg shadow-[0_0_30px_rgba(91,33,182,0.6)] hover:shadow-[0_0_45px_rgba(91,33,182,0.85)] hover:-translate-y-1 transition-all duration-300 animate-glow-pulse">
                  Start Your Transformation
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              }
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyFloForge;
