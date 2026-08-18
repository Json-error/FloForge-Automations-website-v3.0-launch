import LeadForm from "@/components/LeadForm";

export default function Contact() {
  return (
    <section id="contact" className="border-b border-slate-200" data-testid="contact-section">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 px-6 lg:px-8">
        <div className="lg:col-span-2 py-16 lg:py-24 lg:pr-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#0e9f6f]">Contact</p>
          <h2 className="mt-4 font-manrope font-extrabold tracking-tight text-[#0F172A] text-base md:text-lg lg:text-3xl">
            Tell us where the leaks are
          </h2>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            Fill in the form and a FloForge specialist will reach out within one business day with a plan for your operation.
          </p>
          <div className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-600 space-y-2">
            <p>Response time: within one business day</p>
            <p>Consultations: free, 20 minutes, no obligation</p>
          </div>
        </div>
        <div className="lg:col-span-3 lg:border-l border-slate-200 py-16 lg:py-24 lg:pl-12">
          <div className="max-w-md border border-slate-300 rounded-sm p-7 bg-[#F8FAFC]">
            <LeadForm idPrefix="contact" />
          </div>
        </div>
      </div>
    </section>
  );
}
