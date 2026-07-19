import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowRight } from "lucide-react";

export default function PaymentCancel() {
  return (
    <main className="relative min-h-screen bg-[#0F172A] text-[#F8FAFC] antialiased flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-[#5B21B6]/15 blur-[120px]" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        data-testid="payment-cancel-card"
        className="relative mx-6 max-w-md w-full rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/15">
          <XCircle size={34} className="text-slate-400" />
        </div>
        <h1 className="mt-6 font-manrope font-bold text-2xl text-white tracking-tight">Checkout Cancelled</h1>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          No charge was made. Whenever you're ready, you can pick a plan and continue—we're
          here to help you build a smarter system.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/pricing" data-testid="cancel-pricing-btn" className="inline-flex items-center gap-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-manrope font-semibold px-7 py-3.5 rounded-lg shadow-[0_4px_24px_rgba(91,33,182,0.45)] hover:-translate-y-0.5 transition-all">
            View Plans <ArrowRight size={16} />
          </Link>
          <Link to="/" className="border border-white/20 hover:border-white/50 text-white font-manrope font-semibold px-7 py-3.5 rounded-lg transition-all">Home</Link>
        </div>
      </motion.div>
    </main>
  );
}
