import { useState } from "react";
import { Link } from "react-router-dom";
import { List, X } from "@phosphor-icons/react";
import BrandLogo from "@/components/Logo";
import ContactDialog from "@/components/ContactDialog";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "#services", label: "Services" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#industries", label: "Industries" },
  { href: "#results", label: "Results" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#F8FAFC] border-b border-slate-200" data-testid="navbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6 lg:px-8">
        <Link to="/" data-testid="nav-logo"><BrandLogo /></Link>
        <nav className="hidden lg:flex items-center gap-7">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} data-testid={`nav-${l.href.slice(1)}`}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors duration-150">{l.label}</a>
          ))}
          <Link to="/pricing" data-testid="nav-pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors duration-150">Pricing</Link>
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Link to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"} data-testid="nav-signin"
            className="text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-900 rounded px-4 py-2 transition-colors duration-150">
            {user ? "Dashboard" : "Sign In"}
          </Link>
          <button onClick={() => setDialogOpen(true)} data-testid="nav-cta"
            className="text-sm font-manrope font-semibold bg-[#10B981] hover:bg-[#0e9f6f] text-white rounded px-4 py-2 transition-colors duration-150">
            Start Now
          </button>
        </div>
        <button onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle" className="lg:hidden text-slate-800">
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-[#F8FAFC] px-6 py-4 space-y-3" data-testid="nav-mobile-menu">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm text-slate-700">{l.label}</a>
          ))}
          <Link to="/pricing" className="block text-sm text-slate-700">Pricing</Link>
          <Link to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"} className="block text-sm font-medium text-slate-900">
            {user ? "Dashboard" : "Sign In"}
          </Link>
          <button onClick={() => { setOpen(false); setDialogOpen(true); }}
            className="w-full text-sm font-manrope font-semibold bg-[#10B981] text-white rounded px-4 py-2.5">Start Now</button>
        </div>
      )}
      <ContactDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </header>
  );
}
