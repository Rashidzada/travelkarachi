import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Pencil, Copy, Trash2, Filter, GitBranch, X } from "lucide-react";
import { api } from "../../api";

const statusStyles: Record<string, string> = {
  Active:    "bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC]",
  Inactive:  "bg-[#F8FAFC] text-[#64748B] border border-[#CBD5E1]",
  Cancelled: "bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]",
};

const initialSegments = [
  { id: "SEG-0091", origin: "KHI", dest: "DXB", airline: "Emirates",        aircraft: "B777", dep: "06:30", arr: "08:45", dur: "2h 15m", seats: 248, price: 285, status: "Active"    },
  { id: "SEG-0090", origin: "LHR", dest: "JFK", airline: "British Airways",  aircraft: "A380", dep: "09:00", arr: "12:00", dur: "7h 00m", seats: 524, price: 640, status: "Active"    },
  { id: "SEG-0089", origin: "ISB", dest: "RUH", airline: "PIA",              aircraft: "B737", dep: "14:00", arr: "16:15", dur: "2h 15m", seats: 162, price: 220, status: "Inactive"  },
  { id: "SEG-0088", origin: "DXB", dest: "SIN", airline: "Emirates",        aircraft: "A350", dep: "23:30", arr: "07:45", dur: "7h 15m", seats: 312, price: 490, status: "Active"    },
  { id: "SEG-0087", origin: "CDG", dest: "MUC", airline: "Air France",       aircraft: "A320", dep: "11:30", arr: "13:05", dur: "1h 35m", seats: 180, price: 180, status: "Cancelled" },
  { id: "SEG-0086", origin: "BOM", dest: "LHR", airline: "Jet Airways",      aircraft: "B787", dep: "03:00", arr: "07:30", dur: "9h 30m", seats: 256, price: 560, status: "Active"    },
  { id: "SEG-0085", origin: "CAI", dest: "IST", airline: "Turkish Airlines", aircraft: "B737", dep: "08:45", arr: "12:15", dur: "3h 30m", seats: 162, price: 290, status: "Active"    },
];

