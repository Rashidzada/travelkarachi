import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle,
  Users, UserPlus, Ticket, ArrowRight, PlusCircle, FileText,
  Settings, Plane, MoreHorizontal, Activity, Zap,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { api } from "../../api";

const initialChartData = [
  { month: "Jan", bookings: 340, revenue: 68 },
  { month: "Feb", bookings: 420, revenue: 84 },
  { month: "Mar", bookings: 380, revenue: 76 },
  { month: "Apr", bookings: 510, revenue: 102 },
  { month: "May", bookings: 460, revenue: 92 },
  { month: "Jun", bookings: 620, revenue: 124 },
  { month: "Jul", bookings: 580, revenue: 116 },
  { month: "Aug", bookings: 710, revenue: 142 },
  { month: "Sep", bookings: 650, revenue: 130 },
  { month: "Oct", bookings: 780, revenue: 156 },
  { month: "Nov", bookings: 820, revenue: 164 },
  { month: "Dec", bookings: 940, revenue: 188 },
];

const initialRecentApprovals = [
  { id: 1, name: "Sara Malik",    ref: "BK-20241", route: "KHI → DXB", status: "Approved",  time: "2m ago",  initials: "SM", color: "#4F46E5" },
  { id: 2, name: "James Okafor", ref: "BK-20240", route: "LHR → JFK", status: "Pending",   time: "8m ago",  initials: "JO", color: "#06B6D4" },
  { id: 3, name: "Ayesha Khan",  ref: "BK-20239", route: "ISB → RUH", status: "Approved",  time: "15m ago", initials: "AK", color: "#22C55E" },
  { id: 4, name: "Marco Rossi",  ref: "BK-20238", route: "MXP → CDG", status: "Rejected",  time: "22m ago", initials: "MR", color: "#F59E0B" },
  { id: 5, name: "Lin Wei",      ref: "BK-20237", route: "PEK → SIN", status: "Issued",    time: "31m ago", initials: "LW", color: "#7C3AED" },
  { id: 6, name: "Priya Sharma", ref: "BK-20236", route: "BOM → LHR", status: "Approved",  time: "45m ago", initials: "PS", color: "#EF4444" },
];

const initialTopAgents = [
  { name: "Falcon Travels",  city: "Karachi",   bookings: 284, revenue: "$142,800", growth: 18,  status: "Active"    },
  { name: "Sky Bridge Intl", city: "Lahore",    bookings: 231, revenue: "$118,350", growth: 12,  status: "Active"    },
  { name: "Horizon Agency",  city: "Dubai",     bookings: 198, revenue: "$99,000",  growth: 9,   status: "Active"    },
  { name: "Global Wings",    city: "Islamabad", bookings: 167, revenue: "$83,500",  growth: -4,  status: "Active"    },
  { name: "AirConnect Ltd",  city: "Riyadh",    bookings: 143, revenue: "$71,500",  growth: 6,   status: "Suspended" },
];

const agentColors = ["#4F46E5","#06B6D4","#22C55E","#F59E0B","#7C3AED"];

const statusPill: Record<string, string> = {
  Approved:  "bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC]",
  Pending:   "bg-[#FFFBEB] text-[#B45309] border border-[#FCD34D]",
  Rejected:  "bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]",
  Issued:    "bg-[#EEF2FF] text-[#4338CA] border border-[#A5B4FC]",
  Void:      "bg-[#F8FAFC] text-[#64748B] border border-[#CBD5E1]",
  Active:    "bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC]",
  Suspended: "bg-[#FFFBEB] text-[#B45309] border border-[#FCD34D]",
  Blocked:   "bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]",
  "Pending KYC": "bg-[#F8FAFC] text-[#64748B] border border-[#CBD5E1]",
};

