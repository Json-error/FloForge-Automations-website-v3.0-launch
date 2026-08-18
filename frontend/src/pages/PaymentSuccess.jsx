import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { SealCheck, CircleNotch, XCircle } from "@phosphor-icons/react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const MAX_POLLS = 8;

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const [state, setState] = useState("checking");

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
    <main className="min-h-screen bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center px-6">
      <div data-testid="payment-success-card" className="max-w-md w-full border border-slate-300 rounded-sm bg-[#F8FAFC] p-10 text-center">
        {state === "checking" && (
          <div data-testid="payment-checking">
            <CircleNotch size={40} className="mx-auto animate-spin text-[#10B981]" />
            <h1 className="mt-6 font-manrope font-bold text-2xl">Confirming your payment</h1>
            <p className="mt-3 text-sm text-slate-600">This only takes a moment. Please keep this window open.</p>
          </div>
        )}
        {state === "paid" && (
          <div data-testid="payment-paid">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm border border-[#10B981] bg-[#10B981]/10">
              <SealCheck size={30} className="text-[#0e9f6f]" />
            </div>
            <h1 className="mt-6 font-manrope font-extrabold text-3xl tracking-tight">Payment confirmed</h1>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Thank you for choosing FloForge Automations. A specialist will reach out within one business day to kick off your setup.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link to="/login" data-testid="success-dashboard-btn" className="bg-[#10B981] hover:bg-[#0e9f6f] text-white font-manrope font-semibold px-6 py-3 rounded-sm transition-colors duration-150">
                Go to your dashboard
              </Link>
              <Link to="/" data-testid="success-home-btn" className="border border-slate-300 hover:border-slate-900 font-manrope font-semibold px-6 py-3 rounded-sm transition-colors duration-150">
                Home
              </Link>
            </div>
          </div>
        )}
        {(state === "timeout" || state === "error") && (
          <div data-testid="payment-error">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm border border-red-400 bg-red-100">
              <XCircle size={30} className="text-red-600" />
            </div>
            <h1 className="mt-6 font-manrope font-bold text-2xl">
              {state === "timeout" ? "Still processing" : "Something went wrong"}
            </h1>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {state === "timeout"
                ? "Your payment is taking longer than usual to confirm. If you completed checkout, it will update shortly."
                : "We couldn't confirm this payment. If you were charged, contact us and we'll sort it out right away."}
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <button onClick={() => navigate("/pricing")} data-testid="error-retry-btn" className="border border-slate-300 hover:border-slate-900 font-manrope font-semibold px-6 py-3 rounded-sm transition-colors duration-150">
                Back to Pricing
              </button>
              <Link to="/" className="bg-[#0F172A] hover:bg-slate-800 text-white font-manrope font-semibold px-6 py-3 rounded-sm transition-colors duration-150">Home</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
