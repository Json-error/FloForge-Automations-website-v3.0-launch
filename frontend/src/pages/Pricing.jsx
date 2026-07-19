import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PLANS = [
  {
    id: "starter_setup_onetime",
    name: "Starter Setup",
    price: "$299",
    cadence: "one-time",
    best: "Small businesses that need a basic CRM and organization system.",
    features: ["CRM setup", "Contact organization", "Custom pipeline", "Deal stages", "Basic dashboard", "1 training session"],
    highlight: false,
  },
  {
    id: "business_automation_onetime",
    name: "Business Automation",
    price: "$699",
    cadence: "one-time",
    best: "Businesses ready for CRM setup plus workflow automation and lead management.",
    features: ["Everything in Starter", "Workflow automation", "Lead capture forms", "Automated follow-ups", "Task automation", "Internal notifications", "Dashboard customization", "2 training sessions"],
    highlight: true,
  },
  {
    id: "growth_partnership_monthly",
    name: "Growth Partnership",
    price: "$149",
    cadence: "/month",
    best: "Ongoing support, optimization, workflow improvements, and system maintenance.",
    features: ["Monthly CRM optimization", "New automations", "Workflow improvements", "Dashboard updates", "Priority support", "Quarterly business review"],
    highlight: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (lookup_key) => {
    setLoading(lookup_key);
    try {
      const { data } = await axios.post(`${API}/payments/checkout`, {
        lookup_key,
        origin_url: window.location.origin,
      });
      window.location.href = data.checkout_url;
    } catch (e) {
      toast.error("Could not start checkout. Please try again.");
      setLoading(null);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#0F172A] text-[#F8FAFC] antialiased">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0F172A]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" data-testid="pricing-logo">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B21B6] shadow-[0_0_18px_rgba(91,33,182,0.6)]">
              <span className="h-3 w-3 rounded-sm bg-[#10B981]" />
            </span>
            <span className="text-lg font-extrabold font-manrope tracking-tight text-white">
              FloForge <span className="text-slate-400 font-semibold">Automations</span>
            </span>
          </Link>
          <Link to="/" data-testid="pricing-back" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-[#5B21B6]/20 blur-[120px] animate-glow-pulse" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          {/* limited offer banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            data-testid="pricing-offer-banner"
            className="mx-auto max-w-3xl rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 px-6 py-4 text-center backdrop-blur-md">
            <p className="flex items-center justify-center gap-2 text-sm text-[#6ee7b7] font-medium">
              <Sparkles size={16} />
              Currently accepting a limited number of businesses for a complimentary implementation in exchange for honest feedback and a testimonial.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-12 text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#a78bfa]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5B21B6]" />PRICING
            </span>
            <h1 className="mt-6 font-manrope font-extrabold tracking-tighter text-white text-4xl sm:text-5xl leading-[1.05]">
              Simple Plans for{" "}
              <span className="bg-gradient-to-r from-[#a78bfa] to-[#10B981] bg-clip-text text-transparent">Organized Growth</span>
            </h1>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">
              Choose the system that fits your business today. Every plan is built around
              how your team actually works.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.12 }}
                data-testid={`plan-card-${plan.id}`}
                className={`relative rounded-[24px] border backdrop-blur-xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.45)] ${
                  plan.highlight
                    ? "border-[#5B21B6]/60 bg-gradient-to-b from-[#312E81]/40 to-[#0F172A]/70 lg:-translate-y-4 shadow-[0_0_50px_rgba(91,33,182,0.3)]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#5B21B6] px-4 py-1 text-[11px] font-semibold text-white shadow-[0_0_20px_rgba(91,33,182,0.6)]">
                    Most Popular
                  </span>
                )}
                <h3 className="font-manrope font-bold text-xl text-white tracking-tight">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-manrope font-extrabold text-4xl text-white">{plan.price}</span>
                  <span className="text-sm text-slate-400">{plan.cadence}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-400 min-h-[60px]">{plan.best}</p>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading !== null}
                  data-testid={`plan-cta-${plan.id}`}
                  className={`mt-6 w-full h-12 rounded-lg font-manrope font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 ${
                    plan.highlight
                      ? "bg-[#5B21B6] hover:bg-[#4C1D95] text-white shadow-[0_4px_24px_rgba(91,33,182,0.5)] hover:shadow-[0_6px_34px_rgba(91,33,182,0.7)] hover:-translate-y-0.5"
                      : "border border-white/20 hover:border-white/50 bg-white/[0.03] hover:bg-white/[0.07] text-white"
                  }`}
                >
                  {loading === plan.id ? <><Loader2 size={18} className="animate-spin" /> Redirecting...</> : "Get Started"}
                </button>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15 border border-[#10B981]/30">
                        <Check size={12} className="text-[#10B981]" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <p className="mt-12 text-center text-xs text-slate-500">
            Secure checkout powered by Stripe · Test mode · Use card 4242 4242 4242 4242
          </p>
        </div>
      </section>

      <Footer />
      <Toaster position="top-center" />
    </main>
  );
}
