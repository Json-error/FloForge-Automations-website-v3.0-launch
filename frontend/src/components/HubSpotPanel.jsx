import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { CircleNotch, Plugs, ArrowSquareOut, UsersThree, Handshake } from "@phosphor-icons/react";
import api from "@/lib/api";

const money = (v) => (v ? `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "$0");

export default function HubSpotPanel() {
  const [status, setStatus] = useState(null);
  const [tab, setTab] = useState("contacts");
  const [contacts, setContacts] = useState(null);
  const [deals, setDeals] = useState(null);

  const loadStatus = useCallback(async () => {
    try { const { data } = await api.get("/hubspot/status"); setStatus(data); }
    catch { setStatus({ configured: false, connected: false }); }
  }, []);
  useEffect(() => { loadStatus(); }, [loadStatus]);

  useEffect(() => {
    if (!status?.connected) return;
    api.get("/hubspot/contacts").then(({ data }) => setContacts(data.results || [])).catch(() => setContacts([]));
    api.get("/hubspot/deals").then(({ data }) => setDeals(data.results || [])).catch(() => setDeals([]));
  }, [status?.connected]);

  const connect = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/hubspot/oauth/start?mode=connect`;
  };
  const disconnect = async () => {
    try { await api.post("/hubspot/disconnect"); toast.success("HubSpot disconnected."); setContacts(null); setDeals(null); await loadStatus(); }
    catch { toast.error("Could not disconnect."); }
  };

  if (!status) return <CircleNotch size={22} className="animate-spin text-[#10B981]" />;

  if (!status.configured)
    return (
      <div className="border border-slate-200 rounded-sm bg-[#F8FAFC] p-8 text-center" data-testid="hubspot-not-configured">
        <Plugs size={26} className="mx-auto text-slate-400" />
        <h3 className="mt-3 font-manrope font-bold">HubSpot integration pending</h3>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
          The HubSpot app credentials have not been added yet. Once configured, you can connect your account here to view your customers and deals.
        </p>
      </div>
    );

  if (!status.connected)
    return (
      <div className="border border-slate-200 rounded-sm bg-[#F8FAFC] p-8 text-center" data-testid="hubspot-connect-panel">
        <Plugs size={26} className="mx-auto text-slate-500" />
        <h3 className="mt-3 font-manrope font-bold">Connect your HubSpot account</h3>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
          Link your HubSpot account to see your CRM contacts and deals right here.
        </p>
        <button onClick={connect} data-testid="hubspot-connect-btn"
          className="mt-5 inline-flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white font-manrope font-semibold px-5 py-2.5 rounded-sm transition-colors duration-150">
          <ArrowSquareOut size={16} /> Connect HubSpot
        </button>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 rounded-sm bg-[#F8FAFC] px-5 py-3" data-testid="hubspot-connected-bar">
        <p className="text-sm text-slate-700">
          Connected as <span className="font-medium">{status.hub_email || "HubSpot user"}</span>
          {status.hub_id && <span className="text-slate-500"> (hub {status.hub_id})</span>}
        </p>
        <button onClick={disconnect} data-testid="hubspot-disconnect-btn"
          className="text-sm text-slate-600 border border-slate-300 hover:border-slate-900 rounded-sm px-3 py-1.5 transition-colors duration-150">
          Disconnect
        </button>
      </div>
      <div className="flex gap-1 border-b border-slate-200">
        {[{ id: "contacts", label: "Customers", Icon: UsersThree }, { id: "deals", label: "Deals", Icon: Handshake }].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} data-testid={`hubspot-tab-${id}`}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors duration-150 ${tab === id ? "border-[#10B981] text-[#0F172A] font-medium" : "border-transparent text-slate-500 hover:text-slate-900"}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      {tab === "contacts" && (
        !contacts ? <CircleNotch size={20} className="animate-spin text-[#10B981]" /> :
        !contacts.length ? <p className="text-sm text-slate-500" data-testid="hubspot-no-contacts">No contacts found in your HubSpot account.</p> : (
          <div className="border border-slate-200 rounded-sm overflow-x-auto" data-testid="hubspot-contacts-table">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-3">Name</th><th className="py-2.5 px-3">Email</th><th className="py-2.5 px-3">Phone</th><th className="py-2.5 px-3">Company</th><th className="py-2.5 px-3">Stage</th>
              </tr></thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="py-2 px-3 font-medium">{[c.properties?.firstname, c.properties?.lastname].filter(Boolean).join(" ") || "(no name)"}</td>
                    <td className="py-2 px-3 text-slate-600">{c.properties?.email || ""}</td>
                    <td className="py-2 px-3 text-slate-600 tabular">{c.properties?.phone || ""}</td>
                    <td className="py-2 px-3 text-slate-600">{c.properties?.company || ""}</td>
                    <td className="py-2 px-3 text-slate-600">{c.properties?.lifecyclestage || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      {tab === "deals" && (
        !deals ? <CircleNotch size={20} className="animate-spin text-[#10B981]" /> :
        !deals.length ? <p className="text-sm text-slate-500" data-testid="hubspot-no-deals">No deals found in your HubSpot account.</p> : (
          <div className="border border-slate-200 rounded-sm overflow-x-auto" data-testid="hubspot-deals-table">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-3">Deal</th><th className="py-2.5 px-3">Amount</th><th className="py-2.5 px-3">Stage</th><th className="py-2.5 px-3">Close date</th>
              </tr></thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100">
                    <td className="py-2 px-3 font-medium">{d.properties?.dealname || "(untitled)"}</td>
                    <td className="py-2 px-3 tabular">{money(d.properties?.amount)}</td>
                    <td className="py-2 px-3 text-slate-600">{d.properties?.dealstage || ""}</td>
                    <td className="py-2 px-3 text-slate-600">{d.properties?.closedate ? new Date(d.properties.closedate).toLocaleDateString() : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
