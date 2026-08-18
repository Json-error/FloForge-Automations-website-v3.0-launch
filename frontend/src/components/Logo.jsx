export const LOGO_URL = "/logo.png";

export const LogoMark = ({ size = 34, className = "" }) => (
  <span
    className={`inline-flex items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-[#F8FAFC] ${className}`}
    style={{ height: size, width: size }}
  >
    <img src={LOGO_URL} alt="FloForge Automations logo" className="h-full w-full object-contain p-0.5" />
  </span>
);

export const BrandLogo = ({ size = 32, dark = false }) => (
  <span className="flex items-center gap-2.5">
    <LogoMark size={size} />
    <span className={`text-base font-extrabold font-manrope tracking-tight ${dark ? "text-[#F8FAFC]" : "text-[#0F172A]"}`}>
      FloForge <span className={dark ? "text-slate-400 font-semibold" : "text-slate-500 font-semibold"}>Automations</span>
    </span>
  </span>
);

export default BrandLogo;
