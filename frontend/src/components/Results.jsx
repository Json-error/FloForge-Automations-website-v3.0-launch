const BEFORE = [
  "Leads written on paper or lost in text threads",
  "Follow-ups that depend on someone remembering",
  "Estimates sent late, then never chased",
  "No idea which jobs are stuck or why",
];

const AFTER = [
  "Every inquiry lands in one pipeline, instantly",
  "Follow-ups fire automatically on a schedule",
  "Estimates tracked with reminders until answered",
  "A dashboard that shows job status at a glance",
];

export default function Results() {
  return (
    <section id="results" className="bg-[#0F172A] text-[#F8FAFC] border-b border-slate-200" data-testid="results-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#10B981]">Results</p>
        <h2 className="mt-4 font-manrope font-extrabold tracking-tight text-base md:text-lg lg:text-3xl max-w-xl">
          What changes when the system takes over
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div data-testid="results-before">
            <h3 className="font-manrope font-bold text-slate-400 text-sm uppercase tracking-wider">Before</h3>
            <ul className="mt-5 space-y-4">
              {BEFORE.map((b) => (
                <li key={b} className="flex gap-3 text-sm text-slate-400 border-b border-slate-800 pb-4">
                  <span className="mt-1.5 h-2 w-2 shrink-0 bg-slate-600" />{b}
                </li>
              ))}
            </ul>
          </div>
          <div data-testid="results-after">
            <h3 className="font-manrope font-bold text-[#10B981] text-sm uppercase tracking-wider">After</h3>
            <ul className="mt-5 space-y-4">
              {AFTER.map((a) => (
                <li key={a} className="flex gap-3 text-sm text-slate-200 border-b border-slate-800 pb-4">
                  <span className="mt-1.5 h-2 w-2 shrink-0 bg-[#10B981]" />{a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
