import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

const SECTIONS = [
  { h: "Information We Collect", p: "When you use our website or submit our contact form, we collect the details you choose to share with us—typically your name, company name, email address, and a short note about your biggest operational bottleneck. We may also collect basic, non-identifying technical information such as browser type and general usage data to help us improve the site." },
  { h: "How Contact Form Submissions Are Used", p: "The information you submit through our contact form is used for one purpose: to understand your business needs and follow up with you about how FloForge Automations can help. We use it to respond to your inquiry, schedule a consultation, and prepare relevant recommendations. We do not sell, rent, or trade your information to anyone." },
  { h: "Cookies", p: "We use a minimal set of cookies to keep the website functioning smoothly and to understand, in aggregate, how visitors use our pages. We do not use cookies to build advertising profiles. You can disable cookies in your browser settings at any time without losing access to the core content of the site." },
  { h: "Third-Party Tools", p: "We rely on a few trusted third-party services to operate our website and communicate with you—such as hosting, analytics, and email tools. These providers only receive the information necessary to perform their function and are expected to handle it responsibly. We do not share your data with third parties for their own marketing." },
  { h: "Data Retention", p: "We keep your contact details only as long as needed to serve you and maintain a working relationship, or as required for legitimate business and legal purposes. If you ask us to remove your information and we are not legally required to keep it, we will delete it promptly." },
  { h: "Your Rights", p: "You have the right to access the personal information we hold about you, request corrections, or ask us to delete it. You can also opt out of future communications at any time. To exercise any of these rights, simply reach out using the contact details below and we will respond as quickly as we can." },
  { h: "How to Contact FloForge", p: "If you have any questions about this Privacy Policy or how your information is handled, we would be glad to help. Email us at hello@floforge.io and a member of our team will get back to you within one business day." },
];

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="relative min-h-screen bg-[#0F172A] text-[#F8FAFC] antialiased">
      {/* header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0F172A]/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-20 px-6">
          <Link to="/" className="flex items-center gap-2.5" data-testid="privacy-logo">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B21B6] shadow-[0_0_18px_rgba(91,33,182,0.6)]">
              <span className="h-3 w-3 rounded-sm bg-[#10B981]" />
            </span>
            <span className="text-lg font-extrabold font-manrope tracking-tight text-white">
              FloForge <span className="text-slate-400 font-semibold">Automations</span>
            </span>
          </Link>
          <Link to="/" data-testid="privacy-back" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </header>

      {/* content */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-10 right-0 h-72 w-72 rounded-full bg-[#5B21B6]/15 blur-[120px]" />

        <div className="relative max-w-4xl mx-auto px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#a78bfa]">
            <ShieldCheck size={13} /> PRIVACY POLICY
          </span>
          <h1 className="mt-6 font-manrope font-extrabold tracking-tighter text-white text-4xl sm:text-5xl leading-[1.05]">
            Your Trust Matters to Us
          </h1>
          <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-2xl">
            FloForge Automations is built on organized, trustworthy systems—and that
            starts with how we handle your information. Here's a clear, plain-language
            explanation of what we collect and why.
          </p>
          <p className="mt-3 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

          <div className="mt-12 space-y-8">
            {SECTIONS.map((s, i) => (
              <div key={s.h} data-testid={`privacy-section-${i}`} className="rounded-[22px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
                <h2 className="font-manrope font-bold text-xl text-white tracking-tight flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5B21B6]/20 border border-[#5B21B6]/30 text-[#a78bfa] text-xs font-bold">{i + 1}</span>
                  {s.h}
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-400">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <Toaster position="top-center" />
    </main>
  );
}
