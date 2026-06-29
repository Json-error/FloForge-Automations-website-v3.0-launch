import { motion } from "framer-motion";
import { UserPlus, ListTodo, FileText, Trophy } from "lucide-react";

const CARDS = [
  {
    label: "New Lead",
    sub: "Bridgewater Roofing",
    Icon: UserPlus,
    iconColor: "text-[#5B21B6]",
    badge: "bg-[#5B21B6]/20 text-[#c4b5fd]",
    badgeText: "Inbound",
    pos: "top-6 left-0 sm:-left-6",
    anim: "animate-float-slow",
    base: "bg-[#0F172A]/80 border-white/10",
  },
  {
    label: "Follow-Up Task",
    sub: "Call back in 2 hrs",
    Icon: ListTodo,
    iconColor: "text-[#10B981]",
    badge: "bg-[#10B981]/15 text-[#6ee7b7]",
    badgeText: "Auto",
    pos: "top-28 right-0 sm:-right-6",
    anim: "animate-float-medium",
    base: "bg-[#312E81]/70 border-white/10",
  },
  {
    label: "Estimate Sent",
    sub: "$4,200 · awaiting reply",
    Icon: FileText,
    iconColor: "text-[#a78bfa]",
    badge: "bg-[#5B21B6]/20 text-[#c4b5fd]",
    badgeText: "Pending",
    pos: "bottom-24 left-2 sm:left-8",
    anim: "animate-float-fast",
    base: "bg-[#0F172A]/90 border-white/10",
  },
  {
    label: "Closed Won",
    sub: "Deal secured 🎉",
    Icon: Trophy,
    iconColor: "text-[#10B981]",
    badge: "bg-[#10B981]/20 text-[#6ee7b7]",
    badgeText: "+$4,200",
    pos: "bottom-4 right-2 sm:right-6",
    anim: "animate-float-hero",
    base: "bg-[#10B981]/10 border-[#10B981]/40 shadow-[0_10px_40px_rgba(16,185,129,0.25)]",
  },
];

const Particle = ({ delay, left, duration }) => (
  <span
    className="absolute bottom-0 h-1 w-1 rounded-full bg-white/40"
    style={{
      left: `${left}%`,
      animation: `particle-drift ${duration}s linear ${delay}s infinite`,
    }}
  />
);

export const Dashboard3D = () => {
  return (
    <div className="w-full h-full perspective-1200 flex justify-center items-center select-none">
      {/* ambient glow */}
      <div className="absolute w-[80%] h-[60%] rounded-full bg-[#5B21B6]/30 blur-[120px] animate-glow-pulse pointer-events-none" />
      <div className="absolute right-10 bottom-16 w-40 h-40 rounded-full bg-[#10B981]/20 blur-[90px] animate-glow-pulse pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, rotateX: 12, rotateY: -18 }}
        animate={{ opacity: 1, scale: 1, rotateX: 8, rotateY: -12 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        whileHover={{ rotateX: 5, rotateY: -8 }}
        className="relative w-full max-w-lg preserve-3d"
        style={{ transformStyle: "preserve-3d" }}
        data-testid="hero-3d-dashboard"
      >
        {/* base dashboard panel */}
        <div className="relative w-full h-[440px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* header bar */}
          <div className="flex items-center gap-2 px-5 h-12 border-b border-white/5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#5B21B6]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="ml-3 text-xs font-manrope font-semibold text-slate-300 tracking-wide">
              Operations Pipeline
            </span>
            <span className="ml-auto text-[10px] font-medium text-[#6ee7b7] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Live
            </span>
          </div>

          {/* grid texture */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* connector lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="purple-emerald" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5B21B6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <g
              fill="none"
              stroke="url(#purple-emerald)"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 6px rgba(91,33,182,0.5))" }}
            >
              <path className="connector-flow" d="M70,90 C160,120 180,200 250,210" />
              <path className="connector-flow" d="M250,210 C320,220 330,300 360,330" />
              <path className="connector-flow" d="M120,300 C200,280 230,250 250,210" />
            </g>
          </svg>
        </div>

        {/* floating cards */}
        {CARDS.map((c) => (
          <div
            key={c.label}
            className={`absolute ${c.pos} ${c.anim} ${c.base} backdrop-blur-xl border p-3.5 rounded-xl shadow-2xl flex items-center gap-3 w-[225px]`}
            data-testid={`dashboard-card-${c.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
              <c.Icon size={18} className={c.iconColor} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-manrope font-bold text-white whitespace-nowrap">{c.label}</p>
              <p className="text-[11px] text-slate-400 truncate">{c.sub}</p>
            </div>
            <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded ${c.badge} whitespace-nowrap`}>
              {c.badgeText}
            </span>
          </div>
        ))}
      </motion.div>

      {/* particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Particle delay={0} left={15} duration={7} />
        <Particle delay={1.5} left={35} duration={9} />
        <Particle delay={3} left={55} duration={8} />
        <Particle delay={2} left={75} duration={10} />
        <Particle delay={4} left={88} duration={7.5} />
        <Particle delay={0.8} left={48} duration={11} />
      </div>
    </div>
  );
};

export default Dashboard3D;
