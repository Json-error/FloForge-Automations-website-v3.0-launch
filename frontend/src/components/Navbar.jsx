import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import ContactDialog from "@/components/ContactDialog";

const LINKS = [
  { name: "Services", id: "services" },
  { name: "How It Works", id: "how-it-works" },
  { name: "Industries", id: "industries" },
  { name: "Results", id: "results" },
  { name: "Contact", id: "contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["services", "how-it-works", "industries", "results", "contact"];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      data-testid="main-navbar"
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-[#0F172A]/80 border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center h-20 px-6 lg:px-8">
        <a
          href="#top"
          data-testid="navbar-logo"
          className="flex items-center gap-2.5 group"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B21B6] shadow-[0_0_18px_rgba(91,33,182,0.6)]">
            <span className="h-3 w-3 rounded-sm bg-[#10B981]" />
          </span>
          <span className="text-lg font-extrabold font-manrope tracking-tight text-white">
            FloForge <span className="text-slate-400 font-semibold">Automations</span>
          </span>
        </a>

        <div className="hidden md:flex items-center space-x-8">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              data-testid={`navbar-link-${l.id}`}
              className={`text-sm font-medium transition-colors duration-200 relative after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-[#5B21B6] after:transition-all after:duration-300 ${
                active === l.id
                  ? "text-white after:w-full"
                  : "text-slate-300 hover:text-white after:w-0 hover:after:w-full"
              }`}
            >
              {l.name}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <ContactDialog
            trigger={
              <button
                data-testid="navbar-cta"
                className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-sm font-semibold font-manrope px-5 py-2.5 rounded-md transition-all duration-300 shadow-[0_0_15px_rgba(91,33,182,0.4)] hover:shadow-[0_0_25px_rgba(91,33,182,0.7)] hover:-translate-y-0.5"
              >
                Start Now
              </button>
            }
          />
        </div>

        <button
          className="md:hidden text-white p-2"
          data-testid="mobile-menu-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex flex-col gap-4"
          data-testid="mobile-menu"
        >
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={() => setMobileOpen(false)}
              className="text-slate-300 hover:text-white text-sm font-medium"
            >
              {l.name}
            </a>
          ))}
          <ContactDialog
            trigger={
              <button className="bg-[#5B21B6] text-white text-sm font-semibold font-manrope px-5 py-2.5 rounded-md w-full">
                Start Now
              </button>
            }
          />
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
