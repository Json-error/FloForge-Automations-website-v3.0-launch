import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, ShieldCheck } from "lucide-react";
import LeadForm from "@/components/LeadForm";

const HIGHLIGHTS = [
  { Icon: ShieldCheck, title: "No pressure, ever", desc: "A friendly conversation about your operations—not a sales pitch." },
  { Icon: Clock, title: "Reply within 1 business day", desc: "We review your details and reach out with clear next steps." },
  { Icon: MapPin, title: "Built around your workflow", desc: "Every system is customized to how your team actually works." },
];

export const Contact = () => {
  return (
    <section id="contact" data-testid="contact-section" className="relative overflow-hidden bg-[#0F172A] py-24 lg:py-32 border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(91,33,182,0.22),transparent_55%)]" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-20 right-0 h-72 w-72 rounded-full bg-[#10B981]/10 blur-[120px] animate-glow-pulse" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* left */}
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}>
          <span data-testid="contact-label" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#a78bfa]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5B21B6]" />GET STARTED
          </span>
          <h2 data-testid="contact-heading" className="mt-6 font-manrope font-extrabold tracking-tighter text-white text-4xl sm:text-5xl leading-[1.05]">
            Let's Build Your{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#10B981] bg-clip-text text-transparent">Operations System</span>
          </h2>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            Tell us where your business is leaking time and leads. We'll map out a simple,
            reliable system that keeps everything organized and following up automatically.
          </p>

          <div className="mt-8 space-y-5">
            {HIGHLIGHTS.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5B21B6]/15 border border-[#5B21B6]/30 text-[#a78bfa]">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="font-manrope font-semibold text-white text-sm">{title}</p>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <a href="mailto:datatype.json@gmail.com" data-testid="contact-email" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <Mail size={16} className="text-[#10B981]" /> datatype.json@gmail.com
            </a>
            <a href="tel:+19282354586" data-testid="contact-phone" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <Phone size={16} className="text-[#10B981]" /> (928)-235-4586
            </a>
          </div>
        </motion.div>

        {/* right: form */}
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay: 0.15 }}
          data-testid="contact-form-card"
          className="relative rounded-[24px] border border-white/10 bg-gradient-to-b from-[#312E81]/25 to-[#0F172A]/70 backdrop-blur-2xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#5B21B6]/25 blur-[60px]" />
          <div className="relative">
            <h3 className="font-manrope font-extrabold text-2xl text-white tracking-tight">Request your free strategy call</h3>
            <p className="mt-1.5 text-sm text-slate-400">Takes under a minute. No credit card, no commitment.</p>
            <div className="mt-6">
              <LeadForm idPrefix="contact" submitLabel="Request My Free Strategy Call" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
