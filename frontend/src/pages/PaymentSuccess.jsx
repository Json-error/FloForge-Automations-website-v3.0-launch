import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const MAX_POLLS = 8;

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const [state, setState] = useState("checking"); // checking | paid | timeout | error

  const poll = useCallback(async (attempt) => {
    if (!sessionId) { setState("error"); return; }
    if (attempt >= MAX_POLLS) { setState("timeout"); return; }
    try {
      const { data } = await axios.get(`${API}/payments/status/${sessionId}`);
      if (data.payment_status === "paid") { setState("paid"); return; }
      if (["failed", "expired"].includes(data.payment_status)) { setState("error"); return; }
      setTimeout(() => poll(attempt + 1), 2000);
    } catch {
      setState("error");
    }
  }, [sessionId]);

  useEffect(() => { poll(0); }, [poll]);

  return (
    <main className="relative min-h-screen bg-[#0F172A] text-[#F8FAFC] antialiased flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-[#5B21B6]/25 blur-[120px] animate-glow-pulse" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        data-testid="payment-success-card"
        className="relative mx-6 max-w-md w-full rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        {state === "checking" && (
          <div data-testid="payment-checking">
            <Loader2 size={44} className="mx-auto animate-spin text-[#a78bfa]" />
            <h1 className="mt-6 font-manrope font-bold text-2xl text-white">Confirming your payment…</h1>
            <p className="mt-3 text-sm text-slate-400">This only takes a moment. Please don't close this window.</p>
          </div>
        )}
        {state === "paid" && (
          <div data-testid="payment-paid">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/15 border border-[#10B981]/40">
              <CheckCircle2 size={34} className="text-[#10B981]" />
            </div>
            <h1 className="mt-6 font-manrope font-extrabold text-3xl text-white tracking-tight">Payment Confirmed</h1>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Thank you for choosing FloForge Automations. A specialist will reach out within
              one business day to kick off your system setup.
            </p>
            <Link to="/" data-testid="success-home-btn" className="mt-8 inline-flex items-center justify-center gap-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-manrope font-semibold px-8 py-3.5 rounded-lg shadow-[0_4px_24px_rgba(91,33,182,0.45)] hover:-translate-y-0.5 transition-all">
              Back to Home <ArrowRight size={16} />
            </Link>
          </div>
        )}
        {(state === "timeout" || state === "error") && (
          <div data-testid="payment-error">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 border border-red-500/40">
              <XCircle size={34} className="text-red-400" />
            </div>
            <h1 className="mt-6 font-manrope font-bold text-2xl text-white">
              {state === "timeout" ? "Still processing" : "Something went wrong"}
            </h1>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              {state === "timeout"
                ? "Your payment is taking longer than usual to confirm. If you completed checkout, it will update shortly."
                : "We couldn't confirm this payment. If you were charged, please contact us and we'll sort it out right away."}
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <button onClick={() => navigate("/pricing")} data-testid="error-retry-btn" className="border border-white/20 hover:border-white/50 text-white font-manrope font-semibold px-6 py-3 rounded-lg transition-all">
                Back to Pricing
              </button>
              <Link to="/" className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-manrope font-semibold px-6 py-3 rounded-lg transition-all">Home</Link>
            </div>
          </div>
        )}
      </motion.div>
    </main>
  );
}
