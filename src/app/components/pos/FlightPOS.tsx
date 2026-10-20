import { useState } from "react";
import {
  ArrowLeftRight, Calendar, Search, Plus, Minus, ChevronDown, Tag,
  ArrowUpDown, Clock, Star, ChevronRight,
  Luggage, Plane, CheckCircle2, SlidersHorizontal, X,
} from "lucide-react";
import { api, SelectedFlightContext } from "../../api";

const airportNames: Record<string, string> = {
  KHI: "Jinnah Intl · Karachi",
  DXB: "Dubai International",
  ISB: "Islamabad Intl",
  LHR: "London Heathrow",
  RUH: "King Khalid Intl",
  JFK: "John F. Kennedy",
  BOM: "Chhatrapati Shivaji",
  SIN: "Singapore Changi",
  DOH: "Hamad International",
  CDG: "Charles de Gaulle",
};

const recentSearches = [
  "KHI → ISB · Jun 15 · 2 Pax",
  "DXB → LHR · Jun 20 · 1 Pax",
  "KHI → DXB · Jul 1 · 3 Pax",
  "ISB → RUH · Jun 25 · 2 Pax",
];

interface Flight {
  id: string;
  airline: string;
  code: string;
  logo: string;
  color: string;
  dep: string; arr: string;
  depTime: string; arrTime: string;
  duration: string;
  stops: number; stopCity?: string;
  price: number; oldPrice?: number;
  seats: number;
  amenities: string[];
  cls: string;
  rating: number;
  badge?: string;
}

const mkFlights = (from: string, to: string, cls = "Economy"): Flight[] => [
  { id:"1", airline:"Emirates",     code:"EK-623", logo:"EK", color:"#C8102E", dep:from,arr:to, depTime:"06:15",arrTime:"08:30", duration:"2h 15m", stops:0,           price:285,            seats:4,  amenities:["wifi","meal","usb","lounge"], cls, rating:4.8, badge:"Top Pick"  },
  { id:"2", airline:"Air Arabia",   code:"G9-521", logo:"G9", color:"#FF6B35", dep:from,arr:to, depTime:"09:45",arrTime:"12:20", duration:"2h 35m", stops:0,           price:189,            seats:14, amenities:["usb"],                       cls, rating:4.1             },
  { id:"3", airline:"PIA",          code:"PK-212", logo:"PK", color:"#006341", dep:from,arr:to, depTime:"11:00",arrTime:"14:45", duration:"3h 45m", stops:1,stopCity:"ISB", price:165,        seats:21, amenities:["meal"],                      cls, rating:3.6, badge:"Cheapest" },
  { id:"4", airline:"Qatar Airways",code:"QR-405", logo:"QR", color:"#5C0632", dep:from,arr:to, depTime:"13:20",arrTime:"15:50", duration:"2h 30m", stops:0,           price:340,oldPrice:420,seats:2,  amenities:["wifi","meal","usb","lounge"], cls:"Business", rating:4.9, badge:"Premium"  },
  { id:"5", airline:"flydubai",     code:"FZ-312", logo:"FZ", color:"#00A3E0", dep:from,arr:to, depTime:"16:05",arrTime:"18:25", duration:"2h 20m", stops:0,           price:210,            seats:8,  amenities:["wifi","usb"],                cls, rating:4.3             },
  { id:"6", airline:"Serene Air",   code:"ER-501", logo:"ER", color:"#1B3A6B", dep:from,arr:to, depTime:"19:30",arrTime:"22:05", duration:"2h 35m", stops:0,           price:155,            seats:26, amenities:["meal"],                      cls, rating:3.8             },
];

type Sort = "price" | "duration" | "departure" | "rating";
type StopFilter = "all" | "direct" | "1stop";

const badgeColor: Record<string, { bg: string; text: string; border: string }> = {
  "Top Pick": { bg: "#EEF2FF", text: "#4F46E5", border: "#C7D2FE" },
  Cheapest:   { bg: "#F0FDF4", text: "#16A34A", border: "#86EFAC" },
  Premium:    { bg: "#FFFBEB", text: "#B45309", border: "#FCD34D" },
};

