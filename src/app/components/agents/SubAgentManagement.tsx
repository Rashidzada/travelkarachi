import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Eye, Pencil, Phone, MoreHorizontal, X } from "lucide-react";
import { api } from "../../api";

const statusStyles: Record<string, string> = {
  Active:        "bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC]",
  Suspended:     "bg-[#FFFBEB] text-[#B45309] border border-[#FCD34D]",
  Blocked:       "bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]",
  "Pending KYC": "bg-[#F8FAFC] text-[#64748B] border border-[#CBD5E1]",
};

const initialAgents = [
  { id: 1, name: "Falcon Travels",  company: "Falcon Intl",  initials: "FT", color: "#4F46E5", email: "info@falcon.pk",      phone: "+92-21-1234567", city: "Karachi",   creditLimit: 500000, creditUsed: 210000, balance: 290000, status: "Active"      },
  { id: 2, name: "Sky Bridge Intl", company: "Sky Group",    initials: "SB", color: "#06B6D4", email: "ops@skybridge.com",   phone: "+92-42-9876543", city: "Lahore",    creditLimit: 350000, creditUsed: 280000, balance: 70000,  status: "Active"      },
  { id: 3, name: "Horizon Agency",  company: "Horizon LLC",  initials: "HA", color: "#22C55E", email: "book@horizon.ae",     phone: "+971-4-1234567", city: "Dubai",     creditLimit: 800000, creditUsed: 520000, balance: 280000, status: "Active"      },
  { id: 4, name: "Global Wings",    company: "Global Corp",  initials: "GW", color: "#7C3AED", email: "sales@globalwings.pk",phone: "+92-51-5555555", city: "Islamabad", creditLimit: 200000, creditUsed: 178000, balance: 22000,  status: "Suspended"   },
  { id: 5, name: "AirConnect Ltd",  company: "AirConnect",   initials: "AC", color: "#F59E0B", email: "admin@airconnect.sa", phone: "+966-11-888888", city: "Riyadh",    creditLimit: 600000, creditUsed: 45000,  balance: 555000, status: "Active"      },
  { id: 6, name: "TravelPro KHI",   company: "TravelPro",    initials: "TP", color: "#EF4444", email: "info@travelpro.pk",   phone: "+92-21-7777777", city: "Karachi",   creditLimit: 150000, creditUsed: 0,      balance: 150000, status: "Pending KYC" },
  { id: 7, name: "Nova Travels",    company: "Nova Group",   initials: "NT", color: "#0F172A", email: "nova@travels.com",    phone: "+44-20-9999999", city: "London",    creditLimit: 1000000,creditUsed: 850000, balance: 150000, status: "Blocked"     },
];

function CreditBar({ used, limit }: { used: number; limit: number }) {
  const safeLimit = limit > 0 ? limit : 1;
  const pct = Math.round((used / safeLimit) * 100);
  const color = pct > 85 ? "#EF4444" : pct > 60 ? "#F59E0B" : "#22C55E";
  return (
    <div>
      <span className="text-[11px] md:text-[12px] font-medium text-[#0F172A] whitespace-nowrap">
        ${(used / 1000).toFixed(0)}k / ${(limit / 1000).toFixed(0)}k
      </span>
      <div className="mt-1 h-1 rounded-full bg-[#E2E8F0] w-20 md:w-28 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
    </div>
  );
}

