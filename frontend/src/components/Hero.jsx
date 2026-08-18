import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ContactDialog from "@/components/ContactDialog";

const HERO_IMG = "https://images.unsplash.com/photo-1587582423116-ec07293f0395?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBjb250cmFjdG9yJTIwd29ya2luZ3xlbnwwfHx8fDE3ODcwODE1Mjh8MA&ixlib=rb-4.1.0&q=85";

const FACTS = [
  { value: "$299", label: "Starting setup price" },
  { value: "30 min", label: "Training sessions, live" },
  { value: "Mon to Fri", label: "Booking availability" },
];

export default function Hero() {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <section className="border-b border-slate-200" data-testid="hero-section">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="lg:col-span-3 py-16 lg:py-24 lg:pr-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#0e9f6f]" data-testid="hero-kicker">
            Operations and automation for the trades
          </p>
          <h1 className="mt-5 font-manrope font-extrabold tracking-tight text-[#0F172A] text-4xl sm:text-5xl lg:text-6xl leading-[1.05]" data-testid="hero-headline">
            Stop losing leads.
            <br />
            Run your business on a system.
          </h1>
          <p className="mt-6 max-w-xl text-base text-slate-600 leading-relaxed" data-testid="hero-subcopy">
            FloForge builds the CRM, the pipeline, and the follow-up automation your crew actually uses.
            You keep doing the work. The system keeps every lead, task, and deal on track.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button onClick={() => setDialogOpen(true)} data-testid="hero-cta-primary"
              className="font-manrope font-semibold bg-[#10B981] hover:bg-[#0e9f6f] text-white rounded px-6 py-3 transition-colors duration-150">
              Get a Free Strategy Call
            </button>
            <Link to="/pricing" data-testid="hero-cta-secondary"
              className="font-manrope font-semibold text-slate-800 border border-slate-300 hover:border-slate-900 rounded px-6 py-3 transition-colors duration-150">
              View Pricing
            </Link>
          </div>
          <div className="mt-14 grid grid-cols-3 border-t border-slate-200" data-testid="hero-facts">
            {FACTS.map((f, i) => (
              <div key={f.label} className={`pt-5 ${i > 0 ? "pl-6 border-l border-slate-200" : ""}`}>
                <p className="font-manrope font-extrabold text-2xl text-[#0F172A] tabular">{f.value}</p>
                <p className="mt-1 text-xs text-slate-500">{f.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-slate-200 flex items-stretch">
          <div className="w-full py-10 lg:py-16 lg:pl-12">
            <img src={HERO_IMG} alt="Contractor working on a job site"
              className="w-full h-72 lg:h-full max-h-[520px] object-cover border border-slate-300 rounded-sm" data-testid="hero-image" />
          </div>
        </div>
      </div>
      <ContactDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
}
