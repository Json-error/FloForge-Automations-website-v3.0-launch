import { motion } from "framer-motion";
import {
  Search,
  PencilRuler,
  Share2,
  TrendingUp,
  ArrowRight,
  StickyNote,
  PhoneMissed,
  FileSpreadsheet,
  BellOff,
  AlarmClockOff,
  Shuffle,
  Unplug,
  Database,
  MailCheck,
  BellRing,
  History,
  LayoutDashboard,
  Zap,
  Workflow,
  CheckCircle2,
} from "lucide-react";
import ContactDialog from "@/components/ContactDialog";

const STEPS = [
  {
    Icon: Search,
    tag: "01",
    title: "Discover Your Business",
    desc: "We begin by understanding how your business currently operates, identifying bottlenecks, repetitive tasks, missed opportunities, and areas where automation can create immediate value.",
  },
  {
    Icon: PencilRuler,
    tag: "02",
    title: "Design Your System",
    desc: "We create a customized operational system tailored specifically to your business. Every pipeline, workflow, property, and automation is designed around the way your team actually works.",
  },
  {
    Icon: Share2,
    tag: "03",
    title: "Automate Daily Operations",
    desc: "Lead capture, reminders, follow-ups, notifications, and repetitive administrative work become automated, reducing manual effort while improving consistency.",
  },
  {
    Icon: TrendingUp,
    tag: "04",
    title: "Optimize & Support",
    desc: "As your business grows, we continue improving your systems, refining workflows, and helping you operate more efficiently over time.",
  },
];

const BEFORE = [
  { Icon: StickyNote, text: "Messy sticky notes" },
  { Icon: PhoneMissed, text: "Missed phone calls" },
  { Icon: FileSpreadsheet, text: "Unorganized spreadsheets" },
  { Icon: BellOff, text: "Forgotten follow-ups" },
  { Icon: AlarmClockOff, text: "Manual reminders" },
  { Icon: Shuffle, text: "Scattered customer info" },
  { Icon: Unplug, text: "Disconnected communication" },
];

const AFTER = [
  { Icon: Database, text: "Organized CRM" },
  { Icon: MailCheck, text: "Automatic follow-ups" },
  { Icon: BellRing, text: "Task reminders" },
  { Icon: History, text: "Clear customer history" },
  { Icon: LayoutDashboard, text: "Simple dashboards" },
  { Icon: Zap, text: "Automated notifications" },
  { Icon: Workflow, text: "Efficient daily operations" },
];

const StepCard = ({ step, index }) => {
  const { Icon } = step;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.15 }}
      data-testid={`hiw-step-${index}`}
      className="group relative rounded-[22px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-2 hover:border-[#5B21B6]/60 hover:bg-white/[0.05]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_40px_rgba(91,33,182,0.35)]" />
      {/* node connector dot */}
      <span className="absolute -top-[42px] left-7 hidden lg:flex h-5 w-5 items-center justify-center rounded-full bg-[#0F172A] border border-[#5B21B6]/50 shadow-[0_0_15px_rgba(91,33,182,0.6)]">
        <span className="h-2 w-2 rounded-full bg-[#5B21B6] group-hover:bg-[#10B981] transition-colors" />
      </span>

      <div className="flex items-center justify-between">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B21B6]/15 border border-[#5B21B6]/30 text-[#a78bfa] transition-all duration-300 group-hover:scale-110 group-hover:text-white group-hover:bg-[#5B21B6]/30">
          <Icon size={22} />
        </span>
        <span className="font-manrope font-extrabold text-3xl text-white/10 group-hover:text-[#5B21B6]/40 transition-colors">
          {step.tag}
        </span>
      </div>

      <h3 className="mt-5 font-manrope font-bold text-lg text-white tracking-tight">{step.title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{step.desc}</p>
    </motion.div>
  );
};

