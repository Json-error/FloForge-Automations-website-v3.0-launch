import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { LogoMark } from "@/components/Logo";
import { Toaster } from "@/components/ui/sonner";

export default function Login() {
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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

  const inputCls = "w-full bg-black/20 border border-white/10 text-white placeholder:text-slate-500 rounded-lg h-12 px-4 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]";

  return (
    <main className="relative min-h-screen bg-[#0F172A] text-[#F8FAFC] flex items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-[#5B21B6]/20 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6"><ArrowLeft size={15} /> Back to home</Link>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2.5 mb-6"><LogoMark size={34} /><span className="font-manrope font-extrabold text-white">FloForge <span className="text-slate-400 font-semibold">Automations</span></span></div>
          <h1 className="font-manrope font-extrabold text-2xl text-white tracking-tight">{mode === "login" ? "Sign in to your dashboard" : "Create your account"}</h1>
          <p className="mt-1.5 text-sm text-slate-400">{mode === "login" ? "Access your orders, deliverables & training." : "Use the email you purchased with."}</p>

          <button onClick={googleLogin} data-testid="google-login-btn" className="mt-6 w-full h-12 rounded-lg bg-white text-slate-800 font-manrope font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-5 w-5" /> Continue with Google
          </button>
          <div className="my-5 flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-white/10" />or{" "}<span className="h-px flex-1 bg-white/10" /></div>

          <form onSubmit={submit} className="space-y-3" data-testid="auth-form">
            {mode === "register" && (
              <input data-testid="auth-name" className={inputCls} placeholder="Full name" value={form.name} onChange={(e) => upd("name", e.target.value)} required />
            )}
            <input data-testid="auth-email" type="email" className={inputCls} placeholder="Email address" value={form.email} onChange={(e) => upd("email", e.target.value)} required />
            <input data-testid="auth-password" type="password" className={inputCls} placeholder="Password" value={form.password} onChange={(e) => upd("password", e.target.value)} required />
            <button type="submit" disabled={loading} data-testid="auth-submit" className="w-full h-12 bg-[#5B21B6] hover:bg-[#4C1D95] disabled:opacity-60 text-white font-manrope font-semibold rounded-lg shadow-[0_4px_20px_rgba(91,33,182,0.4)] flex items-center justify-center gap-2 transition-all">
              {loading ? <Loader2 size={18} className="animate-spin" /> : (mode === "login" ? "Sign In" : "Create Account")}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button data-testid="auth-toggle" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-[#a78bfa] hover:text-white font-medium">
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
      <Toaster position="top-center" />
    </main>
  );
}
