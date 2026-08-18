import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { UsersThree, CurrencyDollar, Funnel, CalendarBlank, ChatCircleText, Pulse, PlugsConnected, CircleNotch, CaretDown, PaperPlaneRight, Link as LinkIcon, Trash } from "@phosphor-icons/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";
import HubSpotPanel from "@/components/HubSpotPanel";

const money = (c) => `$${((c || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "");
const fmtTime = (s) => (s ? new Date(s).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "");
const STATUS_CYCLE = { pending: "in_progress", in_progress: "complete", complete: "pending" };
const statusLabel = { complete: "Done", in_progress: "In progress", pending: "Pending" };
const LEAD_STATUSES = ["new", "contacted", "converted"];
const PIE_COLORS = ["#0F172A", "#10B981", "#64748b", "#94a3b8"];
const tooltipStyle = { backgroundColor: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: 2, color: "#0F172A", fontSize: 13 };

const Card = ({ children, testid, className = "" }) => (
  <div data-testid={testid} className={`border border-slate-200 rounded-sm bg-[#F8FAFC] p-6 ${className}`}>{children}</div>
);

export default function AdminDashboard() {
  const [tab, setTab] = useState("clients");
  const nav = [
    { id: "clients", label: "Clients", Icon: UsersThree },
    { id: "revenue", label: "Revenue", Icon: CurrencyDollar },
    { id: "leads", label: "Leads", Icon: Funnel },
    { id: "calendar", label: "Calendar", Icon: CalendarBlank },
    { id: "inbox", label: "Messages", Icon: ChatCircleText },
    { id: "activity", label: "Activity", Icon: Pulse },
    { id: "hubspot", label: "HubSpot", Icon: PlugsConnected },
  ];
  return (
    <DashboardShell title="Admin" nav={nav} active={tab} onNavigate={setTab}>
      {tab === "clients" && <Clients />}
      {tab === "revenue" && <Revenue />}
      {tab === "leads" && <Leads />}
      {tab === "calendar" && <Bookings />}
      {tab === "inbox" && <MessagesInbox />}
      {tab === "activity" && <ActivityFeed />}
      {tab === "hubspot" && <HubSpotPanel />}
    </DashboardShell>
  );
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

  if (loading) return <CircleNotch size={22} className="animate-spin text-[#10B981]" />;
  if (!clients.length) return <Card testid="no-clients"><p className="text-sm text-slate-500">No client accounts yet. Clients appear here after they register.</p></Card>;

  return (
    <div className="border border-slate-200 rounded-sm divide-y divide-slate-200">
      {clients.map((c) => (
        <div key={c.user_id} data-testid={`admin-client-${c.user_id}`} className="bg-[#F8FAFC]">
          <button onClick={() => setOpen(open === c.user_id ? null : c.user_id)} data-testid={`client-expand-${c.user_id}`}
            className="w-full flex items-center justify-between text-left px-5 py-4 hover:bg-slate-100 transition-colors duration-150">
            <div>
              <p className="font-manrope font-bold text-sm">{c.name}</p>
              <p className="text-sm text-slate-500">{c.email} · {c.orders.length} order{c.orders.length !== 1 ? "s" : ""}</p>
            </div>
            <CaretDown size={16} className={`text-slate-400 transition-transform duration-150 ${open === c.user_id ? "rotate-180" : ""}`} />
          </button>
          {open === c.user_id && (
            <div className="px-5 pb-6 space-y-5 border-t border-slate-200 pt-5">
              {c.orders.map((o) => (
                <div key={o.session_id}>
                  <p className="font-manrope font-semibold text-sm mb-2">{o.tier_name} · {money(o.amount)}{o.recurring ? " per month" : ""}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {o.deliverables.map((d) => (
                      <button key={d.key} onClick={() => toggleDeliverable(o.session_id, d)} data-testid={`deliverable-${o.session_id}-${d.key}`}
                        className="flex items-center justify-between gap-2 border border-slate-200 hover:border-slate-900 rounded-sm px-3 py-2 text-sm text-left transition-colors duration-150">
                        <span>{d.label}</span>
                        <span className={`text-xs shrink-0 ${d.status === "complete" ? "text-[#0e7a57] font-medium" : d.status === "in_progress" ? "text-slate-700" : "text-slate-400"}`}>
                          {statusLabel[d.status]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!c.orders.length && <p className="text-sm text-slate-500">No paid orders linked to this email yet.</p>}
              <ClientAdminTools client={c} onSaveNotes={saveNotes} onAddUpdate={addUpdate} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ClientAdminTools({ client, onSaveNotes, onAddUpdate }) {
  const [notes, setNotes] = useState(client.notes || "");
  const [review, setReview] = useState(client.next_quarterly_review ? client.next_quarterly_review.split("T")[0] : "");
  const [update, setUpdate] = useState("");
  const inputCls = "w-full bg-[#F8FAFC] border border-slate-300 rounded-sm text-sm px-3 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wider">Internal notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} data-testid={`notes-${client.user_id}`} rows={2}
            className={`${inputCls} mt-1 py-2`} />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wider">Next quarterly review</label>
          <input type="date" value={review} onChange={(e) => setReview(e.target.value)} data-testid={`review-date-${client.user_id}`}
            className={`${inputCls} mt-1 h-9`} />
        </div>
        <button onClick={() => onSaveNotes(client.user_id, notes, review)} data-testid={`save-notes-${client.user_id}`}
          className="border border-slate-300 hover:border-slate-900 text-sm rounded-sm px-4 py-2 transition-colors duration-150">Save notes and review</button>
        <div className="pt-1">
          <label className="text-xs text-slate-500 uppercase tracking-wider">Log a monthly update (Growth)</label>
          <div className="mt-1 flex gap-2">
            <input value={update} onChange={(e) => setUpdate(e.target.value)} placeholder="e.g. Added 2 new automations" data-testid={`growth-input-${client.user_id}`}
              className={`${inputCls} h-9 flex-1`} />
            <button onClick={() => { onAddUpdate(client.user_id, update); setUpdate(""); }} data-testid={`growth-add-${client.user_id}`}
              className="bg-[#10B981] hover:bg-[#0e9f6f] text-white text-sm rounded-sm px-3 transition-colors duration-150">Add</button>
          </div>
        </div>
      </div>
      <ClientResources client={client} inputCls={inputCls} />
    </div>
  );
}

function ClientResources({ client, inputCls }) {
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
      <label className="text-xs text-slate-500 uppercase tracking-wider">Share a resource (client's Resources tab)</label>
      <div className="mt-1 space-y-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title, e.g. How to use your pipeline" data-testid={`resource-title-${client.user_id}`}
          className={`${inputCls} h-9`} />
        <div className="flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://link-to-doc" data-testid={`resource-url-${client.user_id}`}
            className={`${inputCls} h-9 flex-1`} />
          <button onClick={add} data-testid={`resource-add-${client.user_id}`}
            className="bg-[#10B981] hover:bg-[#0e9f6f] text-white text-sm rounded-sm px-3 transition-colors duration-150">Share</button>
        </div>
      </div>
      {resources.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {resources.map((r) => (
            <li key={r.resource_id} className="flex items-center justify-between gap-2 border border-slate-200 rounded-sm px-3 py-2 text-xs">
              <span className="flex items-center gap-2 truncate"><LinkIcon size={12} className="text-[#0e9f6f] shrink-0" /> {r.title}</span>
              <button onClick={() => remove(r.resource_id)} data-testid={`resource-del-${r.resource_id}`} className="text-slate-400 hover:text-red-600 transition-colors duration-150"><Trash size={13} /></button>
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
  if (!rev) return <CircleNotch size={22} className="animate-spin text-[#10B981]" />;
  const monthData = (rev.by_month || []).map((m) => ({ ...m, dollars: m.amount / 100 }));
  const tierData = (rev.by_tier || []).map((t) => ({ ...t, dollars: t.amount / 100 }));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-slate-200 rounded-sm divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-[#F8FAFC]">
        <div className="p-5" data-testid="revenue-total"><p className="text-xs uppercase tracking-wider text-slate-500">Total revenue</p><p className="mt-1 font-manrope font-extrabold text-3xl tabular">{money(rev.total)}</p></div>
        <div className="p-5" data-testid="revenue-count"><p className="text-xs uppercase tracking-wider text-slate-500">Paid transactions</p><p className="mt-1 font-manrope font-extrabold text-3xl tabular">{rev.count}</p></div>
        <div className="p-5" data-testid="revenue-tiers"><p className="text-xs uppercase tracking-wider text-slate-500">Tiers sold</p><p className="mt-1 font-manrope font-extrabold text-3xl tabular">{rev.by_tier.length}</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card testid="revenue-chart" className="lg:col-span-3">
          <h3 className="font-manrope font-bold mb-4">Revenue over time</h3>
          {!monthData.length ? <p className="text-sm text-slate-500">No paid transactions yet.</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="dollars" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card testid="revenue-pie" className="lg:col-span-2">
          <h3 className="font-manrope font-bold mb-4">Revenue by tier</h3>
          {!tierData.length ? <p className="text-sm text-slate-500">No data yet.</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={tierData} dataKey="dollars" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} strokeWidth={0}>
                  {tierData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `$${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#475569" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
      <div className="border border-slate-200 rounded-sm overflow-x-auto" data-testid="revenue-recent">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <th className="py-2.5 px-3">Package</th><th className="py-2.5 px-3">Customer</th><th className="py-2.5 px-3">Date</th><th className="py-2.5 px-3 text-right">Amount</th>
          </tr></thead>
          <tbody>
            {!rev.recent.length ? (
              <tr><td colSpan={4} className="py-4 px-3 text-slate-500">No transactions yet.</td></tr>
            ) : rev.recent.map((r, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2 px-3 font-medium">{r.tier_name}</td>
                <td className="py-2 px-3 text-slate-600">{r.email || ""}</td>
                <td className="py-2 px-3 text-slate-600">{fmtDate(r.date)}</td>
                <td className="py-2 px-3 text-right font-medium tabular">{money(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  if (loading) return <CircleNotch size={22} className="animate-spin text-[#10B981]" />;
  if (!leads.length) return <Card testid="no-leads"><p className="text-sm text-slate-500">No leads yet.</p></Card>;

  const counts = LEAD_STATUSES.map((s) => ({ stage: s, count: leads.filter((l) => (l.status || "new") === s).length }));
  const maxCount = Math.max(...counts.map((c) => c.count), 1);
  const stageColors = { new: "#0F172A", contacted: "#64748b", converted: "#10B981" };

  return (
    <div className="space-y-5">
      <Card testid="lead-funnel">
        <h3 className="font-manrope font-bold mb-4">Pipeline funnel</h3>
        <div className="space-y-2.5">
          {counts.map(({ stage, count }) => (
            <div key={stage} className="flex items-center gap-4">
              <span className="w-24 text-sm text-slate-500 capitalize shrink-0">{stage}</span>
              <div className="flex-1 h-8 bg-slate-100 rounded-sm overflow-hidden">
                <div data-testid={`funnel-bar-${stage}`} className="h-full flex items-center px-3 text-sm font-semibold text-white transition-all duration-500 tabular"
                  style={{ width: `${Math.max((count / maxCount) * 100, count > 0 ? 12 : 3)}%`, backgroundColor: count > 0 ? stageColors[stage] : "#E2E8F0" }}>
                  {count > 0 && count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="border border-slate-200 rounded-sm overflow-x-auto" data-testid="leads-table">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <th className="py-2.5 px-3">Name</th><th className="py-2.5 px-3">Company</th><th className="py-2.5 px-3">Email</th><th className="py-2.5 px-3">Bottleneck</th><th className="py-2.5 px-3">Status</th>
          </tr></thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} data-testid={`lead-row-${l.id}`} className="border-b border-slate-100">
                <td className="py-2 px-3 font-medium">{l.full_name}</td>
                <td className="py-2 px-3 text-slate-600">{l.company_name}</td>
                <td className="py-2 px-3 text-slate-600">{l.email}</td>
                <td className="py-2 px-3 text-slate-600">{l.bottleneck}</td>
                <td className="py-2 px-3">
                  <select value={l.status || "new"} onChange={(e) => setStatus(l.id, e.target.value)} data-testid={`lead-status-${l.id}`}
                    className="bg-[#F8FAFC] border border-slate-300 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-[#10B981]">
                    {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  if (loading) return <CircleNotch size={22} className="animate-spin text-[#10B981]" />;
  const upcoming = bookings.filter((b) => new Date(b.slot_start) >= new Date());
  const byDay = upcoming.reduce((acc, b) => {
    const day = new Date(b.slot_start).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    (acc[day] = acc[day] || []).push(b);
    return acc;
  }, {});
  return (
    <Card testid="bookings-list">
      <h3 className="font-manrope font-bold mb-4">Upcoming training sessions</h3>
      {!upcoming.length ? <p className="text-sm text-slate-500">No upcoming sessions.</p> : (
        <div className="space-y-6">
          {Object.entries(byDay).map(([day, items]) => (
            <div key={day}>
              <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2 border-b border-slate-200 pb-1.5">{day}</p>
              <ul className="divide-y divide-slate-100">
                {items.map((b) => (
                  <li key={b.booking_id} data-testid={`booking-${b.booking_id}`} className="flex items-center gap-4 py-2.5">
                    <span className="font-medium text-sm tabular w-20">{new Date(b.slot_start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
                    <span className="text-sm text-slate-600">{b.user_name} · {b.user_email}</span>
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

  if (loading) return <CircleNotch size={22} className="animate-spin text-[#10B981]" />;
  if (!threads.length) return <Card testid="inbox-empty"><p className="text-sm text-slate-500">No conversations yet. When clients message you, threads appear here.</p></Card>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-1 border border-slate-200 rounded-sm bg-[#F8FAFC] divide-y divide-slate-100" data-testid="inbox-thread-list">
        {threads.map((t) => (
          <button key={t.user_id} onClick={() => openThread(t)} data-testid={`inbox-thread-${t.user_id}`}
            className={`w-full text-left px-4 py-3 transition-colors duration-150 ${selected?.user_id === t.user_id ? "bg-slate-200" : "hover:bg-slate-100"}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-sm truncate">{t.user_name}</p>
              <span className="text-[10px] text-slate-500 shrink-0">{fmtTime(t.last_at)}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 truncate">{t.last_sender === "admin" ? "You: " : ""}{t.last_message}</p>
          </button>
        ))}
      </div>
      <Card testid="inbox-conversation" className="lg:col-span-2 flex flex-col">
        {!selected ? <p className="text-sm text-slate-500 m-auto py-16">Select a conversation to read and reply.</p> : (
          <>
            <div className="border-b border-slate-200 pb-3">
              <p className="font-manrope font-bold text-sm">{selected.user_name}</p>
              <p className="text-xs text-slate-500">{selected.user_email}</p>
            </div>
            <div className="flex-1 mt-4 space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {thread.map((m) => (
                <div key={m.message_id} data-testid={`admin-msg-${m.message_id}`}
                  className={`max-w-[80%] rounded-sm px-3.5 py-2 text-sm border ${m.sender === "admin" ? "ml-auto bg-[#0F172A] text-[#F8FAFC] border-[#0F172A]" : "bg-slate-100 border-slate-200"}`}>
                  {m.body}
                  <p className={`mt-1 text-[10px] ${m.sender === "admin" ? "text-slate-400" : "text-slate-500"}`}>{fmtTime(m.created_at)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMsg()} data-testid="inbox-reply-input"
                placeholder={`Reply to ${selected.user_name}`}
                className="flex-1 bg-[#F8FAFC] border border-slate-300 rounded-sm h-10 px-3 text-sm focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]" />
              <button onClick={sendMsg} data-testid="inbox-reply-send"
                className="bg-[#10B981] hover:bg-[#0e9f6f] text-white rounded-sm px-4 transition-colors duration-150"><PaperPlaneRight size={16} /></button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Activity Feed ---------------- */
const ACTIVITY_META = {
  lead: { Icon: Funnel, color: "#0F172A" },
  payment: { Icon: CurrencyDollar, color: "#10B981" },
  booking: { Icon: CalendarBlank, color: "#64748b" },
  message: { Icon: ChatCircleText, color: "#475569" },
};

function ActivityFeed() {
  const [events, setEvents] = useState(null);
  useEffect(() => { api.get("/admin/activity").then(({ data }) => setEvents(data)).catch(() => toast.error("Could not load activity.")); }, []);
  if (!events) return <CircleNotch size={22} className="animate-spin text-[#10B981]" />;
  if (!events.length) return <Card testid="activity-empty"><p className="text-sm text-slate-500">No activity yet.</p></Card>;
  return (
    <Card testid="activity-feed" className="max-w-3xl">
      <h3 className="font-manrope font-bold mb-4">Recent activity</h3>
      <ul>
        {events.map((e, i) => {
          const meta = ACTIVITY_META[e.type] || ACTIVITY_META.message;
          return (
            <li key={i} data-testid={`activity-item-${i}`} className="relative flex gap-4 pb-5 last:pb-0">
              {i < events.length - 1 && <span className="absolute left-[13px] top-8 bottom-0 w-px bg-slate-200" />}
              <span className="mt-0.5 h-7 w-7 rounded-sm border flex items-center justify-center shrink-0"
                style={{ borderColor: meta.color, color: meta.color }}>
                <meta.Icon size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-sm break-words">{e.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{fmtTime(e.at)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
