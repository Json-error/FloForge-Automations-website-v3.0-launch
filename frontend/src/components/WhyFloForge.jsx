const REASONS = [
  { title: "Done for you, start to finish", body: "You get a working system, loaded with your data, with your team trained on it. No software homework." },
  { title: "Built on tools you keep", body: "Your CRM and automations belong to you. If we part ways, everything keeps running." },
  { title: "Priced for small operations", body: "Flat one-time setup packages and a modest monthly partnership. No enterprise contracts." },
  { title: "A real person on the other end", body: "Direct messaging and live training sessions with the person who built your system." },
];

export default function WhyFloForge() {
  return (
    <section id="why" className="border-b border-slate-200 bg-[#F1F5F9]" data-testid="why-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#0e9f6f]">Why FloForge</p>
        <h2 className="mt-4 font-manrope font-extrabold tracking-tight text-[#0F172A] text-base md:text-lg lg:text-3xl max-w-xl">
          A system partner, sized for your business
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0 border-t border-slate-300">
          {REASONS.map((r) => (
            <div key={r.title} className="py-7 border-b border-slate-300" data-testid={`why-${r.title.split(" ")[0].toLowerCase()}`}>
              <h3 className="font-manrope font-bold text-[#0F172A]">{r.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
