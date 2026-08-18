import { Link } from "react-router-dom";
import BrandLogo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-400" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <BrandLogo dark />
          <p className="mt-4 text-sm leading-relaxed max-w-xs">
            CRM systems and workflow automation for contractors and local businesses.
          </p>
        </div>
        <div>
          <h4 className="font-manrope font-bold text-[#F8FAFC] text-sm">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="/#services" className="hover:text-white transition-colors duration-150">Services</a></li>
            <li><a href="/#how-it-works" className="hover:text-white transition-colors duration-150">How It Works</a></li>
            <li><a href="/#industries" className="hover:text-white transition-colors duration-150">Industries</a></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors duration-150">Pricing</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors duration-150">Client Sign In</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-manrope font-bold text-[#F8FAFC] text-sm">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="/#contact" className="hover:text-white transition-colors duration-150">Request a strategy call</a></li>
            <li>Mon to Fri, 9:00 AM to 4:00 PM (Arizona)</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 text-xs text-slate-500">
          {new Date().getFullYear()} FloForge Automations. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
