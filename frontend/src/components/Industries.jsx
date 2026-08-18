const INDUSTRY_IMG = "https://images.pexels.com/photos/5463581/pexels-photo-5463581.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const INDUSTRIES = [
  { name: "HVAC", note: "Seasonal demand spikes, service agreements, and maintenance reminders handled automatically." },
  { name: "Plumbing", note: "Emergency calls triaged fast. Estimates, follow-ups, and invoicing stay on schedule." },
  { name: "Electrical", note: "Bid tracking and job stages organized so multi-week projects never stall." },
  { name: "Construction", note: "Subcontractor coordination, change orders, and client updates in one pipeline." },
  { name: "Landscaping", note: "Recurring service scheduling and quote follow-ups without manual chasing." },
  { name: "Home Services", note: "Cleaning, roofing, and repair teams get the same organized lead-to-invoice flow." },
];

export default function Industries() {
  return (
    <section id="industries" className="border-b border-slate-200" data-testid="industries-section">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 px-6 lg:px-8">
        <div className="lg:col-span-2 py-16 lg:py-24 lg:pr-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#0e9f6f]">Industries</p>
          <h2 className="mt-4 font-manrope font-extrabold tracking-tight text-[#0F172A] text-base md:text-lg lg:text-3xl">
            Built for the trades and local operators
          </h2>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            The playbook adapts to your field. Same system, tuned to your jobs, your seasons, and your crew.
          </p>
          <img src={INDUSTRY_IMG} alt="Technician servicing an air conditioning unit"
            className="mt-8 w-full h-56 object-cover border border-slate-300 rounded-sm" data-testid="industries-image" />
        </div>
        <div className="lg:col-span-3 lg:border-l border-slate-200">
          {INDUSTRIES.map((ind, i) => (
            <div key={ind.name} data-testid={`industry-${ind.name.toLowerCase().replace(" ", "-")}`}
              className={`py-6 lg:pl-12 ${i > 0 ? "border-t border-slate-200" : "pt-10 lg:pt-24"}`}>
              <h3 className="font-manrope font-bold text-[#0F172A]">{ind.name}</h3>
              <p className="mt-1 text-sm text-slate-600 max-w-lg">{ind.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