export const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      data-testid="how-it-works-section"
      className="relative overflow-hidden bg-[#0F172A] py-24 lg:py-32 border-t border-white/5"
    >
      {/* backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(49,46,129,0.3),transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-40 right-0 h-72 w-72 rounded-full bg-[#5B21B6]/15 blur-[120px] animate-glow-pulse" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[18, 38, 58, 78, 90].map((left, i) => (
          <span
            key={left}
            className="absolute bottom-0 h-1 w-1 rounded-full bg-white/30"
            style={{ left: `${left}%`, animation: `particle-drift ${9 + i}s linear ${i * 1.4}s infinite` }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <span
            data-testid="hiw-label"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#a78bfa]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#5B21B6]" />
            HOW IT WORKS
          </span>
          <h2
            data-testid="hiw-heading"
            className="mt-6 font-manrope font-extrabold tracking-tighter text-white text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.05]"
          >
            From Business Chaos to{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#10B981] bg-clip-text text-transparent">
              Organized Growth
            </span>
          </h2>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            Every business has unique challenges, but our process remains simple. We
            identify the gaps in your operations, build a customized system, automate
            repetitive work, and continue optimizing as your business grows.
          </p>
        </motion.div>

        {/* horizontal workflow */}
        <div className="relative mt-20">
          {/* illuminating connector line */}
          <div className="absolute -top-2 left-7 right-7 hidden lg:block h-px bg-white/10 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }}
              style={{ transformOrigin: "left" }}
              className="h-full w-full bg-gradient-to-r from-[#5B21B6] via-[#7c3aed] to-[#10B981] shadow-[0_0_12px_rgba(91,33,182,0.8)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <StepCard key={s.title} step={s} index={i} />
            ))}
          </div>
        </div>

        {/* Before / After transformation */}
        <div className="mt-28">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            data-testid="hiw-transform-title"
            className="text-center font-manrope font-extrabold text-3xl sm:text-4xl text-white tracking-tight"
          >
            What Changes After FloForge
          </motion.h3>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
            {/* BEFORE */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              data-testid="hiw-before-panel"
              className="relative rounded-[24px] border border-red-500/20 bg-red-950/10 backdrop-blur-xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="h-2 w-2 rounded-full bg-red-500/70" />
                <span className="text-xs font-semibold tracking-[0.15em] text-red-300/80 uppercase">Before</span>
              </div>
              <ul className="space-y-3">
                {BEFORE.map(({ Icon, text }, i) => (
                  <motion.li
                    key={text}
                    initial={{ opacity: 0.4 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 rounded-lg border border-red-500/10 bg-white/[0.02] px-3.5 py-2.5"
                  >
                    <Icon size={16} className="text-red-400/80 shrink-0" />
                    <span className="text-sm text-slate-400 line-through decoration-red-500/40">{text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* arrow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="hidden lg:flex flex-col items-center gap-2"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5B21B6] shadow-[0_0_30px_rgba(91,33,182,0.7)]">
                <ArrowRight size={24} className="text-white" />
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-wide">FloForge</span>
            </motion.div>

            {/* AFTER */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              data-testid="hiw-after-panel"
              className="relative rounded-[24px] border border-[#10B981]/30 bg-gradient-to-b from-[#312E81]/20 to-[#10B981]/5 backdrop-blur-xl p-7 shadow-[0_20px_60px_rgba(16,185,129,0.12)]"
            >
              <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-[#10B981]/20 blur-[60px]" />
              <div className="flex items-center gap-2 mb-5">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs font-semibold tracking-[0.15em] text-[#6ee7b7] uppercase">After</span>
              </div>
              <ul className="space-y-3">
                {AFTER.map(({ Icon, text }, i) => (
                  <motion.li
                    key={text}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3 rounded-lg border border-[#10B981]/15 bg-white/[0.03] px-3.5 py-2.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#10B981]/15 border border-[#10B981]/30">
                      <Icon size={15} className="text-[#10B981]" />
                    </span>
                    <span className="text-sm font-medium text-slate-200">{text}</span>
                    <CheckCircle2 size={15} className="text-[#10B981] ml-auto shrink-0" />
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* closing statement + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 text-center"
        >
          <p className="mx-auto max-w-2xl font-manrope font-bold text-2xl sm:text-3xl text-white tracking-tight leading-snug">
            Your business deserves systems that work as hard as you do.
          </p>
          <div className="mt-8 flex justify-center">
            <ContactDialog
              trigger={
                <button
                  data-testid="hiw-consultation-cta"
                  className="group inline-flex items-center justify-center gap-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-manrope font-semibold px-8 py-4 rounded-lg shadow-[0_4px_24px_rgba(91,33,182,0.45)] hover:shadow-[0_6px_34px_rgba(91,33,182,0.7)] hover:-translate-y-1 transition-all duration-300"
                >
                  Schedule a Free Consultation
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

export default HowItWorks;