export function FlightPOS({ onBookFlight }: { onBookFlight: (flight?: SelectedFlightContext) => void }) {
  const [tripType, setTripType]       = useState("Round Trip");
  const [from, setFrom]               = useState("KHI");
  const [to, setTo]                   = useState("DXB");
  const [departDate, setDepartDate]   = useState("2026-06-15");
  const [returnDate, setReturnDate]   = useState("2026-06-22");
  const [cabinClass, setCabinClass]   = useState("Economy");
  const [adults, setAdults]           = useState(1);
  const [children, setChildren]       = useState(0);
  const [infants, setInfants]         = useState(0);
  const [promoOpen, setPromoOpen]     = useState(false);
  const [promoCode, setPromoCode]     = useState("");
  const [promoMessage, setPromoMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [results, setResults]         = useState<Flight[] | null>(null);
  const [searching, setSearching]     = useState(false);
  const [sortBy, setSortBy]           = useState<Sort>("price");
  const [stopFilter, setStopFilter]   = useState<StopFilter>("all");
  const [maxPrice, setMaxPrice]       = useState(1200);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected]       = useState<string | null>(null);

  const swap = () => { setFrom(to); setTo(from); };

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await api.validatePromo(promoCode.trim());
      setPromoDiscount(res.discount_amount);
      setPromoMessage({ text: `Applied ${res.code}: -$${res.discount_amount} (${res.description})`, ok: true });
    } catch (err: any) {
      setPromoDiscount(0);
      setPromoMessage({ text: err?.message || "Invalid promo code (Try AERO20 or KARACHI50)", ok: false });
    }
  };

  const search = async (overrideFrom?: string, overrideTo?: string) => {
    const f = overrideFrom || from;
    const t = overrideTo || to;
    setSearching(true);
    setResults(null);
    setSelected(null);
    try {
      const data = await api.searchFlights({
        from: f,
        to: t,
        cabin_class: cabinClass,
        promo_code: promoCode,
      });
      if (data.promo_applied) {
        setPromoDiscount(data.promo_applied);
      }
      setResults(data.flights);
    } catch {
      setResults(mkFlights(f, t, cabinClass));
    } finally {
      setSearching(false);
    }
  };

  const displayed = results
    ? [...results]
        .filter(r => stopFilter === "all" ? true : stopFilter === "direct" ? r.stops === 0 : r.stops === 1)
        .filter(r => r.price <= maxPrice)
        .sort((a, b) => sortBy === "price" ? a.price - b.price : sortBy === "duration" ? a.duration.localeCompare(b.duration) : sortBy === "departure" ? a.depTime.localeCompare(b.depTime) : b.rating - a.rating)
    : [];

  const pax = adults + children + infants;

  const CounterRow = ({ label, sub, val, inc, dec, min = 0 }: { label: string; sub: string; val: number; inc: () => void; dec: () => void; min?: number }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <p style={{ color: "#0F172A", fontSize: 13, fontWeight: 600 }}>{label}</p>
        <p style={{ color: "#94A3B8", fontSize: 10, marginTop: 1 }}>{sub}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={dec} disabled={val <= min} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center", cursor: val <= min ? "not-allowed" : "pointer", opacity: val <= min ? 0.3 : 1, transition: "all 150ms" }}>
          <Minus size={11} />
        </button>
        <span style={{ color: "#0F172A", fontWeight: 800, fontSize: 14, width: 20, textAlign: "center" }}>{val}</span>
        <button onClick={inc} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #C7D2FE", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 150ms" }}>
          <Plus size={11} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="-mx-4 md:-mx-8 -mt-4 md:-mt-8">
      {/* Hero */}
      <div className="relative w-full flex flex-col items-center justify-center px-4 md:px-8 overflow-hidden"
        style={{ minHeight: results ? 140 : 200, background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", transition: "min-height 400ms ease" }}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8L37 22L52 22L41 32L45 47L30 38L15 47L19 32L8 22L23 22Z' fill='white'/%3E%3C/svg%3E")`, backgroundSize: "60px 60px" }} />
        <div style={{ position: "absolute", top: -50, right: -50, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.12)", filter: "blur(60px)", pointerEvents: "none" }} />

        {/* Trip type tabs */}
        <div className="flex gap-2 mb-4 relative z-10 mt-6">
          {["Round Trip", "One Way", "Multi City"].map((t) => (
            <button key={t} onClick={() => setTripType(t)}
              className={`px-3 md:px-5 py-2 rounded-full text-[12px] md:text-[13px] font-semibold transition-all ${
                tripType === t ? "bg-white text-[#4F46E5] shadow-lg" : "bg-white/15 text-white hover:bg-white/25"
              }`}>{t}</button>
          ))}
        </div>
        <p className="text-white/70 text-[13px] relative z-10 mb-6">Search across 500+ airlines worldwide</p>
      </div>

      {/* Search card — overlaps hero */}
      <div className="px-4 md:px-8 -mt-8 md:-mt-16 relative z-10 pb-8">
        <div className="max-w-[900px] mx-auto">
          <div className="bg-white rounded-[16px] md:rounded-[18px] shadow-[0_16px_48px_rgba(15,23,42,0.08)] border border-[#E2E8F0] p-5 md:p-8">

            {/* Route row */}
            <div className="flex items-stretch gap-2 md:gap-4 mb-4">
              <div className="flex-1 border border-[#E2E8F0] rounded-[10px] p-2.5 md:p-3 focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-[#4F46E5]/10 transition-all">
                <p className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wider mb-1">From</p>
                <input value={from} onChange={(e) => setFrom(e.target.value.toUpperCase())}
                  className="text-[28px] md:text-[42px] font-bold text-[#4F46E5] leading-none w-full focus:outline-none bg-transparent"
                  maxLength={3} />
                <p className="text-[10px] md:text-[12px] text-[#94A3B8] mt-1 truncate">{airportNames[from] || "Jinnah Intl Airport"}</p>
              </div>

              <button onClick={swap}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#EEF2FF] border-2 border-white flex items-center justify-center text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white transition-all shadow-md flex-shrink-0 self-center">
                <ArrowLeftRight size={14} />
              </button>

              <div className="flex-1 border border-[#E2E8F0] rounded-[10px] p-2.5 md:p-3 focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-[#4F46E5]/10 transition-all">
                <p className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wider mb-1">To</p>
                <input value={to} onChange={(e) => setTo(e.target.value.toUpperCase())}
                  className="text-[28px] md:text-[42px] font-bold text-[#4F46E5] leading-none w-full focus:outline-none bg-transparent"
                  maxLength={3} />
                <p className="text-[10px] md:text-[12px] text-[#94A3B8] mt-1 truncate">{airportNames[to] || "Dubai Intl Airport"}</p>
              </div>
            </div>

            {/* Date row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="border border-[#E2E8F0] rounded-[10px] px-4 flex items-center gap-3 h-12 md:h-14 focus-within:border-[#4F46E5] transition-colors">
                <Calendar size={16} className="text-[#94A3B8] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-[#94A3B8]">Depart</p>
                  <input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)}
                    className="text-[13px] font-semibold text-[#0F172A] focus:outline-none bg-transparent w-full" />
                </div>
              </div>
              <div className="border border-[#E2E8F0] rounded-[10px] px-4 flex items-center gap-3 h-12 md:h-14 focus-within:border-[#4F46E5] transition-colors">
                <Calendar size={16} className="text-[#94A3B8] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-[#94A3B8]">Return</p>
                  <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} disabled={tripType === "One Way"}
                    className="text-[13px] font-semibold text-[#0F172A] focus:outline-none bg-transparent w-full disabled:opacity-40" />
                </div>
              </div>
            </div>

            {/* Passengers + Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="border border-[#E2E8F0] rounded-[10px] px-4 py-3">
                <p className="text-[10px] text-[#94A3B8] mb-2 uppercase font-semibold tracking-wider">Passengers</p>
                <div className="space-y-3">
                  <CounterRow label="Adults"   sub="Age 12+"   val={adults}   inc={() => setAdults(a => Math.min(a+1,9))}   dec={() => setAdults(a => Math.max(a-1,1))}   min={1} />
                  <CounterRow label="Children" sub="Age 2–11"  val={children} inc={() => setChildren(c => Math.min(c+1,9))} dec={() => setChildren(c => Math.max(c-1,0))} />
                  <CounterRow label="Infants"  sub="Under 2"   val={infants}  inc={() => setInfants(i => Math.min(i+1,4))}  dec={() => setInfants(i => Math.max(i-1,0))}  />
                </div>
              </div>
              <div className="border border-[#E2E8F0] rounded-[10px] px-4 py-3">
                <p className="text-[10px] text-[#94A3B8] mb-3 uppercase font-semibold tracking-wider">Cabin Class</p>
                <div className="space-y-2">
                  {["Economy","Business","First"].map((cls) => (
                    <button key={cls} onClick={() => setCabinClass(cls)}
                      className={`w-full px-3 py-1.5 rounded-[8px] text-[13px] font-semibold text-left transition-all ${cabinClass === cls ? "bg-[#4F46E5] text-white" : "text-[#64748B] hover:bg-[#F8FAFC]"}`}>
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Promo */}
            <div className="mb-4">
              <button onClick={() => setPromoOpen(!promoOpen)}
                className="flex items-center gap-2 text-[13px] text-[#4F46E5] font-medium hover:underline">
                <Tag size={13} />
                Have a promo code? (Try AERO20 or KARACHI50)
                <ChevronDown size={12} className={`transition-transform ${promoOpen ? "rotate-180" : ""}`} />
              </button>
              {promoOpen && (
                <div className="mt-2">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter promo code (e.g. AERO20)" value={promoCode} onChange={e => setPromoCode(e.target.value)}
                      className="flex-1 h-9 px-4 rounded-[8px] border border-[#E2E8F0] text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                    <button onClick={applyPromo} className="px-4 h-9 rounded-[8px] bg-[#EEF2FF] text-[#4F46E5] text-[13px] font-semibold hover:bg-[#4F46E5] hover:text-white transition-colors">
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-[11px] mt-1.5 font-medium ${promoMessage.ok ? "text-[#16A34A]" : "text-[#EF4444]"}`}>
                      {promoMessage.text}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Search button */}
            <button onClick={() => search()} disabled={searching} style={{
              width: "100%", height: 52, borderRadius: 10, border: "none", cursor: searching ? "not-allowed" : "pointer",
              background: searching ? "rgba(79,70,229,0.35)" : "linear-gradient(135deg,#4F46E5,#7C3AED)",
              color: "white", fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: searching ? "none" : "0 4px 16px rgba(79,70,229,0.25)",
              transition: "all 150ms ease",
            }}
              onMouseEnter={e => { if (!searching) { (e.currentTarget as HTMLElement).style.transform = "scale(1.005)"; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              {searching ? (
                <><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: "spinPOS 0.75s linear infinite" }}><circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5"/><path d="M10 2a8 8 0 0 1 8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>Searching 500+ airlines…</>
              ) : (
                <><Search size={17} /> Search Flights</>
              )}
            </button>

            {/* Skeleton loader */}
            {searching && (
              <div className="mt-6 flex flex-col gap-3">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 animate-pulse shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-lg bg-[#E2E8F0]" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="height-3 bg-[#E2E8F0] rounded-md w-1/3 h-3" />
                        <div className="height-2.5 bg-[#E2E8F0] rounded-md w-1/5 h-2.5" />
                      </div>
                      <div className="height-8 w-20 bg-[#E2E8F0] rounded-md h-8" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Search Results */}
            {results && !searching && (
              <div className="mt-6" style={{ animation: "fadeInUp 350ms ease both" }}>
                
                {/* Results header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <div className="flex-1">
                    <p className="text-[#0F172A] text-[14px] font-bold">
                      {displayed.length} flights found
                      <span className="text-[#94A3B8] font-medium text-[12px] ml-2">{from} → {to} · {pax} pax · {cabinClass}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] rounded-full px-3 py-1.5 text-[#64748B] text-[11px] font-semibold">
                      <ArrowUpDown size={11} className="text-[#94A3B8]" />
                      <select value={sortBy} onChange={e => setSortBy(e.target.value as Sort)}
                        className="bg-transparent border-none outline-none text-[#64748B] text-[11px] font-semibold cursor-pointer">
                        <option value="price">Price</option>
                        <option value="duration">Duration</option>
                        <option value="departure">Departure</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                        showFilters ? "bg-[#4F46E5] border-[#4F46E5] text-white" : "bg-white border-[#E2E8F0] text-[#64748B]"
                      }`}>
                      <SlidersHorizontal size={11} /> Filters
                    </button>
                  </div>
                </div>

                {/* Filter panel */}
                {showFilters && (
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-5 mb-4 shadow-sm" style={{ animation: "fadeInUp 200ms ease both" }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <p className="text-[#94A3B8] text-[10px] font-bold uppercase tracking-wider mb-2.5">Stops</p>
                        <div className="flex gap-2 flex-wrap">
                          {([["all","All"],["direct","Direct"],["1stop","1 Stop"]] as [StopFilter,string][]).map(([v,l]) => (
                            <button key={v} onClick={() => setStopFilter(v)}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                                stopFilter === v ? "bg-[#4F46E5] border-[#4F46E5] text-white shadow-sm" : "bg-white border-[#E2E8F0] text-[#64748B]"
                              }`}>{l}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[#94A3B8] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                          Max Price: <span className="text-[#4F46E5] font-bold">${maxPrice}</span>
                        </p>
                        <input type="range" min={100} max={1200} step={20} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-[#4F46E5]" />
                        <div className="flex justify-between text-[#CBD5E1] text-[10px] mt-1 font-medium">
                          <span>$100</span><span>$1200</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Flight cards list */}
                <div className="flex flex-col gap-3">
                  {displayed.map(flight => {
                    const isSel = selected === flight.id;
                    const badge = flight.badge ? badgeColor[flight.badge] : null;
                    return (
                      <div key={flight.id} onClick={() => setSelected(isSel ? null : flight.id)}
                        className={`bg-white border transition-all duration-200 rounded-[14px] overflow-hidden cursor-pointer ${
                          isSel ? "border-[#4F46E5] shadow-md scale-[1.002]" : "border-[#E2E8F0] hover:border-[#4F46E5] hover:shadow-sm"
                        }`}
                      >
                        {/* Badge row */}
                        {flight.badge && badge && (
                          <div className="px-5 pt-3">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border"
                              style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}>
                              <Star size={9} fill="currentColor" /> {flight.badge}
                            </span>
                          </div>
                        )}

                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                            {/* Airline info */}
                            <div className="flex items-center gap-3 min-w-[150px] flex-shrink-0">
                              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[12px] font-extrabold text-white flex-shrink-0 shadow-sm"
                                style={{ background: flight.color }}>
                                {flight.logo}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[#0F172A] text-[13px] font-bold truncate">{flight.airline}</p>
                                <p className="text-[#94A3B8] text-[10px] font-medium mt-0.5">{flight.code}</p>
                              </div>
                            </div>

                            {/* Route & stops */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="text-center flex-shrink-0">
                                <p className="text-[#0F172A] text-[18px] font-extrabold leading-none">{flight.depTime}</p>
                                <p className="text-[#94A3B8] text-[10px] font-bold mt-1.5">{flight.dep}</p>
                              </div>
                              <div className="flex-1 flex flex-col items-center gap-1.5 px-2">
                                <p className="text-[#94A3B8] text-[9px] font-semibold flex items-center gap-1">
                                  <Clock size={9} />{flight.duration}
                                </p>
                                <div className="w-full flex items-center relative">
                                  <div className="flex-1 h-px bg-[#E2E8F0]" />
                                  {flight.stops > 0
                                    ? <div className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-[#F59E0B] bg-white" />
                                    : <Plane size={11} className="text-[#4F46E5] mx-1 flex-shrink-0" />
                                  }
                                  <div className="flex-1 h-px bg-[#E2E8F0]" />
                                </div>
                                <p className={`text-[9px] font-bold ${flight.stops === 0 ? "text-[#16A34A]" : "text-[#F59E0B]"}`}>
                                  {flight.stops === 0 ? "Non-stop" : `1 stop · ${flight.stopCity}`}
                                </p>
                              </div>
                              <div className="text-center flex-shrink-0">
                                <p className="text-[#0F172A] text-[18px] font-extrabold leading-none">{flight.arrTime}</p>
                                <p className="text-[#94A3B8] text-[10px] font-bold mt-1.5">{flight.arr}</p>
                              </div>
                            </div>

                            {/* Price and Action details */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between flex-shrink-0 min-w-[130px]">
                              <div className="sm:text-right">
                                {flight.oldPrice && <p className="text-[#CBD5E1] text-[11px] text-right line-through">${flight.oldPrice}</p>}
                                <p className="text-[#0F172A] text-[22px] font-extrabold leading-none">${flight.price}</p>
                                <p className="text-[#94A3B8] text-[10px] mt-1 font-medium">{flight.cls} · 1 Pax</p>
                              </div>
                              <div className="text-right mt-1">
                                <p className={`text-[10px] font-bold ${flight.seats <= 4 ? "text-[#EF4444]" : "text-[#16A34A]"}`}>
                                  {flight.seats <= 4 ? `⚡ Only ${flight.seats} left` : `${flight.seats} seats available`}
                                </p>
                                <div className="flex items-center gap-1 justify-end mt-1">
                                  <Star size={9} fill="#F59E0B" className="text-[#F59E0B]" />
                                  <span className="text-[#64748B] text-[10px] font-bold">{flight.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isSel && (
                          <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ animation: "fadeInUp 200ms ease both" }}>
                            <div className="flex flex-wrap gap-4 text-[#64748B] text-[11px] font-semibold">
                              <span className="flex items-center gap-1.5">
                                <Luggage size={13} className="text-[#4F46E5]" /> 7kg Cabin + 20kg Checked Luggage
                              </span>
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 size={13} className="text-[#22C55E]" /> Free cancellation within 24h
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                                {pax} Pax ({cabinClass})
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="sm:text-right">
                                <p className="text-[#94A3B8] text-[10px] font-medium">Total ({pax} Pax)</p>
                                <p className="text-[#4F46E5] text-[20px] font-extrabold leading-tight">
                                  ${(flight.price * pax).toLocaleString()}
                                </p>
                              </div>
                              <button onClick={e => {
                                e.stopPropagation();
                                onBookFlight({
                                  airline: flight.airline,
                                  code: flight.code,
                                  dep: flight.dep,
                                  arr: flight.arr,
                                  depTime: flight.depTime,
                                  arrTime: flight.arrTime,
                                  duration: flight.duration,
                                  stops: flight.stops,
                                  price: flight.price,
                                  cls: flight.cls || cabinClass,
                                  pax,
                                  date: departDate,
                                  promoDiscount,
                                });
                              }}
                                className="flex items-center gap-1 px-4 py-2 rounded-[8px] text-[12px] font-bold text-white shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
                                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                                Book Now <ChevronRight size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {displayed.length === 0 && (
                    <div className="bg-white border border-[#E2E8F0] rounded-[18px] p-12 text-center shadow-sm">
                      <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center mx-auto mb-4 text-[#4F46E5]">
                        <X size={22} />
                      </div>
                      <p className="text-[#0F172A] text-[14px] font-bold mb-1">No flights match your filters</p>
                      <p className="text-[#94A3B8] text-[12px] mb-4">Try adjusting the price range or stops filter</p>
                      <button onClick={() => { setStopFilter("all"); setMaxPrice(1200); }}
                        className="text-[#4F46E5] text-[12px] font-bold hover:underline">
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recent searches */}
          {!results && !searching && (
            <div className="mt-5">
              <p className="text-[12px] text-[#94A3B8] font-medium mb-2 uppercase tracking-wider">Recent Searches</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      const routePart = s.split("·")[0].trim();
                      const [rFrom, rTo] = routePart.split("→").map((x) => x.trim());
                      if (rFrom && rTo) {
                        setFrom(rFrom);
                        setTo(rTo);
                        search(rFrom, rTo);
                      }
                    }}
                    className="flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2 bg-white border border-[#E2E8F0] rounded-full text-[11px] md:text-[12px] text-[#64748B] hover:bg-[#EEF2FF] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spinPOS { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
