import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  PhoneCall,
  Globe,
  MessageCircle,
  Users,
  Mail,
  UserCheck,
  ArrowRight,
  Database,
  MailCheck,
  FolderKanban,
  Gauge,
} from "lucide-react";
import ContactDialog from "@/components/ContactDialog";

const SOURCES = [
  { Icon: PhoneCall, label: "Incoming Phone Call" },
  { Icon: Globe, label: "Website Form" },
  { Icon: MessageCircle, label: "Facebook Message" },
  { Icon: Users, label: "Referral" },
  { Icon: Mail, label: "Email Inquiry" },
  { Icon: UserCheck, label: "Returning Customer" },
];

const STAGES = ["Capture", "Organize", "Assign", "Follow Up", "Track", "Optimize"];

const CRM_CARDS = [
  { name: "Bridgewater Roofing", status: "Qualified", stage: "Estimate Sent", task: "Send proposal", follow: "Tomorrow, 9:00 AM", value: "$4,200" },
  { name: "Delgado HVAC", status: "New Lead", stage: "Discovery", task: "Book site visit", follow: "Fri, 2:00 PM", value: "$1,850" },
  { name: "Harper Landscaping", status: "Won", stage: "Closed Won", task: "Schedule service", follow: "Recurring", value: "$3,600" },
];

const METRICS = [
  { Icon: Database, label: "Every Lead Organized" },
  { Icon: MailCheck, label: "Automatic Follow-Ups" },
  { Icon: FolderKanban, label: "Centralized Customer Records" },
  { Icon: Gauge, label: "Streamlined Daily Operations" },
];

const Ring = ({ size, dur, reverse, color, dash }) => (
  <div
    className="absolute rounded-full border"
    style={{
      width: size, height: size, left: "50%", top: "50%",
      transform: "translate(-50%,-50%)",
      borderColor: color,
      borderStyle: dash ? "dashed" : "solid",
      animation: `ring-spin ${dur}s linear infinite ${reverse ? "reverse" : ""}`,
    }}
  />
);

