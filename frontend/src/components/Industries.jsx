import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  HardHat,
  Wind,
  Droplets,
  Zap,
  Trees,
  UtensilsCrossed,
  Cpu,
} from "lucide-react";

const INDUSTRIES = [
  {
    Icon: HardHat,
    title: "Roofing Companies",
    desc: "Track estimates, organize customer information, automate follow-ups, and ensure every opportunity is managed from first call to completed project.",
    span: "lg:col-span-5",
    accent: "#5B21B6",
  },
  {
    Icon: Wind,
    title: "HVAC Services",
    desc: "Manage service requests, schedule appointments, organize maintenance records, and automate customer reminders.",
    span: "lg:col-span-4",
    accent: "#10B981",
  },
  {
    Icon: Droplets,
    title: "Plumbing",
    desc: "Organize emergency calls, automate follow-up reminders, track service history, and simplify customer communication.",
    span: "lg:col-span-3",
    accent: "#5B21B6",
  },
  {
    Icon: Zap,
    title: "Electrical",
    desc: "Keep projects organized, manage estimates, track customers, and improve communication throughout every job.",
    span: "lg:col-span-3",
    accent: "#10B981",
  },
  {
    Icon: Trees,
    title: "Landscaping",
    desc: "Schedule recurring services, organize customer records, automate reminders, and simplify seasonal planning.",
    span: "lg:col-span-4",
    accent: "#5B21B6",
  },
  {
    Icon: UtensilsCrossed,
    title: "Restaurants & Local Businesses",
    desc: "Organize customer information, improve communication, automate reminders, and streamline daily business operations.",
    span: "lg:col-span-5",
    accent: "#10B981",
  },
];

const ENGINE_LABELS = [
  "CRM Setup",
  "Workflow Automation",
  "Lead Management",
  "Customer Follow-Up",
  "Business Operations",
  "Ongoing Support",
];

const IndustryCard = ({ industry, index }) => {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 200, damping: 20 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  const { Icon, accent } = industry;
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay: (index % 3) * 0.1 }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      data-testid={`industry-card-${index}`}
      className={`group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-colors duration-300 hover:bg-white/[0.05] ${industry.span}`}
    >
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-[70px] opacity-0 group-hover:opacity-60 transition-opacity duration-500"
        style={{ background: accent }}
      />
      <div className="relative" style={{ transform: "translateZ(40px)" }}>
        <span
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110"
          style={{ background: `${accent}26`, borderColor: `${accent}4d`, color: accent === "#10B981" ? "#6ee7b7" : "#a78bfa" }}
        >
          <Icon size={22} />
        </span>
        <h3 className="mt-5 font-manrope font-bold text-xl text-white tracking-tight">{industry.title}</h3>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{industry.desc}</p>
      </div>
    </motion.div>
  );
};

