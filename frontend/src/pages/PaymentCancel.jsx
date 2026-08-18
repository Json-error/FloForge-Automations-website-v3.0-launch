import { Link } from "react-router-dom";
import { Prohibit } from "@phosphor-icons/react";

export default function PaymentCancel() {
  return (
    <main className="min-h-screen bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center px-6">
      <div data-testid="payment-cancel-card" className="max-w-md w-full border border-slate-300 rounded-sm bg-[#F8FAFC] p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm border border-slate-400 bg-slate-100">
          <Prohibit size={30} className="text-slate-600" />
        </div>
        <h1 className="mt-6 font-manrope font-bold text-2xl">Checkout canceled</h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          No charge was made. You can pick a plan whenever you're ready.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/pricing" data-testid="cancel-pricing-btn" className="bg-[#10B981] hover:bg-[#0e9f6f] text-white font-manrope font-semibold px-6 py-3 rounded-sm transition-colors duration-150">
            Back to Pricing
          </Link>
          <Link to="/" data-testid="cancel-home-btn" className="border border-slate-300 hover:border-slate-900 font-manrope font-semibold px-6 py-3 rounded-sm transition-colors duration-150">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
