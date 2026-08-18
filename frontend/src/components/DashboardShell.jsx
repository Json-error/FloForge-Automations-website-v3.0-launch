import { useNavigate, Link } from "react-router-dom";
import { SignOut } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { LogoMark } from "@/components/Logo";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardShell({ title, nav, active, onNavigate, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const doLogout = async () => { await logout(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex" data-testid="dashboard-shell">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-[#F8FAFC] sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2.5 h-16 px-5 border-b border-slate-200" data-testid="shell-logo">
          <LogoMark size={28} />
          <span className="font-manrope font-extrabold text-sm text-[#0F172A]">FloForge</span>
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        </Link>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {nav.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => onNavigate(id)} data-testid={`sidenav-${id}`}
              className={`w-full flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors duration-150 ${
                active === id ? "bg-slate-200 text-[#0F172A] font-medium" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}>
              <Icon size={17} weight={active === id ? "fill" : "regular"} /> {label}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <p className="text-xs text-slate-500 truncate" data-testid="shell-user-email">{user?.email}</p>
          <button onClick={doLogout} data-testid="logout-btn"
            className="mt-2 w-full flex items-center justify-center gap-2 text-sm text-slate-700 border border-slate-300 hover:border-slate-900 rounded-sm px-3 py-1.5 transition-colors duration-150">
            <SignOut size={15} /> Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-40 bg-[#F8FAFC] border-b border-slate-200">
          <div className="flex items-center justify-between h-14 px-4">
            <Link to="/" className="flex items-center gap-2"><LogoMark size={26} /><span className="font-manrope font-bold text-sm">FloForge {title}</span></Link>
            <button onClick={doLogout} className="text-sm text-slate-600 border border-slate-300 rounded-sm px-3 py-1.5">Log out</button>
          </div>
          <div className="flex overflow-x-auto border-t border-slate-200 px-2">
            {nav.map(({ id, label }) => (
              <button key={id} onClick={() => onNavigate(id)} data-testid={`mobilenav-${id}`}
                className={`shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 ${active === id ? "border-[#10B981] text-[#0F172A]" : "border-transparent text-slate-500"}`}>
                {label}
              </button>
            ))}
          </div>
        </header>
        <header className="hidden md:flex items-center h-16 px-8 border-b border-slate-200 bg-[#F8FAFC]">
          <h1 className="font-manrope font-extrabold text-lg tracking-tight" data-testid="shell-page-title">
            {nav.find((n) => n.id === active)?.label}
          </h1>
          <span className="ml-auto text-sm text-slate-500">{user?.name}</span>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
