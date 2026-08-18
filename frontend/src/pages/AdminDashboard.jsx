import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Users, DollarSign, Inbox, Calendar, Loader2, ChevronDown, Send, MessageSquare, Activity, Link2, Trash2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "@/lib/api";
import DashboardHeader from "@/components/DashboardHeader";
import { Toaster } from "@/components/ui/sonner";

const money = (c) => `$${((c || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");
const fmtTime = (s) => (s ? new Date(s).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—");
const STATUS_CYCLE = { pending: "in_progress", in_progress: "complete", complete: "pending" };
const statusLabel = { complete: "✅ Done", in_progress: "🔨 In progress", pending: "⬜ Pending" };
const LEAD_STATUSES = ["new", "contacted", "converted"];
const PIE_COLORS = ["#8b5cf6", "#10B981", "#6366F1", "#f59e0b"];
const tooltipStyle = { backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F8FAFC", fontSize: 13 };

export default function AdminDashboard() {
  const [tab, setTab] = useState("clients");
  const tabs = [
    { id: "clients", label: "Clients", Icon: Users },
    { id: "revenue", label: "Revenue", Icon: DollarSign },
    { id: "leads", label: "Leads", Icon: Inbox },
    { id: "calendar", label: "Calendar", Icon: Calendar },
    { id: "inbox", label: "Messages", Icon: MessageSquare },
    { id: "activity", label: "Activity", Icon: Activity },
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
          {tab === "calendar" && <Bookings />}
          {tab === "inbox" && <MessagesInbox />}
          {tab === "activity" && <ActivityFeed />}
        </div>
      </div>
      <Toaster position="top-center" />
    </main>
  );
}

function Card({ children, testid, className = "" }) {
  return <div data-testid={testid} className={`rounded-[22px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] ${className}`}>{children}</div>;
}

/* ---------------- Clients ---------------- */
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
          <button onClick={() => setOpen(open === c.user_id ? null : c.user_id)} data-testid={`client-expand-${c.user_id}`} className="w-full flex items-center justify-between text-left">
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
          <input type="date" value={review} onChange={(e) => setReview(e.target.value)} data-testid={`review-date-${client.user_id}`}
            className="mt-1 w-full bg-black/20 border border-white/10 text-white rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] [color-scheme:dark]" />
        </div>
        <button onClick={() => onSaveNotes(client.user_id, notes, review)} data-testid={`save-notes-${client.user_id}`} className="bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg px-4 py-2">Save notes & review</button>
        <div className="pt-2">
          <label className="text-xs text-slate-400">Log a monthly update (Growth)</label>
          <div className="mt-1 flex gap-2">
            <input value={update} onChange={(e) => setUpdate(e.target.value)} placeholder="e.g. Added 2 new automations…" data-testid={`growth-input-${client.user_id}`}
              className="flex-1 bg-black/20 border border-white/10 text-white rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
            <button onClick={() => { onAddUpdate(client.user_id, update); setUpdate(""); }} data-testid={`growth-add-${client.user_id}`} className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-sm rounded-lg px-3">Add</button>
          </div>
        </div>
      </div>
      <ClientResources client={client} />
    </div>
  );
}

function ClientResources({ client }) {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const load = useCallback(async () => {
    try { const { data } = await api.get(`/admin/resources?user_id=${client.user_id}`); setResources(data); } catch {}
  }, [client.user_id]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!title.trim() || !url.trim()) return;
    try {
      await api.post("/admin/resources", { user_id: client.user_id, title, url });
      setTitle(""); setUrl(""); toast.success("Resource shared."); await load();
    } catch { toast.error("Failed."); }
  };
  const remove = async (id) => {
    try { await api.delete(`/admin/resources/${id}`); await load(); } catch { toast.error("Failed."); }
  };

  return (
    <div>
      <label className="text-xs text-slate-400">Share a resource (visible in client's Resources tab)</label>
      <div className="mt-1 space-y-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title, e.g. How to use your pipeline" data-testid={`resource-title-${client.user_id}`}
          className="w-full bg-black/20 border border-white/10 text-white rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
        <div className="flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://link-to-doc…" data-testid={`resource-url-${client.user_id}`}
            className="flex-1 bg-black/20 border border-white/10 text-white rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
          <button onClick={add} data-testid={`resource-add-${client.user_id}`} className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-sm rounded-lg px-3">Share</button>
        </div>
      </div>
      {resources.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {resources.map((r) => (
            <li key={r.resource_id} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-300">
              <span className="flex items-center gap-2 truncate"><Link2 size={12} className="text-[#a78bfa] shrink-0" /> {r.title}</span>
              <button onClick={() => remove(r.resource_id)} data-testid={`resource-del-${r.resource_id}`} className="text-slate-500 hover:text-red-400"><Trash2 size={13} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Revenue ---------------- */
function Revenue() {
  const [rev, setRev] = useState(null);
  useEffect(() => { api.get("/admin/revenue").then(({ data }) => setRev(data)).catch(() => toast.error("Could not load revenue.")); }, []);
  if (!rev) return <Loader2 className="animate-spin text-[#a78bfa]" />;
  const monthData = (rev.by_month || []).map((m) => ({ ...m, dollars: m.amount / 100 }));
  const tierData = (rev.by_tier || []).map((t) => ({ ...t, dollars: t.amount / 100 }));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card testid="revenue-total"><p className="text-sm text-slate-400">Total revenue</p><p className="mt-1 font-manrope font-extrabold text-3xl text-white">{money(rev.total)}</p></Card>
        <Card testid="revenue-count"><p className="text-sm text-slate-400">Paid transactions</p><p className="mt-1 font-manrope font-extrabold text-3xl text-white">{rev.count}</p></Card>
        <Card testid="revenue-tiers"><p className="text-sm text-slate-400">Tiers sold</p><p className="mt-1 font-manrope font-extrabold text-3xl text-white">{rev.by_tier.length}</p></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card testid="revenue-chart" className="lg:col-span-3">
          <h3 className="font-manrope font-bold text-lg text-white mb-4">Revenue over time</h3>
          {!monthData.length ? <p className="text-sm text-slate-400">No paid transactions yet.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="dollars" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card testid="revenue-pie" className="lg:col-span-2">
          <h3 className="font-manrope font-bold text-lg text-white mb-4">Revenue by tier</h3>
          {!tierData.length ? <p className="text-sm text-slate-400">No data yet.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={tierData} dataKey="dollars" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                  {tierData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `$${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
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

/* ---------------- Leads ---------------- */
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

  const counts = LEAD_STATUSES.map((s) => ({ stage: s, count: leads.filter((l) => (l.status || "new") === s).length }));
  const maxCount = Math.max(...counts.map((c) => c.count), 1);
  const stageColors = { new: "#8b5cf6", contacted: "#6366F1", converted: "#10B981" };

  return (
    <div className="space-y-6">
      <Card testid="lead-funnel">
        <h3 className="font-manrope font-bold text-lg text-white mb-5">Pipeline funnel</h3>
        <div className="space-y-3">
          {counts.map(({ stage, count }) => (
            <div key={stage} className="flex items-center gap-4">
              <span className="w-24 text-sm text-slate-400 capitalize shrink-0">{stage}</span>
              <div className="flex-1 h-9 rounded-lg bg-white/[0.04] overflow-hidden">
                <div data-testid={`funnel-bar-${stage}`} className="h-full rounded-lg flex items-center px-3 text-sm font-semibold text-white transition-all duration-700"
                  style={{ width: `${Math.max((count / maxCount) * 100, count > 0 ? 12 : 4)}%`, backgroundColor: count > 0 ? stageColors[stage] : "rgba(255,255,255,0.06)" }}>
                  {count > 0 && count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
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
    </div>
  );
}

/* ---------------- Bookings / Calendar ---------------- */
function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/admin/bookings").then(({ data }) => setBookings(data)).catch(() => toast.error("Could not load bookings.")).finally(() => setLoading(false));
  }, []);
  if (loading) return <Loader2 className="animate-spin text-[#a78bfa]" />;
  const upcoming = bookings.filter((b) => new Date(b.slot_start) >= new Date());
  const byDay = upcoming.reduce((acc, b) => {
    const day = new Date(b.slot_start).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    (acc[day] = acc[day] || []).push(b);
    return acc;
  }, {});
  return (
    <Card testid="bookings-list">
      <h3 className="font-manrope font-bold text-lg text-white mb-4">Upcoming training sessions</h3>
      {!upcoming.length ? <p className="text-sm text-slate-400">No upcoming sessions.</p> : (
        <div className="space-y-6">
          {Object.entries(byDay).map(([day, items]) => (
            <div key={day}>
              <p className="text-xs font-semibold tracking-widest text-[#a78bfa] uppercase mb-2">{day}</p>
              <ul className="space-y-2">
                {items.map((b) => (
                  <li key={b.booking_id} data-testid={`booking-${b.booking_id}`} className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
                    <Calendar size={18} className="text-[#10B981]" />
                    <div>
                      <p className="text-sm text-white">{new Date(b.slot_start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</p>
                      <p className="text-xs text-slate-400">{b.user_name} · {b.user_email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ---------------- Messages Inbox ---------------- */
function MessagesInbox() {
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const loadThreads = useCallback(async () => {
    try { const { data } = await api.get("/admin/inbox"); setThreads(data); }
    catch { toast.error("Could not load inbox."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadThreads(); }, [loadThreads]);

  const openThread = useCallback(async (t) => {
    setSelected(t);
    try { const { data } = await api.get(`/admin/messages?user_id=${t.user_id}`); setThread(data); } catch {}
  }, []);

  const sendMsg = async () => {
    if (!msg.trim() || !selected) return;
    try {
      await api.post("/admin/messages", { user_id: selected.user_id, body: msg });
      setMsg("");
      const { data } = await api.get(`/admin/messages?user_id=${selected.user_id}`);
      setThread(data);
      loadThreads();
    } catch { toast.error("Failed to send."); }
  };

  if (loading) return <Loader2 className="animate-spin text-[#a78bfa]" />;
  if (!threads.length) return <Card testid="inbox-empty"><p className="text-slate-400">No conversations yet. When clients message you, threads appear here.</p></Card>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card testid="inbox-thread-list" className="lg:col-span-1 !p-3">
        {threads.map((t) => (
          <button key={t.user_id} onClick={() => openThread(t)} data-testid={`inbox-thread-${t.user_id}`}
            className={`w-full text-left rounded-xl px-4 py-3 transition-colors ${selected?.user_id === t.user_id ? "bg-[#5B21B6]/25 border border-[#5B21B6]/40" : "border border-transparent hover:bg-white/[0.04]"}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-white text-sm truncate">{t.user_name}</p>
              <span className="text-[10px] text-slate-500 shrink-0">{fmtTime(t.last_at)}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400 truncate">{t.last_sender === "admin" ? "You: " : ""}{t.last_message}</p>
          </button>
        ))}
      </Card>
      <Card testid="inbox-conversation" className="lg:col-span-2 flex flex-col">
        {!selected ? <p className="text-sm text-slate-400 m-auto py-16">Select a conversation to read and reply.</p> : (
          <>
            <div className="border-b border-white/10 pb-3">
              <p className="font-manrope font-bold text-white">{selected.user_name}</p>
              <p className="text-xs text-slate-400">{selected.user_email}</p>
            </div>
            <div className="flex-1 mt-4 space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {thread.map((m) => (
                <div key={m.message_id} data-testid={`admin-msg-${m.message_id}`} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.sender === "admin" ? "ml-auto bg-[#5B21B6] text-white" : "bg-white/[0.06] text-slate-200"}`}>
                  {m.body}
                  <p className={`mt-1 text-[10px] ${m.sender === "admin" ? "text-white/50" : "text-slate-500"}`}>{fmtTime(m.created_at)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMsg()} data-testid="inbox-reply-input"
                placeholder={`Reply to ${selected.user_name}…`} className="flex-1 bg-black/20 border border-white/10 text-white rounded-lg h-11 px-4 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
              <button onClick={sendMsg} data-testid="inbox-reply-send" className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-lg px-4"><Send size={16} /></button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Activity Feed ---------------- */
const ACTIVITY_META = {
  lead: { Icon: Inbox, color: "#8b5cf6" },
  payment: { Icon: DollarSign, color: "#10B981" },
  booking: { Icon: Calendar, color: "#6366F1" },
  message: { Icon: MessageSquare, color: "#f59e0b" },
};

function ActivityFeed() {
  const [events, setEvents] = useState(null);
  useEffect(() => { api.get("/admin/activity").then(({ data }) => setEvents(data)).catch(() => toast.error("Could not load activity.")); }, []);
  if (!events) return <Loader2 className="animate-spin text-[#a78bfa]" />;
  if (!events.length) return <Card testid="activity-empty"><p className="text-slate-400">No activity yet.</p></Card>;
  return (
    <Card testid="activity-feed">
      <h3 className="font-manrope font-bold text-lg text-white mb-5">Recent activity</h3>
      <ul>
        {events.map((e, i) => {
          const meta = ACTIVITY_META[e.type] || ACTIVITY_META.message;
          return (
            <li key={i} data-testid={`activity-item-${i}`} className="relative flex gap-4 pb-5 last:pb-0">
              {i < events.length - 1 && <span className="absolute left-[15px] top-8 bottom-0 w-px bg-white/10" />}
              <span className="mt-0.5 h-8 w-8 rounded-full border flex items-center justify-center shrink-0" style={{ borderColor: `${meta.color}55`, backgroundColor: `${meta.color}1f` }}>
                <meta.Icon size={14} style={{ color: meta.color }} />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-slate-200 break-words">{e.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{fmtTime(e.at)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