const kpiMeta = [
  { label: "Total Bookings",    defaultVal: "4,821",  sub: "+12.4% vs last month", trend: "+12.4%", up: true,  icon: <Ticket size={17} />,     grad: "linear-gradient(135deg,#4F46E5,#7C3AED)", glow: "rgba(79,70,229,0.25)"   },
  { label: "Sales Revenue",     defaultVal: "$1.24M", sub: "+8.7% vs last month",  trend: "+8.7%",  up: true,  icon: <DollarSign size={17} />, grad: "linear-gradient(135deg,#22C55E,#16A34A)", glow: "rgba(34,197,94,0.25)"   },
  { label: "Pending Approvals", defaultVal: "138",    sub: "–3.2% vs last month",  trend: "-3.2%",  up: false, icon: <Clock size={17} />,      grad: "linear-gradient(135deg,#F59E0B,#D97706)", glow: "rgba(245,158,11,0.25)"  },
  { label: "Approved Bookings", defaultVal: "3,902",  sub: "+15.1% vs last month", trend: "+15.1%", up: true,  icon: <CheckCircle size={17} />,grad: "linear-gradient(135deg,#06B6D4,#0284C7)", glow: "rgba(6,182,212,0.25)"   },
  { label: "Sub Agents",        defaultVal: "127",    sub: "+4.3% vs last month",  trend: "+4.3%",  up: true,  icon: <Users size={17} />,      grad: "linear-gradient(135deg,#7C3AED,#6D28D9)", glow: "rgba(124,58,237,0.25)"  },
  { label: "New Registrations", defaultVal: "23",     sub: "+18.9% vs last month", trend: "+18.9%", up: true,  icon: <UserPlus size={17} />,   grad: "linear-gradient(135deg,#EF4444,#DC2626)", glow: "rgba(239,68,68,0.25)"   },
];

