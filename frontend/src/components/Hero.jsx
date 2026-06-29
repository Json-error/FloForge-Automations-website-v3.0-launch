import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, TrendingUp } from "lucide-react";
import Dashboard3D from "@/components/Dashboard3D";
import ContactDialog from "@/components/ContactDialog";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const TRUST = [
  { Icon: ShieldCheck, text: "Reliable CRM systems" },
  { Icon: Zap, text: "Automated follow-ups" },
  { Icon: TrendingUp, text: "More closed deals" },
];

export const Hero = () => {
  return (
    <section
      id="top"
      data-testid="hero-section"
      className="relative min-h-screen overflow-hidden"
    >
      {/* layered background */}
      <div className="absolute inset-0 bg-[#0F172A]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(49,46,129,0.45),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(91,33,182,0.25),transparent_50%)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-screen pt-32 pb-20">
          {/* LEFT */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="col-span-1 lg:col-span-6 flex flex-col items-start"
          >
            <motion.span
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 mb-7"
              data-testid="hero-badge"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Operations & automation for small business
            </motion.span>

            <motion.h1
              variants={item}
              data-testid="hero-headline"
              className="font-manrope font-extrabold tracking-tighter text-white text-5xl sm:text-6xl lg:text-[4rem] leading-[1.02]"
            >
              Stop Losing Leads.{" "}
              <span className="bg-gradient-to-r from-[#a78bfa] via-[#8b5cf6] to-[#10B981] bg-clip-text text-transparent">
                Start Running Smarter.
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              data-testid="hero-subparagraph"
              className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-xl"
            >
              FloForge Automations helps contractors and local businesses
              organize leads, automate follow-ups, and build simple systems that
              keep daily operations running smoothly.
            </motion.p>

            <motion.div variants={item} className="mt-9 flex flex-col sm:flex-row gap-4">
              <ContactDialog
                trigger={
                  <button
                    data-testid="hero-primary-cta"
                    className="group inline-flex items-center justify-center gap-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-manrope font-semibold px-8 py-4 rounded-lg shadow-[0_4px_24px_rgba(91,33,182,0.45)] hover:shadow-[0_6px_34px_rgba(91,33,182,0.7)] hover:-translate-y-1 transition-all duration-300"
                  >
                    Start Now
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>
                }
              />
              <ContactDialog
                trigger={
                  <button
                    data-testid="hero-secondary-cta"
                    className="inline-flex items-center justify-center border border-white/20 hover:border-white/60 bg-white/[0.03] hover:bg-white/[0.07] text-white font-manrope font-semibold px-8 py-4 rounded-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
                  >
                    Let's Talk
                  </button>
                }
              />
            </motion.div>

            <motion.div
              variants={item}
              className="mt-11 flex flex-wrap gap-x-7 gap-y-3"
              data-testid="hero-trust-row"
            >
              {TRUST.map((t) => (
                <div key={t.text} className="flex items-center gap-2 text-sm text-slate-400">
                  <t.Icon size={16} className="text-[#10B981]" />
                  {t.text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT */}
          <div className="col-span-1 lg:col-span-6 relative h-full min-h-[480px]">
            <Dashboard3D />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
