import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, Clock, Calendar, MessageSquare, Package, TrendingUp, Send, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/DashboardHeader";
import { Toaster } from "@/components/ui/sonner";

const money = (c, cur = "usd") => `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—");
const StatusIcon = ({ s }) => s === "complete" ? <CheckCircle2 size={16} className="text-[#10B981]" /> : s === "in_progress" ? <Clock size={16} className="text-[#a78bfa]" /> : <Circle size={16} className="text-slate-600" />;
const statusLabel = { complete: "Done", in_progress: "In progress", pending: "Pending" };

export default function ClientDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [updates, setUpdates] = useState({ updates: [], next_quarterly_review: null });

  const load = useCallback(async () => {
    try {
      const [o, b, m, u] = await Promise.all([
        api.get("/client/orders"), api.get("/client/bookings"),
        api.get("/client/messages"), api.get("/client/updates"),
      ]);
      setOrders(o.data); setBookings(b.data); setMessages(m.data); setUpdates(u.data);
    } catch { toast.error("Could not load your dashboard."); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const hasGrowth = orders.some((o) => o.recurring);
  const tabs = [
    { id: "overview", label: "Overview", Icon: Package },
    { id: "training", label: "Book Training", Icon: Calendar },
    { id: "messages", label: "Messages", Icon: MessageSquare },
    ...(hasGrowth ? [{ id: "growth", label: "Growth Log", Icon: TrendingUp }] : []),
  ];

  return (
    <main className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <DashboardHeader title="Client Dashboard" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <h1 className="font-manrope font-extrabold text-3xl text-white tracking-tight">Welcome, {user?.name?.split(" ")[0]}</h1>
        <p className="mt-1.5 text-slate-400">Track your setup, book training, and stay in touch.</p>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10">
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} data-testid={`client-tab-${id}`}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === id ? "border-[#5B21B6] text-white" : "border-transparent text-slate-400 hover:text-white"}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "overview" && <Overview orders={orders} />}
          {tab === "training" && <Training bookings={bookings} reload={load} />}
          {tab === "messages" && <Messages messages={messages} reload={load} />}
          {tab === "growth" && <Growth updates={updates} />}
        </div>
      </div>
      <Toaster position="top-center" />
    </main>
  );
}

function Card({ children, testid }) {
  return <div data-testid={testid} className="rounded-[22px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">{children}</div>;
}

function Overview({ orders }) {
  if (!orders.length)
    return <Card testid="no-orders"><p className="text-slate-400">No orders yet. Once you purchase a package it will appear here with your deliverables checklist.</p></Card>;
  return (
    <div className="space-y-6">
      {orders.map((o) => {
        const done = o.deliverables.filter((d) => d.status === "complete").length;
        return (
          <Card key={o.session_id} testid={`order-${o.session_id}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-manrope font-bold text-xl text-white">{o.tier_name}</h3>
                <p className="mt-1 text-sm text-slate-400">Purchased {fmtDate(o.purchase_date)} · {money(o.amount, o.currency)}{o.recurring ? "/mo" : ""}</p>
              </div>
              <span className="rounded-full bg-[#10B981]/15 border border-[#10B981]/30 px-3 py-1 text-xs font-medium text-[#6ee7b7]">{done}/{o.deliverables.length} delivered</span>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {o.deliverables.map((d) => (
                <div key={d.key} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
                  <span className="flex items-center gap-3 text-sm text-slate-200"><StatusIcon s={d.status} /> {d.label}</span>
                  <span className="text-xs text-slate-500">{statusLabel[d.status]}</span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card testid="booking-widget">
        <h3 className="font-manrope font-bold text-lg text-white">Book a training session</h3>
        <p className="mt-1 text-sm text-slate-400">Mon–Fri, 9:00 AM–4:00 PM (Arizona time). 30-min sessions.</p>
        <input type="date" min={today} value={date} onChange={(e) => loadSlots(e.target.value)} data-testid="booking-date"
          className="mt-4 bg-black/20 border border-white/10 text-white rounded-lg h-11 px-4 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] [color-scheme:dark]" />
        <div className="mt-5">
          {loading ? <Loader2 className="animate-spin text-[#a78bfa]" /> : date && !slots.length ? <p className="text-sm text-slate-500">No open slots this day (weekends off, or fully booked).</p> : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((s) => (
                <button key={s.start} onClick={() => book(s)} disabled={booking !== null} data-testid={`slot-${s.label.replace(/[: ]/g, "")}`}
                  className="rounded-lg border border-white/15 bg-white/[0.03] hover:border-[#5B21B6] hover:bg-[#5B21B6]/20 text-sm text-white py-2 transition-colors disabled:opacity-50">
                  {booking === s.start ? "…" : s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
      <Card testid="my-bookings">
        <h3 className="font-manrope font-bold text-lg text-white">Your upcoming sessions</h3>
        {!bookings.length ? <p className="mt-4 text-sm text-slate-400">No sessions booked yet.</p> : (
          <ul className="mt-4 space-y-3">
            {bookings.map((b) => (
              <li key={b.booking_id} className="flex items-center gap-3 rounded-lg border border-[#10B981]/20 bg-[#10B981]/5 px-4 py-3">
                <Calendar size={16} className="text-[#10B981]" />
                <span className="text-sm text-slate-200">{new Date(b.slot_start).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
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
    <Card testid="messages-panel">
      <h3 className="font-manrope font-bold text-lg text-white">Message Jason</h3>
      <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
        {!messages.length ? <p className="text-sm text-slate-400">No messages yet. Say hello!</p> :
          messages.map((m) => (
            <div key={m.message_id} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.sender === "client" ? "ml-auto bg-[#5B21B6] text-white" : "bg-white/[0.06] text-slate-200"}`}>
              {m.body}
            </div>
          ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} data-testid="message-input"
          placeholder="Type a message…" className="flex-1 bg-black/20 border border-white/10 text-white rounded-lg h-11 px-4 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
        <button onClick={send} disabled={sending} data-testid="message-send" className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-lg px-4 flex items-center justify-center disabled:opacity-60">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </Card>
  );
}

function Growth({ updates }) {
  return (
    <div className="space-y-6">
      <Card testid="growth-review">
        <h3 className="font-manrope font-bold text-lg text-white">Next quarterly review</h3>
        <p className="mt-2 text-[#6ee7b7] font-medium">{updates.next_quarterly_review ? fmtDate(updates.next_quarterly_review) : "To be scheduled"}</p>
      </Card>
      <Card testid="growth-log">
        <h3 className="font-manrope font-bold text-lg text-white">Monthly updates & optimizations</h3>
        {!updates.updates.length ? <p className="mt-4 text-sm text-slate-400">No updates logged yet.</p> : (
          <ul className="mt-4 space-y-4">
            {updates.updates.map((u) => (
              <li key={u.update_id} className="border-l-2 border-[#5B21B6] pl-4">
                <p className="text-xs text-slate-500">{fmtDate(u.created_at)}</p>
                <p className="text-sm text-slate-200 mt-0.5">{u.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
