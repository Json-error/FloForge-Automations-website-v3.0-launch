import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, CircleNotch } from "@phosphor-icons/react";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import BrandLogo from "@/components/Logo";

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
    cadence: "per month",
    best: "Ongoing support, optimization, workflow improvements, and system maintenance.",
    features: ["Monthly CRM optimization", "New automations", "Workflow improvements", "Dashboard updates", "Priority support", "Quarterly business review"],
    highlight: false,
  },
];

export default function Pricing() {
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
    <main className="relative min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased">
      <header className="sticky top-0 z-50 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6 lg:px-8">
          <Link to="/" data-testid="pricing-logo"><BrandLogo /></Link>
          <Link to="/" data-testid="pricing-back" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors duration-150">
            <ArrowLeft size={15} /> Back to home
          </Link>
        </div>
      </header>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div data-testid="pricing-offer-banner"
            className="max-w-3xl border border-[#10B981] bg-[#10B981]/10 px-6 py-4 rounded-sm">
            <p className="text-sm text-[#0e7a57] font-medium">
              Currently accepting a limited number of businesses for a complimentary implementation in exchange for honest feedback.
            </p>
          </div>

          <div className="mt-12 max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#0e9f6f]">Pricing</p>
            <h1 className="mt-4 font-manrope font-extrabold tracking-tight text-[#0F172A] text-4xl sm:text-5xl leading-[1.05]">
              Simple plans for organized growth
            </h1>
            <p className="mt-5 text-base text-slate-600 leading-relaxed">
              Choose the system that fits your business today. Every plan is built around how your team actually works.
            </p>
          </div>

          <div className="mt-14 border-t border-slate-300">
            {PLANS.map((plan) => (
              <div key={plan.id} data-testid={`plan-card-${plan.id}`}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-10 border-b border-slate-300">
                <div className="lg:col-span-3">
                  {plan.highlight && (
                    <p className="text-xs font-semibold tracking-widest uppercase text-[#0e9f6f] mb-2" data-testid="plan-recommended">Recommended</p>
                  )}
                  <h3 className="font-manrope font-extrabold text-2xl text-[#0F172A] tracking-tight">{plan.name}</h3>
                  <p className="mt-2 font-manrope font-extrabold text-3xl text-[#0F172A] tabular">
                    {plan.price} <span className="text-sm text-slate-500 font-medium">{plan.cadence}</span>
                  </p>
                </div>
                <div className="lg:col-span-3">
                  <p className="text-sm text-slate-600 leading-relaxed">{plan.best}</p>
                </div>
                <div className="lg:col-span-4">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#10B981]" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="lg:col-span-2 flex items-start lg:justify-end">
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loading !== null}
                    data-testid={`plan-cta-${plan.id}`}
                    className={`h-11 px-6 rounded-sm font-manrope font-semibold transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-60 ${
                      plan.highlight
                        ? "bg-[#10B981] hover:bg-[#0e9f6f] text-white"
                        : "border border-slate-300 hover:border-slate-900 text-[#0F172A]"
                    }`}
                  >
                    {loading === plan.id ? <><CircleNotch size={18} className="animate-spin" /> Redirecting</> : "Get Started"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-xs text-slate-500">
            Secure checkout powered by Stripe. Test mode: use card 4242 4242 4242 4242.
          </p>
        </div>
      </section>

      <Footer />
      <Toaster position="top-center" />
    </main>
  );
}
