import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { SquaresFour, Receipt, CalendarBlank, ChatCircleText, BookOpen, TrendUp, PlugsConnected, PaperPlaneRight, CircleNotch, CheckCircle, Circle, Clock, ArrowRight, DownloadSimple } from "@phosphor-icons/react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/DashboardShell";
import HubSpotPanel from "@/components/HubSpotPanel";

const money = (c) => `$${((c || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const fmtDate = (s) => (s ? new Date(typeof s === "number" ? s * 1000 : s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "");
const StatusIcon = ({ s }) => s === "complete" ? <CheckCircle size={16} weight="fill" className="text-[#10B981]" /> : s === "in_progress" ? <Clock size={16} className="text-slate-500" /> : <Circle size={16} className="text-slate-300" />;
const statusLabel = { complete: "Done", in_progress: "In progress", pending: "Pending" };

const Card = ({ children, testid, className = "" }) => (
  <div data-testid={testid} className={`border border-slate-200 rounded-sm bg-[#F8FAFC] p-6 ${className}`}>{children}</div>
);

export default function ClientDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [updates, setUpdates] = useState({ updates: [], next_quarterly_review: null });
  const [timeline, setTimeline] = useState([]);
  const [resources, setResources] = useState([]);
  const [billing, setBilling] = useState(null);

  const load = useCallback(async () => {
    try {
      const [o, b, m, u, t, r] = await Promise.all([
        api.get("/client/orders"), api.get("/client/bookings"),
        api.get("/client/messages"), api.get("/client/updates"),
        api.get("/client/timeline"), api.get("/client/resources"),
      ]);
      setOrders(o.data); setBookings(b.data); setMessages(m.data);
      setUpdates(u.data); setTimeline(t.data); setResources(r.data);
    } catch { toast.error("Could not load your dashboard."); }
    api.get("/client/billing").then(({ data }) => setBilling(data)).catch(() => setBilling({ subscriptions: [], invoices: [], payments: [] }));
  }, []);
  useEffect(() => { load(); }, [load]);

  const hasGrowth = orders.some((o) => o.recurring);
  const nav = [
    { id: "overview", label: "Overview", Icon: SquaresFour },
    { id: "billing", label: "Billing", Icon: Receipt },
    { id: "training", label: "Book Training", Icon: CalendarBlank },
    { id: "messages", label: "Messages", Icon: ChatCircleText },
    { id: "resources", label: "Resources", Icon: BookOpen },
    { id: "hubspot", label: "HubSpot", Icon: PlugsConnected },
    ...(hasGrowth ? [{ id: "growth", label: "Growth Log", Icon: TrendUp }] : []),
  ];

  return (
    <DashboardShell title="Client" nav={nav} active={tab} onNavigate={setTab}>
      {tab === "overview" && <Overview user={user} orders={orders} bookings={bookings} timeline={timeline} />}
      {tab === "billing" && <Billing billing={billing} />}
      {tab === "training" && <Training bookings={bookings} reload={load} />}
      {tab === "messages" && <Messages messages={messages} reload={load} />}
      {tab === "resources" && <Resources resources={resources} />}
      {tab === "hubspot" && <HubSpotPanel />}
      {tab === "growth" && <Growth updates={updates} />}
    </DashboardShell>
  );
}

function nextStepFor(orders, bookings) {
  if (!orders.length) return null;
  const dels = orders.flatMap((o) => o.deliverables);
  const hasUpcoming = bookings.some((b) => new Date(b.slot_start) > new Date());
  const inProg = dels.find((d) => d.status === "in_progress");
  if (inProg) return { title: `We're currently working on: ${inProg.label}`, body: "We'll mark it done as soon as it's live. No action needed from you right now." };
  const pending = dels.find((d) => d.status === "pending");
  if (pending) return { title: `Up next: ${pending.label}`, body: hasUpcoming ? "Your training session is booked. We'll keep moving through your setup in the meantime." : "While we work through your setup, book your training session so it's ready when you are." };
  if (!hasUpcoming) return { title: "Your setup is complete. Book your training.", body: "Everything is delivered. Grab a training slot so we can walk you through your new system." };
  return { title: "You're all set", body: "Setup is complete and your training is booked. Reach out anytime via Messages." };
}