const CrmCard = ({ card, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, rotateY: -12 }}
    whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.6, delay: index * 0.15 }}
    data-testid={`engine-crm-card-${index}`}
    className="group relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-all duration-300 hover:scale-[1.03] hover:border-[#5B21B6]/60 hover:z-10 [transform-style:preserve-3d]"
  >
    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_35px_rgba(91,33,182,0.35)]" />
    <div className="flex items-center justify-between">
      <h4 className="font-manrope font-bold text-white text-sm">{card.name}</h4>
      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${card.status === "Won" ? "bg-[#10B981]/20 text-[#6ee7b7]" : "bg-[#5B21B6]/20 text-[#c4b5fd]"}`}>{card.status}</span>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
      <div><p className="text-slate-500">Pipeline</p><p className="text-slate-200 font-medium">{card.stage}</p></div>
      <div><p className="text-slate-500">Deal Value</p><p className="text-[#6ee7b7] font-semibold">{card.value}</p></div>
      <div className="max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500"><p className="text-slate-500">Assigned Task</p><p className="text-slate-200 font-medium">{card.task}</p></div>
      <div className="max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500"><p className="text-slate-500">Next Follow-Up</p><p className="text-slate-200 font-medium">{card.follow}</p></div>
    </div>
  </motion.div>
);

export const AutomationEngine = () => {
  const wrapRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 120, damping: 20 });
  const py = useSpring(useTransform(my, [-0.5, 0.5], [-18, 18]), { stiffness: 120, damping: 20 });

  const onMove = (e) => {
    const r = wrapRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <section
      data-testid="engine-section"
      className="relative overflow-hidden bg-[#0F172A] py-24 lg:py-32 border-t border-white/5"
    >
      {/* Layer 1: blurred gradients */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#5B21B6]/20 blur-[140px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[#10B981]/15 blur-[130px] animate-glow-pulse" />
      {/* Layer 2: blueprint grid */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      {/* Layer 5: particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[10, 25, 40, 55, 70, 85, 95].map((left, i) => (
          <span key={left} className="absolute bottom-0 h-1 w-1 rounded-full bg-white/30" style={{ left: `${left}%`, animation: `particle-drift ${8 + i}s linear ${i * 1.1}s infinite` }} />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* heading */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="max-w-2xl mx-auto text-center">
          <span data-testid="engine-label" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#a78bfa]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5B21B6]" />THE FLOFORGE ENGINE
          </span>
          <h2 data-testid="engine-heading" className="mt-6 font-manrope font-extrabold tracking-tighter text-white text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.05]">
            Watch Your Business{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#10B981] bg-clip-text text-transparent">Organize Itself</span>
          </h2>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            Every lead, customer, follow-up, task, and workflow should move through one
            intelligent system. FloForge Automations transforms disconnected business
            activities into one organized operational engine.
          </p>
        </motion.div>

        {/* interactive engine */}
        <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave} className="relative mt-16 [perspective:1200px]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8">
            {/* sources */}
            <motion.div style={{ x: px, y: py }} className="space-y-3">
              {SOURCES.map(({ Icon, label }, i) => (
                <motion.div key={label} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-4 py-2.5 w-fit animate-float-slow" style={{ animationDelay: `${i * 0.4}s` }}>
                  <Icon size={16} className="text-[#a78bfa]" />
                  <span className="text-xs text-slate-300 whitespace-nowrap">{label}</span>
                  <ArrowRight size={12} className="text-slate-600" />
                </motion.div>
              ))}
            </motion.div>

            {/* engine core */}
            <motion.div style={{ x: useTransform(px, (v) => v * 0.4), y: useTransform(py, (v) => v * 0.4) }} className="relative mx-auto h-[320px] w-[320px]">
              <Ring size="320px" dur={40} color="rgba(91,33,182,0.25)" dash />
              <Ring size="250px" dur={28} reverse color="rgba(16,185,129,0.25)" />
              <Ring size="180px" dur={20} color="rgba(91,33,182,0.4)" dash />
              {/* core */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#5B21B6] to-[#312E81] shadow-[0_0_60px_rgba(91,33,182,0.7)] border border-white/20">
                <div className="absolute inset-0 rounded-full bg-[#5B21B6]/40 blur-xl animate-glow-pulse" />
                <div className="relative text-center">
                  {STAGES.map((s, i) => (
                    <motion.p key={s} initial={{ opacity: 0.3 }} whileInView={{ opacity: [0.3, 1, 0.5] }} viewport={{ once: true }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 3 }}
                      className="text-[10px] font-manrope font-semibold text-white leading-tight">{s}</motion.p>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* output CRM cards */}
            <motion.div style={{ x: useTransform(px, (v) => -v), y: py }} className="space-y-4 [transform-style:preserve-3d]">
              {CRM_CARDS.map((c, i) => (<CrmCard key={c.name} card={c} index={i} />))}
            </motion.div>
          </div>
        </div>

        {/* metric panels */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map(({ Icon, label }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: i * 0.1 }}
              data-testid={`engine-metric-${i}`}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-[#5B21B6]/50 hover:shadow-[0_0_35px_rgba(91,33,182,0.3)]">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B21B6]/15 border border-[#5B21B6]/30 text-[#a78bfa] transition-all duration-300 group-hover:scale-110 group-hover:text-white group-hover:bg-[#5B21B6]/30">
                <Icon size={22} />
              </span>
              <p className="mt-4 font-manrope font-semibold text-sm text-white">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* final callout */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }}
          className="relative mt-24 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#312E81]/30 to-[#0F172A]/60 backdrop-blur-2xl p-10 sm:p-14 text-center shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full bg-[#5B21B6]/30 blur-[80px] animate-glow-pulse" />
          <h3 className="relative font-manrope font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-snug">
            Technology Should Feel Invisible. Results Should Feel Obvious.
          </h3>
          <p className="relative mx-auto mt-5 max-w-2xl text-base text-slate-300 leading-relaxed">
            FloForge builds systems that quietly organize your business behind the scenes,
            allowing your team to focus on customers instead of administration.
          </p>
          <div className="relative mt-8 flex justify-center">
            <ContactDialog trigger={
              <button data-testid="engine-cta" className="group inline-flex items-center justify-center gap-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-manrope font-semibold px-9 py-4 rounded-lg shadow-[0_0_30px_rgba(91,33,182,0.6)] hover:shadow-[0_0_50px_rgba(91,33,182,0.9)] hover:-translate-y-1 transition-all duration-300">
                Build My System
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            } />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AutomationEngine;