const AutomationEngine = () => {
  const [active, setActive] = useState(null);
  const wrapRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 18 });

  const onMove = (e) => {
    const r = wrapRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  const radius = 165;
  const center = 220;

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative mx-auto mt-14 w-full max-w-[440px] aspect-square [perspective:1000px]"
      data-testid="automation-engine"
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative h-full w-full">
        {/* connector lines */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 440 440">
          <defs>
            <linearGradient id="eng-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5B21B6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          {INDUSTRIES.map((_, i) => {
            const a = (i / INDUSTRIES.length) * Math.PI * 2 - Math.PI / 2;
            const x = center + radius * Math.cos(a);
            const y = center + radius * Math.sin(a);
            return (
              <line
                key={i}
                x1={center} y1={center} x2={x} y2={y}
                stroke="url(#eng-line)"
                strokeWidth={active === i ? 3 : 1.5}
                className={active === i ? "connector-flow" : ""}
                style={{ opacity: active === null || active === i ? 0.7 : 0.2, transition: "opacity 0.3s, stroke-width 0.3s" }}
              />
            );
          })}
        </svg>

        {/* central engine */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: "translate(-50%,-50%) translateZ(60px)" }}>
          <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#5B21B6] to-[#312E81] shadow-[0_0_50px_rgba(91,33,182,0.7)] border border-white/20">
            <div className="absolute inset-0 rounded-full animate-glow-pulse bg-[#5B21B6]/40 blur-xl" />
            <Cpu size={26} className="relative text-white" />
            <span className="relative mt-1 text-[9px] font-manrope font-bold text-white text-center leading-tight px-2">
              FloForge<br />Automations
            </span>
          </div>
        </div>

        {/* orbiting industry icons */}
        {INDUSTRIES.map((ind, i) => {
          const a = (i / INDUSTRIES.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + (radius / center) * 50 * Math.cos(a);
          const y = 50 + (radius / center) * 50 * Math.sin(a);
          const { Icon } = ind;
          return (
            <button
              key={i}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              data-testid={`engine-node-${i}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%) translateZ(40px)" }}
            >
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl border backdrop-blur-xl transition-all duration-300 ${active === i ? "bg-[#5B21B6] border-white/40 scale-110 shadow-[0_0_25px_rgba(91,33,182,0.8)]" : "bg-white/5 border-white/15 hover:scale-110"}`}>
                <Icon size={20} className={active === i ? "text-white" : "text-[#a78bfa]"} />
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* floating capability labels */}
      <div className="pointer-events-none absolute inset-0">
        {ENGINE_LABELS.map((label, i) => {
          const a = (i / ENGINE_LABELS.length) * Math.PI * 2 + Math.PI / 6;
          const x = 50 + 58 * Math.cos(a);
          const y = 50 + 58 * Math.sin(a);
          return (
            <motion.span
              key={label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.12 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-[#10B981]/30 bg-[#0F172A]/80 px-2.5 py-1 text-[10px] font-medium text-[#6ee7b7] backdrop-blur-sm hidden sm:block"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {label}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
};

export const Industries = () => {
  return (
    <section
      id="industries"
      data-testid="industries-section"
      className="relative overflow-hidden bg-[#0F172A] py-24 lg:py-32 border-t border-white/5"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(49,46,129,0.3),transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-32 left-0 h-72 w-72 rounded-full bg-[#5B21B6]/15 blur-[120px] animate-glow-pulse" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[14, 33, 52, 70, 88].map((left, i) => (
          <span key={left} className="absolute bottom-0 h-1 w-1 rounded-full bg-white/30"
            style={{ left: `${left}%`, animation: `particle-drift ${9 + i}s linear ${i * 1.5}s infinite` }} />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <span data-testid="industries-label" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#a78bfa]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5B21B6]" />
            WHO WE HELP
          </span>
          <h2 data-testid="industries-heading" className="mt-6 font-manrope font-extrabold tracking-tighter text-white text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.05]">
            Built for Businesses That{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#10B981] bg-clip-text text-transparent">Never Stop Moving</span>
          </h2>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            Every industry has different workflows, but every growing business needs
            organized systems. FloForge Automations builds customized CRM solutions and
            automation systems designed around the way you actually work.
          </p>
        </motion.div>

        {/* organic asymmetrical card layout */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-6 [perspective:1200px]">
          {INDUSTRIES.map((ind, i) => (
            <IndustryCard key={ind.title} industry={ind} index={i} />
          ))}
        </div>

        {/* engine visualization */}
        <div className="mt-28 text-center">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            data-testid="industries-engine-title"
            className="mx-auto max-w-3xl font-manrope font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-snug"
          >
            Every Business Has Different Challenges. Every Business Deserves Better Systems.
          </motion.h3>
          <p className="mx-auto mt-5 max-w-xl text-sm text-slate-400">
            Hover any industry to watch its workflow travel into the FloForge engine and
            return as an optimized, customized system.
          </p>
          <AutomationEngine />
        </div>
      </div>
    </section>
  );
};

export default Industries;
