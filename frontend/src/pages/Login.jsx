import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CircleNotch, ArrowLeft } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiError } from "@/lib/api";
import BrandLogo from "@/components/Logo";
import { Toaster } from "@/components/ui/sonner";

const HubSpotIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.1 8.6V6.2a1.9 1.9 0 0 0 1.1-1.7A1.9 1.9 0 0 0 16.3 2.6a1.9 1.9 0 0 0-1.9 1.9c0 .75.43 1.4 1.06 1.7v2.4a5.5 5.5 0 0 0-2.6 1.15L6.7 5.4a2.2 2.2 0 1 0-1.05 1.36l6.05 4.28a5.53 5.53 0 0 0 .08 6.24l-1.9 1.9a1.77 1.77 0 1 0 1.13 1.13l1.88-1.88a5.53 5.53 0 1 0 4.21-9.83zm-.83 8.3a2.83 2.83 0 1 1 0-5.66 2.83 2.83 0 0 1 0 5.66z"/>
  </svg>
);

const PROVIDERS_SOON = ["Google", "Microsoft", "Apple"];

export default function Login() {
  const { login, register, hubspotLogin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState({ hubspot: false });
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get("/auth/providers").then(({ data }) => setProviders(data)).catch(() => {});
    const err = params.get("hubspot_error");
    if (err) toast.error("HubSpot sign-in failed. Please try again or use email.");
  }, [params]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = mode === "login"
        ? await login(form.email, form.password)
        : await register(form.email, form.password, form.name);
      toast.success(mode === "login" ? "Welcome back!" : "Account created!");
      navigate(u.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-[#F8FAFC] border border-slate-300 text-[#0F172A] placeholder:text-slate-400 rounded-sm h-11 px-4 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]";

  return (
    <main className="min-h-screen bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors duration-150" data-testid="login-back-home">
          <ArrowLeft size={15} /> Back to home
        </Link>
        <div className="border border-slate-300 rounded-sm bg-[#F8FAFC] p-8">
          <BrandLogo />
          <h1 className="mt-6 font-manrope font-extrabold text-2xl text-[#0F172A] tracking-tight">
            {mode === "login" ? "Sign in to your dashboard" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            {mode === "login" ? "Access your orders, deliverables, and training." : "Use the email you purchased with."}
          </p>

          <div className="mt-6 space-y-2">
            <button onClick={hubspotLogin} disabled={!providers.hubspot} data-testid="hubspot-login-btn"
              title={providers.hubspot ? "Sign in with HubSpot" : "HubSpot sign-in will be enabled once configured"}
              className="w-full h-11 rounded-sm border border-slate-300 bg-[#0F172A] text-[#F8FAFC] font-manrope font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors duration-150 disabled:opacity-45 disabled:cursor-not-allowed">
              <HubSpotIcon /> Sign in with HubSpot{!providers.hubspot && " (soon)"}
            </button>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS_SOON.map((p) => (
                <button key={p} disabled data-testid={`provider-${p.toLowerCase()}-btn`}
                  title={`${p} sign-in coming soon`}
                  className="h-10 rounded-sm border border-slate-300 text-slate-400 text-xs font-medium cursor-not-allowed">
                  {p} (soon)
                </button>
              ))}
            </div>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-slate-300" />or use email<span className="h-px flex-1 bg-slate-300" />
          </div>

          <form onSubmit={submit} className="space-y-3" data-testid="auth-form">
            {mode === "register" && (
              <input data-testid="auth-name" className={inputCls} placeholder="Full name" value={form.name} onChange={(e) => upd("name", e.target.value)} required />
            )}
            <input data-testid="auth-email" type="email" className={inputCls} placeholder="Email address" value={form.email} onChange={(e) => upd("email", e.target.value)} required />
            <input data-testid="auth-password" type="password" className={inputCls} placeholder="Password" value={form.password} onChange={(e) => upd("password", e.target.value)} required />
            <button type="submit" disabled={loading} data-testid="auth-submit"
              className="w-full h-11 bg-[#10B981] hover:bg-[#0e9f6f] disabled:opacity-60 text-white font-manrope font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors duration-150">
              {loading ? <CircleNotch size={18} className="animate-spin" /> : (mode === "login" ? "Sign In" : "Create Account")}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button data-testid="auth-toggle" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-[#0e9f6f] hover:text-[#0F172A] font-medium transition-colors duration-150">
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
      <Toaster position="top-center" />
    </main>
  );
}
