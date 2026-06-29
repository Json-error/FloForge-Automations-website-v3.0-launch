import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Database,
  Users,
  Workflow,
  Settings2,
  LifeBuoy,
  Check,
  ArrowRight,
} from "lucide-react";
import ContactDialog from "@/components/ContactDialog";

const SERVICES = [
  {
    Icon: Database,
    title: "CRM Setup & Organization",
    desc: "Build a structured CRM that keeps every lead, customer, and opportunity organized in one place. Stop relying on sticky notes, spreadsheets, or memory.",
    details: ["Contact organization", "Custom pipelines", "Customer history", "Deal tracking"],
    wide: true,
  },
  {
    Icon: Users,
    title: "Lead Management Systems",
    desc: "Capture inquiries from multiple sources and ensure every lead receives timely follow-up without falling through the cracks.",
    details: ["Lead capture", "Follow-up reminders", "Customer tracking", "Pipeline visibility"],
  },
  {
    Icon: Workflow,
    title: "Workflow Automation",
    desc: "Automate repetitive tasks so your business spends less time on administration and more time serving customers.",
    details: ["Automated emails", "Task creation", "Internal notifications", "Workflow optimization"],
  },
  {
    Icon: Settings2,
    title: "Business Operations",
    desc: "Simplify daily operations by creating organized systems that improve communication, scheduling, and customer management.",
    details: ["Operational systems", "Team organization", "Process improvement", "Efficiency optimization"],
  },
  {
    Icon: LifeBuoy,
    title: "Ongoing Support",
    desc: "Receive continuous improvements, maintenance, and expert guidance as your business grows and your operational needs evolve.",
    details: ["Monthly optimization", "Workflow improvements", "Troubleshooting", "Long-term support"],
  },
];

const CHECKS = [
  "Never Miss a Lead",
  "Automated Follow-Ups",
  "Organized Customer Records",
  "Simple, Scalable Systems",
  "Ongoing Expert Support",
];

const cardReveal = {
  hidden: { opacity: 0, y: 40 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: i * 0.1 },
  }),
};

const ServiceCard = ({ service, index }) => {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const { Icon } = service;
  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardReveal}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      data-testid={`service-card-${index}`}
      className={`group relative rounded-[22px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-colors duration-300 hover:border-[#5B21B6]/60 hover:bg-white/[0.05] ${
        service.wide ? "sm:col-span-2" : ""
      }`}
    >
      {/* purple edge glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_40px_rgba(91,33,182,0.35)] ring-1 ring-[#5B21B6]/30" />

      <div className="relative" style={{ transform: "translateZ(40px)" }}>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B21B6]/15 border border-[#5B21B6]/30 text-[#a78bfa] transition-all duration-300 group-hover:bg-[#5B21B6]/25 group-hover:scale-110 group-hover:text-white">
          <Icon size={22} />
        </span>

        <h3 className="mt-5 font-manrope font-bold text-xl text-white tracking-tight">
          {service.title}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{service.desc}</p>

        {/* expandable details */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-out">
          <div className="overflow-hidden">
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {service.details.map((d) => (
                <div key={d} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shrink-0" />
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Services = () => {
  return (
    <section
      id="services"
      data-testid="services-section"
      className="relative overflow-hidden bg-[#0F172A] py-24 lg:py-32"
    >
      {/* layered backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(49,46,129,0.35),transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-32 -left-20 h-72 w-72 rounded-full bg-[#5B21B6]/20 blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-20 right-0 h-72 w-72 rounded-full bg-[#10B981]/10 blur-[120px] animate-glow-pulse" />

      {/* floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[12, 28, 44, 63, 81, 92].map((left, i) => (
          <span
            key={left}
            className="absolute bottom-0 h-1 w-1 rounded-full bg-white/30"
            style={{ left: `${left}%`, animation: `particle-drift ${8 + i}s linear ${i * 1.3}s infinite` }}
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
            data-testid="services-label"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#a78bfa]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#5B21B6]" />
            OUR SERVICES
          </span>
          <h2
            data-testid="services-heading"
            className="mt-6 font-manrope font-extrabold tracking-tighter text-white text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.05]"
          >
            Build a Business That{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#10B981] bg-clip-text text-transparent">
              Runs Smarter
            </span>
          </h2>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            Every business is different, but every growing business needs organized
            systems. FloForge Automations designs simple, reliable solutions that
            capture leads, automate repetitive tasks, streamline daily operations, and
            help business owners focus on growth instead of paperwork.
          </p>
        </motion.div>

        {/* grid: cards + sticky panel */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* cards */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ staggerChildren: 0.1 }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 [perspective:1200px]"
          >
            {SERVICES.map((s, i) => (
              <ServiceCard key={s.title} service={s} index={i} />
            ))}
          </motion.div>

          {/* sticky control-center panel */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                data-testid="services-panel"
                className="relative rounded-[24px] border border-white/10 bg-gradient-to-b from-[#312E81]/30 to-[#0F172A]/60 backdrop-blur-2xl p-8 shadow-[0_30px_70px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                {/* animated top accent line */}
                <svg className="absolute inset-x-0 top-0 h-px w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="panel-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#5B21B6" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="0" x2="100%" y2="0" stroke="url(#panel-line)" strokeWidth="2" className="connector-flow" />
                </svg>
                {/* glowing workflow node */}
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#5B21B6]/30 blur-[60px]" />

                <span className="inline-flex items-center gap-2 text-[11px] font-medium text-[#6ee7b7]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" /> Control Center
                </span>
                <h3 className="mt-3 font-manrope font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                  Built for Growing Businesses
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  We don't simply implement software—we design reliable systems that
                  eliminate missed opportunities, improve customer follow-up, and create
                  organized workflows that support long-term business growth.
                </p>

                <ul className="mt-7 space-y-3">
                  {CHECKS.map((c, i) => (
                    <motion.li
                      key={c}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                      className="flex items-center gap-3"
                      data-testid={`services-check-${i}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15 border border-[#10B981]/40">
                        <Check size={13} className="text-[#10B981]" />
                      </span>
                      <span className="text-sm font-medium text-slate-200">{c}</span>
                    </motion.li>
                  ))}
                </ul>

                <ContactDialog
                  trigger={
                    <button
                      data-testid="services-start-now"
                      className="group mt-8 inline-flex w-full items-center justify-center gap-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-manrope font-semibold px-8 py-4 rounded-lg shadow-[0_4px_24px_rgba(91,33,182,0.45)] hover:shadow-[0_6px_34px_rgba(91,33,182,0.7)] hover:-translate-y-1 transition-all duration-300"
                    >
                      Start Now
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  }
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
