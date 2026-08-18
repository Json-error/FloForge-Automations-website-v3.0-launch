const STEPS = [
  { n: "1", title: "Discover", body: "A short call to map how leads, jobs, and follow-ups move through your business today." },
  { n: "2", title: "Design", body: "We draft your pipeline stages, automations, and dashboard before anything gets built." },
  { n: "3", title: "Automate", body: "We build the system, migrate your contacts, and switch on the automations." },
  { n: "4", title: "Optimize", body: "Live training for your team, then ongoing tuning as your operation grows." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-slate-200 bg-[#F1F5F9]" data-testid="how-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#0e9f6f]">How it works</p>
        <h2 className="mt-4 font-manrope font-extrabold tracking-tight text-[#0F172A] text-base md:text-lg lg:text-3xl max-w-xl">
          From business chaos to organized growth in four steps
        </h2>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-300">
          {STEPS.map((s, i) => (
            <div key={s.n} data-testid={`step-${s.n}`}
              className={`pt-6 pb-4 pr-6 ${i > 0 ? "lg:border-l lg:border-slate-300 lg:pl-6" : ""}`}>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#0F172A] text-[#F8FAFC] font-manrope font-bold text-sm">{s.n}</span>
              <h3 className="mt-4 font-manrope font-bold text-[#0F172A]">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