export function SegmentManagement() {
  const [segments, setSegments] = useState<any[]>(initialSegments);
  const [search, setSearch] = useState("");
  const [airlineFilter, setAirlineFilter] = useState("All Airlines");
  const [routeFilter, setRouteFilter] = useState("All Routes");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selected, setSelected] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeg, setEditingSeg] = useState<any | null>(null);
  const [form, setForm] = useState({
    origin: "KHI",
    dest: "DXB",
    airline: "Emirates",
    flight_code: "EK-605",
    aircraft: "B777",
    dep: "08:00",
    arr: "10:15",
    dur: "2h 15m",
    seats: 240,
    price: 295,
    status: "Active",
  });

  const fetchSegments = useCallback(() => {
    api.getSegments({
      search,
      airline: airlineFilter,
      route: routeFilter,
      status: statusFilter,
    })
      .then((data) => {
        if (Array.isArray(data)) {
          setSegments(data);
        }
      })
      .catch(() => {});
  }, [search, airlineFilter, routeFilter, statusFilter]);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  const filtered = segments.filter((s) =>
    [s.id, s.origin, s.dest, s.airline].some((f) => String(f || "").toLowerCase().includes(search.toLowerCase()))
  );

  const toggleAll = () => setSelected(
    filtered.every((s) => selected.includes(s.id)) ? [] : filtered.map((s) => s.id)
  );
  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const openAddModal = () => {
    setEditingSeg(null);
    setForm({
      origin: "KHI",
      dest: "DXB",
      airline: "Emirates",
      flight_code: "EK-605",
      aircraft: "B777",
      dep: "08:00",
      arr: "10:15",
      dur: "2h 15m",
      seats: 240,
      price: 295,
      status: "Active",
    });
    setModalOpen(true);
  };

  const openEditModal = (seg: any) => {
    setEditingSeg(seg);
    setForm({
      origin: seg.origin,
      dest: seg.dest,
      airline: seg.airline,
      flight_code: seg.flight_code || "EK-601",
      aircraft: seg.aircraft,
      dep: seg.dep,
      arr: seg.arr,
      dur: seg.dur,
      seats: Number(seg.seats) || 180,
      price: Number(seg.price) || 250,
      status: seg.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSeg) {
        await api.updateSegment(editingSeg.id, form);
      } else {
        await api.createSegment(form);
      }
      setModalOpen(false);
      fetchSegments();
    } catch {
      setModalOpen(false);
    }
  };

  const handleDuplicate = async (seg: any) => {
    try {
      await api.duplicateSegment(seg.id);
      fetchSegments();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (seg: any) => {
    setSegments((prev) => prev.filter((s) => s.id !== seg.id));
    try {
      await api.deleteSegment(seg.id);
    } catch {
      fetchSegments();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl md:text-2xl font-semibold text-[#0F172A]">Segment Management</h1>
          <span className="bg-[#EEF2FF] text-[#4338CA] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#A5B4FC]">
            {segments.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 pr-3 w-36 md:w-48 rounded-[10px] border border-[#E2E8F0] bg-white text-[13px] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] shadow-[0_1px_2px_rgba(15,23,42,0.04)]" />
          </div>
          <button onClick={() => setFilterOpen(!filterOpen)}
            className={`h-9 px-3 rounded-[10px] border text-[12px] font-medium flex items-center gap-1.5 transition-colors ${filterOpen ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]" : "border-[#E2E8F0] text-[#64748B] bg-white"}`}>
            <Filter size={13} />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 h-9 rounded-[10px] text-[12px] md:text-[13px] font-semibold text-white hover:shadow-md transition-all"
            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <Plus size={14} />
            <span className="hidden sm:inline">Add Segment</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Filter row */}
      {filterOpen && (
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex flex-wrap gap-2">
          <select value={airlineFilter} onChange={(e) => setAirlineFilter(e.target.value)} className="h-9 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px] text-[#64748B] bg-[#F8FAFC] focus:outline-none focus:border-[#4F46E5]">
            <option>All Airlines</option>
            <option>Emirates</option><option>PIA</option><option>British Airways</option><option>Qatar Airways</option>
          </select>
          <select value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)} className="h-9 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px] text-[#64748B] bg-[#F8FAFC] focus:outline-none focus:border-[#4F46E5]">
            <option>All Routes</option>
            <option>KHI → DXB</option><option>LHR → JFK</option><option>ISB → RUH</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px] text-[#64748B] bg-[#F8FAFC] focus:outline-none focus:border-[#4F46E5]">
            <option>All Statuses</option>
            <option>Active</option><option>Inactive</option><option>Cancelled</option>
          </select>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#E2E8F0] rounded-[18px] flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center">
            <GitBranch size={28} className="text-[#CBD5E1]" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-[#0F172A] mb-1">No segments found</p>
            <p className="text-[13px] text-[#94A3B8]">Adjust filters or add a new segment</p>
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 px-5 h-9 rounded-[10px] text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <Plus size={14} /> Add Segment
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] md:rounded-[18px] shadow-[0_2px_8px_rgba(15,23,42,0.06)] overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="w-10 px-4 py-3.5">
                    <input type="checkbox" checked={filtered.every((s) => selected.includes(s.id))} onChange={toggleAll}
                      className="w-4 h-4 rounded accent-[#4F46E5]" />
                  </th>
                  {["Segment ID","Origin","Dest","Airline","Aircraft","Dep","Arr","Dur","Seats","Status","Actions"].map((col) => (
                    <th key={col} className="px-3 md:px-4 py-3.5 text-left text-[11px] md:text-[13px] font-semibold text-[#94A3B8] whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((seg, i) => (
                  <tr key={seg.id}
                    className={`border-b border-dashed border-[#E2E8F0] hover:bg-[#EEF2FF]/20 transition-colors ${i % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}`}
                    style={{ height: 52 }}>
                    <td className="px-4">
                      <input type="checkbox" checked={selected.includes(seg.id)} onChange={() => toggle(seg.id)}
                        className="w-4 h-4 rounded accent-[#4F46E5]" />
                    </td>
                    <td className="px-3 md:px-4 text-[12px] md:text-[13px] font-medium text-[#4F46E5] whitespace-nowrap">{seg.id}</td>
                    <td className="px-3 md:px-4 text-[12px] md:text-[13px] font-bold text-[#0F172A]">{seg.origin}</td>
                    <td className="px-3 md:px-4 text-[12px] md:text-[13px] font-bold text-[#0F172A]">{seg.dest}</td>
                    <td className="px-3 md:px-4 text-[12px] md:text-[13px] text-[#64748B] whitespace-nowrap">{seg.airline}</td>
                    <td className="px-3 md:px-4 text-[12px] md:text-[13px] text-[#64748B]">{seg.aircraft}</td>
                    <td className="px-3 md:px-4 text-[12px] md:text-[13px] font-medium text-[#0F172A]">{seg.dep}</td>
                    <td className="px-3 md:px-4 text-[12px] md:text-[13px] font-medium text-[#0F172A]">{seg.arr}</td>
                    <td className="px-3 md:px-4 text-[12px] md:text-[13px] text-[#64748B]">{seg.dur}</td>
                    <td className="px-3 md:px-4 text-[12px] md:text-[13px] font-semibold text-[#0F172A]">{seg.seats}</td>
                    <td className="px-3 md:px-4">
                      <span className={`inline-flex text-[10px] md:text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${statusStyles[seg.status] || statusStyles.Active}`}>
                        {seg.status}
                      </span>
                    </td>
                    <td className="px-3 md:px-4">
                      <div className="flex items-center gap-1">
                        <button
                          title="Edit"
                          onClick={() => openEditModal(seg)}
                          className="w-7 h-7 md:w-8 md:h-8 rounded-[7px] flex items-center justify-center hover:scale-105 transition-all"
                          style={{ background: "#EEF2FF", color: "#4F46E5" }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          title="Duplicate"
                          onClick={() => handleDuplicate(seg)}
                          className="w-7 h-7 md:w-8 md:h-8 rounded-[7px] flex items-center justify-center hover:scale-105 transition-all"
                          style={{ background: "#ECFEFF", color: "#06B6D4" }}
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(seg)}
                          className="w-7 h-7 md:w-8 md:h-8 rounded-[7px] flex items-center justify-center hover:scale-105 transition-all"
                          style={{ background: "#FEF2F2", color: "#EF4444" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Segment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white border border-[#E2E8F0] rounded-[18px] shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <h3 className="text-[16px] font-bold text-[#0F172A]">
                {editingSeg ? `Edit Segment ${editingSeg.id}` : "Add New Flight Segment"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Origin (IATA)</label>
                  <input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value.toUpperCase() })} maxLength={3} required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px] font-bold text-[#0F172A]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Destination (IATA)</label>
                  <input value={form.dest} onChange={(e) => setForm({ ...form, dest: e.target.value.toUpperCase() })} maxLength={3} required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px] font-bold text-[#0F172A]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Airline</label>
                  <input value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Aircraft</label>
                  <input value={form.aircraft} onChange={(e) => setForm({ ...form, aircraft: e.target.value })} required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Departure</label>
                  <input value={form.dep} onChange={(e) => setForm({ ...form, dep: e.target.value })} required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Arrival</label>
                  <input value={form.arr} onChange={(e) => setForm({ ...form, arr: e.target.value })} required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Duration</label>
                  <input value={form.dur} onChange={(e) => setForm({ ...form, dur: e.target.value })} required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Seats</label>
                  <input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Price ($)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-[8px] border border-[#E2E8F0] text-[13px] bg-white">
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 h-10 rounded-[10px] border border-[#E2E8F0] text-[13px] font-medium text-[#64748B]">
                  Cancel
                </button>
                <button type="submit" className="px-5 h-10 rounded-[10px] text-[13px] font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                  {editingSeg ? "Save Changes" : "Create Segment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