export function SubAgentManagement() {
  const [agents, setAgents] = useState<any[]>(initialAgents);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);
  const [viewAgent, setViewAgent] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    city: "Karachi",
    credit_limit: 500000,
    credit_used: 50000,
    status: "Active",
  });

  const fetchAgents = useCallback(() => {
    api.getAgents(search)
      .then((data) => {
        if (Array.isArray(data)) {
          setAgents(data);
        }
      })
      .catch(() => {});
  }, [search]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const filtered = agents.filter((a) =>
    [a.name, a.city, a.email, a.company].some((f) => String(f || "").toLowerCase().includes(search.toLowerCase()))
  );

  const toggleAll = () => setSelected(
    filtered.length > 0 && filtered.every((a) => selected.includes(a.id)) ? [] : filtered.map((a) => a.id)
  );
  const toggle = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const openAddModal = () => {
    setEditingAgent(null);
    setForm({
      name: "",
      company: "",
      email: "",
      phone: "+92-21-",
      city: "Karachi",
      credit_limit: 500000,
      credit_used: 0,
      status: "Active",
    });
    setModalOpen(true);
  };

  const openEditModal = (agent: any) => {
    setEditingAgent(agent);
    setForm({
      name: agent.name,
      company: agent.company,
      email: agent.email,
      phone: agent.phone,
      city: agent.city,
      credit_limit: Number(agent.creditLimit ?? agent.credit_limit) || 500000,
      credit_used: Number(agent.creditUsed ?? agent.credit_used) || 0,
      status: agent.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAgent) {
        await api.updateAgent(editingAgent.id, form);
      } else {
        await api.createAgent(form);
      }
      setModalOpen(false);
      fetchAgents();
    } catch {
      setModalOpen(false);
    }
  };

  const cycleStatus = async (agent: any) => {
    const order = ["Active", "Suspended", "Pending KYC", "Blocked"];
    const nextStatus = order[(order.indexOf(agent.status) + 1) % order.length];
    setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, status: nextStatus } : a)));
    try {
      await api.updateAgent(agent.id, { status: nextStatus });
    } catch {
      fetchAgents();
    }
  };

  const totalAgentsCount = 120 + agents.length;
  const activeCount = 80 + agents.filter((a) => a.status === "Active").length;
  const pendingKycCount = 8 + agents.filter((a) => a.status === "Pending KYC").length;
  const totalCreditM = (agents.reduce((acc, a) => acc + Number(a.creditLimit ?? a.credit_limit ?? 0), 4800000) / 1000000).toFixed(1);

  const stats = [
    { label: "Total Agents",    value: String(totalAgentsCount), color: "#4F46E5", bg: "#EEF2FF" },
    { label: "Active Today",    value: String(activeCount),      color: "#22C55E", bg: "#F0FDF4" },
    { label: "Credit Extended", value: `$${totalCreditM}M`,      color: "#06B6D4", bg: "#ECFEFF" },
    { label: "Pending KYC",     value: String(pendingKycCount),  color: "#F59E0B", bg: "#FFFBEB" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl md:text-2xl font-semibold text-[#0F172A]">Sub Agents</h1>
          <span className="bg-[#F0FDF4] text-[#15803D] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#86EFAC]">
            {totalAgentsCount} Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" placeholder="Search agents…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 pr-3 w-36 md:w-48 rounded-[10px] border border-[#E2E8F0] bg-white text-[13px] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] shadow-[0_1px_2px_rgba(15,23,42,0.04)]" />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 h-9 rounded-[10px] text-[12px] md:text-[13px] font-semibold text-white hover:shadow-md transition-all"
            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <Plus size={14} />
            <span className="hidden sm:inline">Add Sub Agent</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Stats strip — 2 cols mobile, 4 cols sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label}
            className="bg-white border border-[#E2E8F0] rounded-[12px] md:rounded-[14px] p-3 md:p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center text-base font-bold"
              style={{ background: s.bg, color: s.color }}>
              {s.value[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] md:text-[17px] font-bold text-[#0F172A] leading-none">{s.value}</p>
              <p className="text-[10px] md:text-[12px] text-[#94A3B8] truncate mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] md:rounded-[18px] shadow-[0_2px_8px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="w-10 px-4 py-3.5">
                  <input type="checkbox"
                    checked={filtered.length > 0 && filtered.every((a) => selected.includes(a.id))}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-[#4F46E5]" />
                </th>
                {["Agent","Email","Phone","City","Credit Limit","Balance","Status","Actions"].map((col) => (
                  <th key={col} className="px-3 md:px-4 py-3.5 text-left text-[11px] md:text-[13px] font-semibold text-[#94A3B8] whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((agent, i) => (
                <tr key={agent.id}
                  className={`border-b border-dashed border-[#E2E8F0] hover:bg-[#EEF2FF]/20 transition-colors ${i % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}`}
                  style={{ height: 56 }}>
                  <td className="px-4">
                    <input type="checkbox" checked={selected.includes(agent.id)} onChange={() => toggle(agent.id)}
                      className="w-4 h-4 rounded accent-[#4F46E5]" />
                  </td>
                  <td className="px-3 md:px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                        style={{ background: agent.color || "#4F46E5" }}>
                        {agent.initials || agent.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] md:text-[13px] font-semibold text-[#0F172A] truncate">{agent.name}</p>
                        <span className="text-[10px] font-medium text-[#7C3AED] bg-[#F5F3FF] px-1.5 py-0.5 rounded-full">{agent.company}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-4 text-[11px] md:text-[13px] text-[#64748B] whitespace-nowrap">{agent.email}</td>
                  <td className="px-3 md:px-4 text-[11px] md:text-[13px] text-[#64748B] whitespace-nowrap">{agent.phone}</td>
                  <td className="px-3 md:px-4 text-[12px] md:text-[13px] text-[#64748B]">{agent.city}</td>
                  <td className="px-3 md:px-4"><CreditBar used={agent.creditUsed ?? agent.credit_used ?? 0} limit={agent.creditLimit ?? agent.credit_limit ?? 500000} /></td>
                  <td className="px-3 md:px-4 text-[12px] md:text-[13px] font-semibold text-[#0F172A] whitespace-nowrap">
                    ${((agent.balance ?? 0) / 1000).toFixed(0)}k
                  </td>
                  <td className="px-3 md:px-4">
                    <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${statusStyles[agent.status] || statusStyles.Active}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-3 md:px-4">
                    <div className="flex items-center gap-1">
                      <button
                        title="View Profile"
                        onClick={() => setViewAgent(agent)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-[7px] flex items-center justify-center hover:scale-105 transition-all"
                        style={{ background: "#EEF2FF", color: "#4F46E5" }}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        title="Edit Agent"
                        onClick={() => openEditModal(agent)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-[7px] flex items-center justify-center hover:scale-105 transition-all"
                        style={{ background: "#F5F3FF", color: "#7C3AED" }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        title={`Call ${agent.phone}`}
                        onClick={() => window.open(`tel:${agent.phone}`)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-[7px] flex items-center justify-center hover:scale-105 transition-all"
                        style={{ background: "#F0FDF4", color: "#22C55E" }}
                      >
                        <Phone size={13} />
                      </button>
                      <button
                        title="Toggle Status"
                        onClick={() => cycleStatus(agent)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-[7px] flex items-center justify-center hover:scale-105 transition-all"
                        style={{ background: "#F8FAFC", color: "#64748B" }}
                      >
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Agent Modal */}
      {viewAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={() => setViewAgent(null)}>
          <div className="bg-white border border-[#E2E8F0] rounded-[18px] shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: viewAgent.color || "#4F46E5" }}>
                  {viewAgent.initials}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0F172A]">{viewAgent.name}</h3>
                  <p className="text-[12px] text-[#7C3AED] font-medium">{viewAgent.company} · {viewAgent.city}</p>
                </div>
              </div>
              <button onClick={() => setViewAgent(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC]">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="bg-[#F8FAFC] p-3 rounded-[10px]">
                <p className="text-[11px] text-[#94A3B8]">Email</p>
                <p className="font-semibold text-[#0F172A] truncate">{viewAgent.email}</p>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-[10px]">
                <p className="text-[11px] text-[#94A3B8]">Phone</p>
                <p className="font-semibold text-[#0F172A]">{viewAgent.phone}</p>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-[10px]">
                <p className="text-[11px] text-[#94A3B8]">Credit Limit</p>
                <p className="font-bold text-[#4F46E5]">${Number(viewAgent.creditLimit ?? viewAgent.credit_limit).toLocaleString()}</p>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-[10px]">
                <p className="text-[11px] text-[#94A3B8]">Available Balance</p>
                <p className="font-bold text-[#16A34A]">${Number(viewAgent.balance ?? 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setViewAgent(null); openEditModal(viewAgent); }} className="px-4 py-2 rounded-[8px] bg-[#EEF2FF] text-[#4F46E5] text-[12px] font-semibold">
                Edit Agent
              </button>
              <button onClick={() => setViewAgent(null)} className="px-4 py-2 rounded-[8px] bg-[#F1F5F9] text-[#0F172A] text-[12px] font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Sub Agent Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white border border-[#E2E8F0] rounded-[18px] shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <h3 className="text-[16px] font-bold text-[#0F172A]">
                {editingAgent ? `Edit ${editingAgent.name}` : "Add New Sub Agent"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Agency Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Clifton Air" required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Company Group</label>
                  <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Clifton Group" required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@agency.pk" required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">City</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Credit Limit ($)</label>
                  <input type="number" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: Number(e.target.value) })} required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px] bg-white">
                    <option>Active</option>
                    <option>Pending KYC</option>
                    <option>Suspended</option>
                    <option>Blocked</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 h-10 rounded-[10px] border border-[#E2E8F0] text-[13px] font-medium text-[#64748B]">
                  Cancel
                </button>
                <button type="submit" className="px-5 h-10 rounded-[10px] text-[13px] font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                  {editingAgent ? "Save Changes" : "Create Sub Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
