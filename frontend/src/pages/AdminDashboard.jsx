import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Users, DollarSign, Inbox, Calendar, Loader2, ChevronDown, Send } from "lucide-react";
import api from "@/lib/api";
import DashboardHeader from "@/components/DashboardHeader";
import { Toaster } from "@/components/ui/sonner";

const money = (c) => `$${((c || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");
const STATUS_CYCLE = { pending: "in_progress", in_progress: "complete", complete: "pending" };
const statusLabel = { complete: "✅ Done", in_progress: "🔨 In progress", pending: "⬜ Pending" };
const LEAD_STATUSES = ["new", "contacted", "converted"];

export default function AdminDashboard() {
  const [tab, setTab] = useState("clients");
  const tabs = [
    { id: "clients", label: "Clients", Icon: Users },
    { id: "revenue", label: "Revenue", Icon: DollarSign },
    { id: "leads", label: "Leads", Icon: Inbox },
    { id: "bookings", label: "Bookings", Icon: Calendar },
  ];
  return (
    <main className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <DashboardHeader title="Admin" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <h1 className="font-manrope font-extrabold text-3xl text-white tracking-tight">Command Center</h1>
        <p className="mt-1.5 text-slate-400">Manage clients, revenue, leads, and training in one place.</p>
        <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10">
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} data-testid={`admin-tab-${id}`}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === id ? "border-[#5B21B6] text-white" : "border-transparent text-slate-400 hover:text-white"}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
        <div className="mt-8">
          {tab === "clients" && <Clients />}
          {tab === "revenue" && <Revenue />}
          {tab === "leads" && <Leads />}
          {tab === "bookings" && <Bookings />}
        </div>
      </div>
      <Toaster position="top-center" />
    </main>
  );
}

function Card({ children, testid, className = "" }) {
  return <div data-testid={testid} className={`rounded-[22px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] ${className}`}>{children}</div>;
}

function Clients() {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { const { data } = await api.get("/admin/clients"); setClients(data); }
    catch { toast.error("Could not load clients."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggleDeliverable = async (session_id, d) => {
    try {
      await api.patch("/admin/deliverable", { session_id, key: d.key, status: STATUS_CYCLE[d.status] });
      await load();
    } catch { toast.error("Update failed."); }
  };
  const saveNotes = async (uid, notes, review) => {
    try { await api.patch(`/admin/clients/${uid}`, { notes, next_quarterly_review: review || null }); toast.success("Saved."); await load(); }
    catch { toast.error("Save failed."); }
  };
  const addUpdate = async (uid, body) => {
    if (!body.trim()) return;
    try { await api.post("/admin/updates", { user_id: uid, body }); toast.success("Update logged."); }
    catch { toast.error("Failed."); }
  };

  if (loading) return <Loader2 className="animate-spin text-[#a78bfa]" />;
  if (!clients.length) return <Card testid="no-clients"><p className="text-slate-400">No client accounts yet. Clients appear here after they register.</p></Card>;

  return (
    <div className="space-y-4">
      {clients.map((c) => (
        <Card key={c.user_id} testid={`admin-client-${c.user_id}`}>
          <button onClick={() => setOpen(open === c.user_id ? null : c.user_id)} className="w-full flex items-center justify-between text-left">
            <div>
              <p className="font-manrope font-bold text-white">{c.name}</p>
              <p className="text-sm text-slate-400">{c.email} · {c.orders.length} order{c.orders.length !== 1 ? "s" : ""}</p>
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform ${open === c.user_id ? "rotate-180" : ""}`} />
          </button>
          {open === c.user_id && (
            <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
              {c.orders.map((o) => (
                <div key={o.session_id}>
                  <p className="font-manrope font-semibold text-white text-sm mb-2">{o.tier_name} · {money(o.amount)}{o.recurring ? "/mo" : ""}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {o.deliverables.map((d) => (
                      <button key={d.key} onClick={() => toggleDeliverable(o.session_id, d)} data-testid={`deliverable-${o.session_id}-${d.key}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.02] hover:border-[#5B21B6]/50 px-3 py-2 text-sm text-slate-200 text-left transition-colors">
                        <span>{d.label}</span><span className="text-xs shrink-0">{statusLabel[d.status]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!c.orders.length && <p className="text-sm text-slate-500">No paid orders linked to this email yet.</p>}
              <ClientAdminTools client={c} onSaveNotes={saveNotes} onAddUpdate={addUpdate} />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function ClientAdminTools({ client, onSaveNotes, onAddUpdate }) {
  const [notes, setNotes] = useState(client.notes || "");
  const [review, setReview] = useState(client.next_quarterly_review ? client.next_quarterly_review.split("T")[0] : "");
  const [update, setUpdate] = useState("");
  const [thread, setThread] = useState([]);
  const [msg, setMsg] = useState("");

  const loadThread = useCallback(async () => {
    try { const { data } = await api.get(`/admin/messages?user_id=${client.user_id}`); setThread(data); } catch {}
  }, [client.user_id]);
  useEffect(() => { loadThread(); }, [loadThread]);

  const sendMsg = async () => {
    if (!msg.trim()) return;
    try { await api.post("/admin/messages", { user_id: client.user_id, body: msg }); setMsg(""); await loadThread(); }
    catch { toast.error("Failed."); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400">Internal notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} data-testid={`notes-${client.user_id}`} rows={2}
            className="mt-1 w-full bg-black/20 border border-white/10 text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Next quarterly review</label>
          <input type="date" value={review} onChange={(e) => setReview(e.target.value)}
            className="mt-1 w-full bg-black/20 border border-white/10 text-white rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] [color-scheme:dark]" />
        </div>
        <button onClick={() => onSaveNotes(client.user_id, notes, review)} data-testid={`save-notes-${client.user_id}`} className="bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg px-4 py-2">Save notes & review</button>
        <div className="pt-2">
          <label className="text-xs text-slate-400">Log a monthly update (Growth)</label>
          <div className="mt-1 flex gap-2">
            <input value={update} onChange={(e) => setUpdate(e.target.value)} placeholder="e.g. Added 2 new automations…"
              className="flex-1 bg-black/20 border border-white/10 text-white rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
            <button onClick={() => { onAddUpdate(client.user_id, update); setUpdate(""); }} className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-sm rounded-lg px-3">Add</button>
          </div>
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-400">Conversation</label>
        <div className="mt-1 space-y-2 max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-3">
          {!thread.length ? <p className="text-xs text-slate-500">No messages.</p> : thread.map((m) => (
            <div key={m.message_id} className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs ${m.sender === "admin" ? "ml-auto bg-[#5B21B6] text-white" : "bg-white/10 text-slate-200"}`}>{m.body}</div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMsg()} placeholder="Reply…"
            className="flex-1 bg-black/20 border border-white/10 text-white rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
          <button onClick={sendMsg} className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-lg px-3"><Send size={15} /></button>
        </div>
      </div>
    </div>
  );
}

function Revenue() {
  const [rev, setRev] = useState(null);
  useEffect(() => { api.get("/admin/revenue").then(({ data }) => setRev(data)).catch(() => toast.error("Could not load revenue.")); }, []);
  if (!rev) return <Loader2 className="animate-spin text-[#a78bfa]" />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card testid="revenue-total"><p className="text-sm text-slate-400">Total revenue</p><p className="mt-1 font-manrope font-extrabold text-3xl text-white">{money(rev.total)}</p></Card>
        <Card testid="revenue-count"><p className="text-sm text-slate-400">Paid transactions</p><p className="mt-1 font-manrope font-extrabold text-3xl text-white">{rev.count}</p></Card>
        <Card testid="revenue-tiers"><p className="text-sm text-slate-400">Tiers sold</p><p className="mt-1 font-manrope font-extrabold text-3xl text-white">{rev.by_tier.length}</p></Card>
      </div>
      <Card testid="revenue-by-tier">
        <h3 className="font-manrope font-bold text-lg text-white mb-4">Revenue by tier</h3>
        {rev.by_tier.map((t) => (
          <div key={t.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-sm text-slate-200">{t.name}</span><span className="font-semibold text-[#6ee7b7]">{money(t.amount)}</span>
          </div>
        ))}
      </Card>
      <Card testid="revenue-recent">
        <h3 className="font-manrope font-bold text-lg text-white mb-4">Recent transactions</h3>
        {!rev.recent.length ? <p className="text-sm text-slate-400">No transactions yet.</p> : rev.recent.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
            <div><p className="text-sm text-slate-200">{r.tier_name}</p><p className="text-xs text-slate-500">{r.email || "—"} · {fmtDate(r.date)}</p></div>
            <span className="font-semibold text-white">{money(r.amount)}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { const { data } = await api.get("/admin/leads"); setLeads(data); } catch { toast.error("Could not load leads."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const setStatus = async (id, status) => {
    try { await api.patch(`/admin/leads/${id}`, { status }); await load(); } catch { toast.error("Update failed."); }
  };
  if (loading) return <Loader2 className="animate-spin text-[#a78bfa]" />;
  if (!leads.length) return <Card testid="no-leads"><p className="text-slate-400">No leads yet.</p></Card>;
  return (
    <Card testid="leads-table" className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-slate-400 border-b border-white/10">
          <th className="py-3 pr-4">Name</th><th className="py-3 pr-4">Company</th><th className="py-3 pr-4">Email</th><th className="py-3 pr-4">Bottleneck</th><th className="py-3">Status</th>
        </tr></thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} data-testid={`lead-row-${l.id}`} className="border-b border-white/5">
              <td className="py-3 pr-4 text-white">{l.full_name}</td>
              <td className="py-3 pr-4 text-slate-300">{l.company_name}</td>
              <td className="py-3 pr-4 text-slate-300">{l.email}</td>
              <td className="py-3 pr-4 text-slate-300">{l.bottleneck}</td>
              <td className="py-3">
                <select value={l.status || "new"} onChange={(e) => setStatus(l.id, e.target.value)} data-testid={`lead-status-${l.id}`}
                  className="bg-black/30 border border-white/10 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B21B6] [color-scheme:dark]">
                  {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/admin/bookings").then(({ data }) => setBookings(data)).catch(() => toast.error("Could not load bookings.")).finally(() => setLoading(false));
  }, []);
  if (loading) return <Loader2 className="animate-spin text-[#a78bfa]" />;
  const upcoming = bookings.filter((b) => new Date(b.slot_start) >= new Date());
  return (
    <Card testid="bookings-list">
      <h3 className="font-manrope font-bold text-lg text-white mb-4">Upcoming training sessions</h3>
      {!upcoming.length ? <p className="text-sm text-slate-400">No upcoming sessions.</p> : (
        <ul className="space-y-3">
          {upcoming.map((b) => (
            <li key={b.booking_id} data-testid={`booking-${b.booking_id}`} className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
              <Calendar size={18} className="text-[#10B981]" />
              <div><p className="text-sm text-white">{new Date(b.slot_start).toLocaleString(undefined, { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
              <p className="text-xs text-slate-400">{b.user_name} · {b.user_email}</p></div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