function Overview({ user, orders, bookings, timeline }) {
  if (!orders.length)
    return <Card testid="no-orders"><p className="text-slate-600 text-sm">No orders yet. Once you purchase a package it will appear here with your deliverables checklist.</p></Card>;
  const step = nextStepFor(orders, bookings);
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500" data-testid="overview-welcome">Welcome back, {user?.name?.split(" ")[0]}. Here's where your setup stands.</p>
      {step && (
        <div data-testid="next-steps-callout" className="border border-[#10B981] rounded-sm bg-[#10B981]/5 p-5 flex items-start gap-4">
          <ArrowRight size={20} className="text-[#0e9f6f] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#0e7a57] uppercase">What happens next</p>
            <h3 className="mt-1 font-manrope font-bold">{step.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{step.body}</p>
          </div>
        </div>
      )}
      {orders.map((o) => {
        const done = o.deliverables.filter((d) => d.status === "complete").length;
        const pct = o.deliverables.length ? Math.round((done / o.deliverables.length) * 100) : 0;
        return (
          <Card key={o.session_id} testid={`order-${o.session_id}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-manrope font-bold text-lg">{o.tier_name}</h3>
                <p className="mt-0.5 text-sm text-slate-500">Purchased {fmtDate(o.purchase_date)} · {money(o.amount)}{o.recurring ? " per month" : ""}</p>
              </div>
              <div className="text-right">
                <p className="font-manrope font-extrabold text-2xl tabular" data-testid={`order-pct-${o.session_id}`}>{pct}%</p>
                <p className="text-xs text-slate-500" data-testid={`order-progress-${o.session_id}`}>{done} of {o.deliverables.length} delivered</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-sm overflow-hidden">
              <div className="h-full bg-[#10B981] transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {o.deliverables.map((d) => (
                <div key={d.key} className="flex items-center justify-between gap-3 border border-slate-200 rounded-sm px-3 py-2.5 bg-[#F8FAFC]">
                  <span className="flex items-center gap-2.5 text-sm"><StatusIcon s={d.status} /> {d.label}</span>
                  <span className="text-xs text-slate-500">{statusLabel[d.status]}</span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
      <Card testid="client-timeline">
        <h3 className="font-manrope font-bold">What's happened so far</h3>
        {!timeline.length ? <p className="mt-3 text-sm text-slate-500">Your account activity will appear here as we get to work.</p> : (
          <ul className="mt-4">
            {timeline.map((e, i) => (
              <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                {i < timeline.length - 1 && <span className="absolute left-[5px] top-4 bottom-0 w-px bg-slate-200" />}
                <span className={`mt-1.5 h-[11px] w-[11px] shrink-0 ${e.type === "purchase" ? "bg-[#0F172A]" : e.type === "deliverable" ? "bg-[#10B981]" : "bg-slate-300"}`} />
                <div>
                  <p className="text-sm">{e.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{fmtDate(e.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Billing({ billing }) {
  if (!billing) return <CircleNotch size={22} className="animate-spin text-[#10B981]" />;
  const { subscriptions = [], invoices = [], payments = [] } = billing;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-manrope font-bold mb-3">Active subscriptions</h3>
        {!subscriptions.length ? <Card testid="no-subscriptions"><p className="text-sm text-slate-500">No subscriptions. One-time packages don't renew.</p></Card> : (
          <div className="space-y-3" data-testid="subscriptions-list">
            {subscriptions.map((s) => (
              <Card key={s.id} testid={`subscription-${s.id}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-manrope font-bold">{s.plan_name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {money(s.amount)} per {s.interval}
                      {s.current_period_end && ` · renews ${fmtDate(s.current_period_end)}`}
                      {s.cancel_at_period_end && " · cancels at period end"}
                    </p>
                  </div>
                  <span className={`text-xs font-medium uppercase tracking-wider px-2.5 py-1 rounded-sm border ${
                    s.status === "active" ? "border-[#10B981] text-[#0e7a57] bg-[#10B981]/10" : "border-slate-300 text-slate-600 bg-slate-100"}`}>
                    {s.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="font-manrope font-bold mb-3">Invoices</h3>
        {!invoices.length ? <Card testid="no-invoices"><p className="text-sm text-slate-500">No invoices yet.</p></Card> : (
          <div className="border border-slate-200 rounded-sm overflow-x-auto" data-testid="invoices-table">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-3">Invoice</th><th className="py-2.5 px-3">Date</th><th className="py-2.5 px-3">Amount</th><th className="py-2.5 px-3">Status</th><th className="py-2.5 px-3"></th>
              </tr></thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100" data-testid={`invoice-${inv.id}`}>
                    <td className="py-2 px-3 font-medium">{inv.number || inv.id.slice(0, 12)}</td>
                    <td className="py-2 px-3 text-slate-600">{fmtDate(inv.date)}</td>
                    <td className="py-2 px-3 tabular">{money(inv.amount_paid || inv.amount_due)}</td>
                    <td className="py-2 px-3"><span className={inv.status === "paid" ? "text-[#0e7a57] font-medium" : "text-slate-600"}>{inv.status}</span></td>
                    <td className="py-2 px-3 text-right">
                      {inv.invoice_pdf && (
                        <a href={inv.invoice_pdf} target="_blank" rel="noreferrer" data-testid={`invoice-pdf-${inv.id}`}
                          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 hover:border-slate-900 rounded-sm px-2 py-1 transition-colors duration-150">
                          <DownloadSimple size={13} /> PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div>
        <h3 className="font-manrope font-bold mb-3">Payment history</h3>
        {!payments.length ? <Card testid="no-payments"><p className="text-sm text-slate-500">No payments recorded yet.</p></Card> : (
          <div className="border border-slate-200 rounded-sm overflow-x-auto" data-testid="payments-table">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-3">Package</th><th className="py-2.5 px-3">Date</th><th className="py-2.5 px-3">Amount</th><th className="py-2.5 px-3">Type</th>
              </tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.session_id} className="border-b border-slate-100">
                    <td className="py-2 px-3 font-medium">{p.tier_name}</td>
                    <td className="py-2 px-3 text-slate-600">{fmtDate(p.date)}</td>
                    <td className="py-2 px-3 tabular">{money(p.amount)}</td>
                    <td className="py-2 px-3 text-slate-600">{p.recurring ? "Subscription" : "One-time"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Training({ bookings, reload }) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  const loadSlots = async (d) => {
    setDate(d); setSlots([]); if (!d) return;
    setLoading(true);
    try { const { data } = await api.get(`/bookings/availability?date=${d}`); setSlots(data); }
    catch { toast.error("Could not load availability."); }
    finally { setLoading(false); }
  };
  const book = async (slot) => {
    setBooking(slot.start);
    try {
      await api.post("/bookings", { slot_start: slot.start });
      toast.success("Training session booked!");
      await reload(); await loadSlots(date);
    } catch (e) { toast.error(e.response?.data?.detail || "Could not book."); }
    finally { setBooking(null); }
  };
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card testid="booking-widget">
        <h3 className="font-manrope font-bold">Book a training session</h3>
        <p className="mt-1 text-sm text-slate-500">Mon to Fri, 9:00 AM to 4:00 PM (Arizona time). 30 minute sessions.</p>
        <input type="date" min={today} value={date} onChange={(e) => loadSlots(e.target.value)} data-testid="booking-date"
          className="mt-4 bg-[#F8FAFC] border border-slate-300 rounded-sm h-10 px-3 text-sm focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]" />
        <div className="mt-4">
          {loading ? <CircleNotch size={20} className="animate-spin text-[#10B981]" /> : date && !slots.length ? <p className="text-sm text-slate-500">No open slots this day (weekends off, or fully booked).</p> : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((s) => (
                <button key={s.start} onClick={() => book(s)} disabled={booking !== null} data-testid={`slot-${s.label.replace(/[: ]/g, "")}`}
                  className="border border-slate-300 hover:border-[#10B981] hover:bg-[#10B981]/10 rounded-sm text-sm py-2 tabular transition-colors duration-150 disabled:opacity-50">
                  {booking === s.start ? "..." : s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
      <Card testid="my-bookings">
        <h3 className="font-manrope font-bold">Your upcoming sessions</h3>
        {!bookings.length ? <p className="mt-3 text-sm text-slate-500">No sessions booked yet.</p> : (
          <ul className="mt-4 space-y-2">
            {bookings.map((b) => (
              <li key={b.booking_id} className="flex items-center gap-3 border border-slate-200 rounded-sm px-3 py-2.5 text-sm">
                <CalendarBlank size={16} className="text-[#0e9f6f]" />
                {new Date(b.slot_start).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Messages({ messages, reload }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try { await api.post("/client/messages", { body: text }); setText(""); await reload(); }
    catch { toast.error("Could not send."); }
    finally { setSending(false); }
  };
  return (
    <Card testid="messages-panel" className="max-w-2xl">
      <h3 className="font-manrope font-bold">Message Jason</h3>
      <div className="mt-4 space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {!messages.length ? <p className="text-sm text-slate-500">No messages yet. Say hello!</p> :
          messages.map((m) => (
            <div key={m.message_id} data-testid={`client-msg-${m.message_id}`}
              className={`max-w-[80%] rounded-sm px-3.5 py-2 text-sm border ${m.sender === "client" ? "ml-auto bg-[#0F172A] text-[#F8FAFC] border-[#0F172A]" : "bg-slate-100 border-slate-200"}`}>
              {m.body}
            </div>
          ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} data-testid="message-input"
          placeholder="Type a message" className="flex-1 bg-[#F8FAFC] border border-slate-300 rounded-sm h-10 px-3 text-sm focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]" />
        <button onClick={send} disabled={sending} data-testid="message-send"
          className="bg-[#10B981] hover:bg-[#0e9f6f] text-white rounded-sm px-4 flex items-center justify-center transition-colors duration-150 disabled:opacity-60">
          {sending ? <CircleNotch size={16} className="animate-spin" /> : <PaperPlaneRight size={16} />}
        </button>
      </div>
    </Card>
  );
}

function Resources({ resources }) {
  return (
    <Card testid="resources-panel">
      <h3 className="font-manrope font-bold">Guides and resources</h3>
      <p className="mt-1 text-sm text-slate-500">Helpful docs from the FloForge team. How-tos for your new systems.</p>
      {!resources.length ? (
        <div className="mt-5 border border-dashed border-slate-300 rounded-sm p-8 text-center">
          <BookOpen size={22} className="mx-auto text-slate-400" />
          <p className="mt-3 text-sm text-slate-500">Nothing here yet. As we build your systems, guides and walkthroughs will appear here.</p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {resources.map((r) => (
            <a key={r.resource_id} href={r.url} target="_blank" rel="noreferrer" data-testid={`resource-${r.resource_id}`}
              className="border border-slate-200 hover:border-slate-900 rounded-sm p-4 transition-colors duration-150">
              <p className="font-medium text-sm">{r.title}</p>
              {r.description && <p className="mt-1 text-xs text-slate-500">{r.description}</p>}
              <p className="mt-2 text-xs text-slate-400">{fmtDate(r.created_at)}</p>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}

function Growth({ updates }) {
  return (
    <div className="space-y-5 max-w-2xl">
      <Card testid="growth-review">
        <h3 className="font-manrope font-bold">Next quarterly review</h3>
        <p className="mt-2 text-[#0e7a57] font-medium text-sm">{updates.next_quarterly_review ? fmtDate(updates.next_quarterly_review) : "To be scheduled"}</p>
      </Card>
      <Card testid="growth-log">
        <h3 className="font-manrope font-bold">Monthly updates and optimizations</h3>
        {!updates.updates.length ? <p className="mt-3 text-sm text-slate-500">No updates logged yet.</p> : (
          <ul className="mt-4 space-y-4">
            {updates.updates.map((u) => (
              <li key={u.update_id} className="border-l-2 border-[#10B981] pl-4">
                <p className="text-xs text-slate-500">{fmtDate(u.created_at)}</p>
                <p className="text-sm mt-0.5">{u.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