const periods = ["7D", "30D", "90D", "1Y"];
const glass = "bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_2px_20px_rgba(15,23,42,0.06)]";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-[10px] text-[12px]"
      style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 4px 16px rgba(15,23,42,0.1)" }}>
      <p className="font-semibold text-[#0F172A] mb-0.5">{label}</p>
      <p className="text-[#4F46E5] font-bold">{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

interface DashboardProps {
  onNavigate?: (screen: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [period, setPeriod] = useState("1Y");
  const [chartType, setChartType] = useState<"bookings" | "revenue">("bookings");
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const [chartData, setChartData] = useState(initialChartData);
  const [recentApprovals, setRecentApprovals] = useState(initialRecentApprovals);
  const [topAgents, setTopAgents] = useState(initialTopAgents);
  const [kpiValues, setKpiValues] = useState<Record<string, { value: string; sub: string; trend?: string; up: boolean }>>({});
  const [heroStats, setHeroStats] = useState({
    active_bookings: "4,821",
    awaiting_review: 138,
    bookings_today: "84",
    pending_review_today: "12",
    revenue_today: "$42K",
  });
  const [liveStatus, setLiveStatus] = useState([
    { label: "Flights today",  value: "48 departures",    dot: "#22C55E", bar: 82 },
    { label: "Alerts",         value: "3 require action", dot: "#F59E0B", bar: 24 },
    { label: "API response",   value: "42 ms avg",        dot: "#06B6D4", bar: 88 },
    { label: "Queue depth",    value: "2 pending",        dot: "#7C3AED", bar: 35 },
  ]);

  useEffect(() => {
    let active = true;
    api.getDashboard(period)
      .then((data) => {
        if (!active) return;
        if (data.chartData) setChartData(data.chartData);
        if (data.recentApprovals) setRecentApprovals(data.recentApprovals);
        if (data.topAgents) setTopAgents(data.topAgents);
        if (data.hero) setHeroStats(data.hero);
        if (data.liveStatus) setLiveStatus(data.liveStatus);
        if (data.kpis) {
          const map: Record<string, any> = {};
          data.kpis.forEach((k: any) => {
            map[k.label] = k;
          });
          setKpiValues(map);
        }
      })
      .catch(() => {
        // Keep initial data if offline
      });
    return () => { active = false; };
  }, [period]);

  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(145deg,#eef2ff 0%,#faf8ff 35%,#ecfdf5 100%)",
        margin: "-16px",
        padding: "16px",
      }}
    >
      {/* ── Hero Banner ─── */}
      <div
        className="relative rounded-[18px] md:rounded-[22px] overflow-hidden px-5 md:px-8 py-5 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5"
        style={{ background: "linear-gradient(130deg,#3730a3 0%,#4F46E5 35%,#7C3AED 70%,#06B6D4 100%)" }}
      >
        <div className="absolute -top-12 -left-12 w-52 h-52 rounded-full bg-white/10 blur-[40px]" />
        <div className="absolute bottom-0 right-40 w-72 h-48 rounded-full bg-white/8 blur-[50px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white"
              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)" }}>
              <Activity size={11} /> Live Dashboard
            </span>
            <span className="text-white/50 text-[12px]">Connected to Django Backend</span>
          </div>
          <h1 className="text-white text-xl md:text-2xl font-bold leading-tight tracking-tight">
            Good morning, Admin 👋
          </h1>
          <p className="text-white/55 text-[12px] md:text-[13px] mt-1">
            {heroStats.active_bookings} bookings active · {heroStats.awaiting_review} awaiting review
          </p>
        </div>

        {/* Glass stat chips — horizontal scroll on mobile */}
        <div className="relative z-10 flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 scrollbar-hide flex-shrink-0">
          {[
            { icon: <Zap size={13} />,        label: "Bookings Today", value: heroStats.bookings_today  },
            { icon: <Clock size={13} />,       label: "Pending Review", value: heroStats.pending_review_today  },
            { icon: <DollarSign size={13} />,  label: "Revenue Today",  value: heroStats.revenue_today },
          ].map((s) => (
            <div key={s.label}
              className="flex flex-col items-center px-4 py-2.5 rounded-[14px] flex-shrink-0 min-w-[84px]"
              style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.22)" }}>
              <div className="text-white/50 mb-1">{s.icon}</div>
              <p className="text-white text-[18px] md:text-[22px] font-extrabold leading-none">{s.value}</p>
              <p className="text-white/55 text-[9px] md:text-[10px] mt-1 text-center leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        <Plane size={120} className="absolute right-[300px] top-1/2 -translate-y-1/2 text-white/[0.04] rotate-12 pointer-events-none hidden lg:block" />
      </div>

      {/* ── KPI Cards — 2 col mobile, 3 col sm, 6 col lg ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-5">
        {kpiMeta.map((kpi) => {
          const live = kpiValues[kpi.label];
          const val = live ? live.value : kpi.defaultVal;
          const sub = live ? live.sub : kpi.sub;
          const up = live ? live.up : kpi.up;
          const trend = live?.trend || kpi.trend;
          return (
            <div key={kpi.label}
              className={`${glass} rounded-[14px] md:rounded-[16px] p-4 group relative overflow-hidden cursor-default hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(15,23,42,0.11)] transition-all duration-200`}>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: kpi.glow }} />
              <div className="flex items-start justify-between mb-2.5 relative z-10">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                  style={{ background: kpi.grad }}>
                  {kpi.icon}
                </div>
                <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${up ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#FEF2F2] text-[#DC2626]"}`}>
                  {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {trend}
                </span>
              </div>
              <p className="text-[18px] md:text-[21px] font-extrabold text-[#0F172A] leading-none mb-1 relative z-10">{val}</p>
              <p className="text-[11px] md:text-[12px] font-medium text-[#475569] relative z-10 leading-snug">{kpi.label}</p>
              <p className="text-[9px] md:text-[10px] text-[#94A3B8] mt-0.5 relative z-10 hidden sm:block">{sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Chart + Approvals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 mb-5">

        {/* Chart */}
        <div className={`lg:col-span-8 ${glass} rounded-[16px] md:rounded-[18px] p-4 md:p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-5">
            <div>
              <h2 className="text-[14px] md:text-[15px] font-bold text-[#0F172A] tracking-tight">Booking Activity</h2>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Monthly performance — {period} view</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex rounded-full p-0.5 gap-0.5"
                style={{ background: "rgba(241,245,249,0.8)", border: "1px solid rgba(226,232,240,0.6)" }}>
                {(["bookings","revenue"] as const).map((m) => (
                  <button key={m} onClick={() => setChartType(m)}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full capitalize transition-all duration-150 ${chartType === m ? "bg-[#4F46E5] text-white shadow-sm" : "text-[#94A3B8] hover:text-[#0F172A]"}`}>
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex rounded-full p-0.5 gap-0.5"
                style={{ background: "rgba(241,245,249,0.8)", border: "1px solid rgba(226,232,240,0.6)" }}>
                {periods.map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all duration-150 ${period === p ? "bg-white text-[#4F46E5] shadow-sm" : "text-[#94A3B8] hover:text-[#0F172A]"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            {chartType === "bookings" ? (
              <AreaChart data={chartData} margin={{ top: 4, right: 2, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(226,232,240,0.6)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="bookings" stroke="#4F46E5" strokeWidth={2.5} fill="#4F46E5" fillOpacity={0.07} dot={false} activeDot={{ r: 5, fill: "#4F46E5", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 4, right: 2, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(226,232,240,0.6)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#4F46E5" fillOpacity={0.82} radius={[6,6,0,0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Recent Approvals */}
        <div className={`lg:col-span-4 ${glass} rounded-[16px] md:rounded-[18px] p-4 md:p-5 flex flex-col`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[14px] font-bold text-[#0F172A]">Recent Approvals</h2>
              <p className="text-[11px] text-[#94A3B8]">Last 6 transactions</p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate("flight-bookings")}
              className="flex items-center gap-1 text-[11px] text-[#4F46E5] font-semibold px-2.5 py-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors"
            >
              All <ArrowRight size={11} />
            </button>
          </div>
          <div className="flex-1 space-y-0">
            {recentApprovals.map((item, i) => (
              <div key={item.ref || item.id}>
                <div
                  onClick={() => onNavigate && onNavigate("flight-bookings")}
                  className="flex items-center gap-2.5 py-2.5 rounded-lg px-1 hover:bg-white/50 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm"
                    style={{ background: item.color }}>
                    {item.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#0F172A] truncate">{item.name}</p>
                    <p className="text-[10px] text-[#94A3B8] truncate">{item.ref} · {item.route}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusPill[item.status] || statusPill.Pending}`}>
                      {item.status}
                    </span>
                    <p className="text-[10px] text-[#CBD5E1]">{item.time}</p>
                  </div>
                </div>
                {i < recentApprovals.length - 1 && (
                  <div className="h-px mx-1" style={{ background: "rgba(226,232,240,0.5)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">

        {/* Top Sub-Agents — horizontally scrollable on mobile */}
        <div className={`lg:col-span-8 ${glass} rounded-[16px] md:rounded-[18px] overflow-hidden`}>
          <div className="flex items-center justify-between px-4 md:px-6 py-4"
            style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
            <div>
              <h2 className="text-[14px] font-bold text-[#0F172A]">Top Sub-Agents</h2>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Ranked by bookings this month</p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate("sub-agents")}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] px-2.5 py-1.5 rounded-lg hover:bg-white/60 transition-colors border border-transparent hover:border-[#E2E8F0]"
            >
              <MoreHorizontal size={13} /> More
            </button>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr style={{ background: "rgba(248,250,252,0.55)" }}>
                  {["#","Agent","City","Bookings","Revenue","Growth","Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topAgents.map((agent, i) => (
                  <tr key={agent.name}
                    onMouseEnter={() => setHoveredAgent(agent.name)}
                    onMouseLeave={() => setHoveredAgent(null)}
                    onClick={() => onNavigate && onNavigate("sub-agents")}
                    className="transition-colors cursor-pointer"
                    style={{ borderTop: "1px solid rgba(226,232,240,0.5)", background: hoveredAgent === agent.name ? "rgba(238,242,255,0.45)" : i % 2 === 1 ? "rgba(250,250,252,0.4)" : "transparent" }}>
                    <td className="px-4 py-3.5"><span className="text-[12px] font-bold text-[#CBD5E1]">0{i+1}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm"
                          style={{ background: agentColors[i % agentColors.length] }}>
                          {agent.name.slice(0,2).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-semibold text-[#0F172A] whitespace-nowrap">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-[#64748B] whitespace-nowrap">{agent.city}</td>
                    <td className="px-4 py-3.5 text-[13px] font-bold text-[#0F172A]">{agent.bookings}</td>
                    <td className="px-4 py-3.5 text-[13px] font-semibold text-[#0F172A] whitespace-nowrap">{agent.revenue}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${agent.growth >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                        {agent.growth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {agent.growth >= 0 ? "+" : ""}{agent.growth}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${statusPill[agent.status] || statusPill.Active}`}>
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Actions + Live Status */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Quick Actions — 2x2 grid on all sizes */}
          <div className={`${glass} rounded-[16px] md:rounded-[18px] p-4 md:p-5`}>
            <h2 className="text-[14px] font-bold text-[#0F172A] mb-3">Quick Actions</h2>
            <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-2 gap-2.5">
              {[
                { icon: <PlusCircle size={19} />, label: "New Booking", target: "flight-pos",  grad: "linear-gradient(135deg,#4F46E5,#7C3AED)",  glow: "rgba(79,70,229,0.2)"   },
                { icon: <UserPlus size={19} />,   label: "Add Agent",   target: "sub-agents",  grad: "linear-gradient(135deg,#7C3AED,#6D28D9)",  glow: "rgba(124,58,237,0.2)"  },
                { icon: <FileText size={19} />,   label: "Reports",     target: "reports",     grad: "linear-gradient(135deg,#06B6D4,#0284C7)",  glow: "rgba(6,182,212,0.2)"   },
                { icon: <Settings size={19} />,   label: "Settings",    target: "settings",    grad: "linear-gradient(135deg,#64748B,#475569)",  glow: "rgba(100,116,139,0.2)" },
              ].map((action) => (
                <button key={action.label}
                  onClick={() => onNavigate && onNavigate(action.target)}
                  className="group flex flex-col items-center gap-2 p-3 md:p-3.5 rounded-[13px] transition-all duration-200 border border-transparent hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.55)" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(255,255,255,0.92)";
                    el.style.boxShadow = `0 6px 20px ${action.glow}`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(255,255,255,0.55)";
                    el.style.boxShadow = "none";
                  }}>
                  <div className="w-10 h-10 rounded-[11px] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-150"
                    style={{ background: action.grad }}>
                    {action.icon}
                  </div>
                  <span className="text-[10px] md:text-[11px] font-semibold text-[#0F172A] text-center leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Status */}
          <div className={`${glass} rounded-[16px] md:rounded-[18px] p-4 md:p-5`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-bold text-[#0F172A]">Live Status</h2>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full text-[#16A34A]"
                style={{ background: "rgba(240,253,244,0.8)", border: "1px solid #86EFAC" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                All systems normal
              </span>
            </div>
            <div className="space-y-2.5">
              {liveStatus.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                      <span className="text-[11px] text-[#64748B]">{s.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#0F172A]">{s.value}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(226,232,240,0.6)" }}>
                    <div className="h-full rounded-full" style={{ width: `${s.bar}%`, background: s.dot, opacity: 0.7 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
