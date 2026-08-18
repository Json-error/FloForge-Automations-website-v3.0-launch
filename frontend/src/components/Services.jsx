const SERVICES = [
  { n: "01", title: "CRM Setup", body: "A clean, organized CRM built around how your team works. Contacts, companies, and job history in one place." },
  { n: "02", title: "Pipeline Design", body: "Custom deal stages that match your sales process, from first call to closed job. Nothing slips through." },
  { n: "03", title: "Workflow Automation", body: "Repetitive admin work handled automatically. Task creation, internal alerts, and status updates run themselves." },
  { n: "04", title: "Lead Capture and Follow-up", body: "Forms that feed straight into your pipeline, plus automated follow-ups so every inquiry gets a fast response." },
  { n: "05", title: "Dashboards and Reporting", body: "A live view of leads, jobs, and revenue. You see exactly where the business stands every morning." },
];

export default function Services() {
  return (
    <section id="services" className="border-b border-slate-200" data-testid="services-section">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 px-6 lg:px-8">
        <div className="lg:col-span-2 py-16 lg:py-24 lg:pr-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#0e9f6f]">Our services</p>
          <h2 className="mt-4 font-manrope font-extrabold tracking-tight text-[#0F172A] text-base md:text-lg lg:text-3xl">
            Build a business that runs smarter
          </h2>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            Every engagement is done for you. We design the system, build it, load your data, and train your team on it.
          </p>
        </div>
        <div className="lg:col-span-3 lg:border-l border-slate-200">
          {SERVICES.map((s, i) => (
            <div key={s.n} data-testid={`service-row-${s.n}`}
              className={`flex gap-6 py-8 lg:pl-12 pr-2 ${i > 0 ? "border-t border-slate-200" : "pt-10 lg:pt-24"}`}>
              <span className="font-manrope font-extrabold text-slate-300 text-lg tabular shrink-0">{s.n}</span>
              <div>
                <h3 className="font-manrope font-bold text-[#0F172A]">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-lg">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
