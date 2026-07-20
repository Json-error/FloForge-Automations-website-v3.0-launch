export const LOGO_URL =
  "https://customer-assets-jt897jd0.emergentagent.net/job_lead-automation-hub-19/artifacts/71o7xb3c_Gemini_Generated_Image_ysvu6oysvu6oysvu%202.png";

export const LogoMark = ({ size = 34, className = "" }) => (
  <span
    className={`inline-flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_0_18px_rgba(91,33,182,0.45)] ring-1 ring-white/20 ${className}`}
    style={{ height: size, width: size }}
  >
    <img src={LOGO_URL} alt="FloForge Automations logo" className="h-full w-full object-contain p-1" />
  </span>
);

export const BrandLogo = ({ size = 34 }) => (
  <span className="flex items-center gap-2.5">
    <LogoMark size={size} />
    <span className="text-lg font-extrabold font-manrope tracking-tight text-white">
      FloForge <span className="text-slate-400 font-semibold">Automations</span>
    </span>
  </span>
);

export default BrandLogo;
