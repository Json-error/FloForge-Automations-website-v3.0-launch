import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LogoMark } from "@/components/Logo";

export default function DashboardHeader({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const doLogout = async () => { await logout(); navigate("/login"); };
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0F172A]/85 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark size={32} />
          <span className="font-manrope font-extrabold text-white text-sm sm:text-base">FloForge <span className="text-slate-400 font-semibold hidden sm:inline">{title}</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-slate-400">{user?.name}</span>
          <button onClick={doLogout} data-testid="logout-btn" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white border border-white/15 hover:border-white/40 rounded-lg px-4 py-2 transition-colors">
            <LogOut size={15} /> Log out
          </button>
        </div>
      </div>
    </header>
  );
}
