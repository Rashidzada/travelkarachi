import { useState, useRef } from "react";
import { Check, ChevronDown, Upload, ArrowRight, CheckCircle2 } from "lucide-react";
import { api, SelectedFlightContext } from "../../api";

const steps = ["Search", "Select", "Passengers", "Review", "Confirm"];

interface PassengerBookingFormProps {
  selectedFlight?: SelectedFlightContext | null;
  onBookingCreated?: () => void;
}

export function PassengerBookingForm({ selectedFlight, onBookingCreated }: PassengerBookingFormProps) {
  const [activeStep, setActiveStep] = useState(2);
  const [title, setTitle] = useState("Mr");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [nationality, setNationality] = useState("Pakistan");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("");
  const [gender, setGender] = useState("Male");
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [fareStickyOpen, setFareStickyOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const flight = selectedFlight || {
    airline: "Emirates",
    code: "EK-601",
    dep: "KHI",
    arr: "DXB",
    depTime: "06:30 AM",
    arrTime: "08:45 AM",
    duration: "2h 15m",
    stops: 0,
    price: 280,
    cls: "Economy",
    pax: 1,
    date: "Jun 15, 2026",
    promoDiscount: 10,
  };

  const baseFare = flight.price * (flight.pax || 1);
  const taxes = Math.round(baseFare * 0.2);
  const surcharge = 24;
  const discount = 12;
  const promo = flight.promoDiscount !== undefined ? flight.promoDiscount : 10;
  const totalAmount = Math.max(baseFare + taxes + surcharge - discount - promo, 50);

  const formatDisplayDate = (raw: string) => {
    if (!raw) return "Jun 15, 2026";
    if (raw.includes("-")) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
    }
    return raw;
  };

  const handleBookingSubmit = async (statusChoice: "Pending" | "Approved" = "Pending") => {
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter the passenger's First Name and Last Name.");
      return;
    }

    setSubmitting(true);
    try {
      const dob = dobDay && dobMonth && dobYear ? `${dobDay} ${dobMonth} ${dobYear}` : "";
      const formData = new FormData();
      formData.append("title", title);
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());
      formData.append("passenger", `${firstName.trim()} ${lastName.trim()}`);
      formData.append("dob", dob);
      formData.append("nationality", nationality || "Pakistan");
      formData.append("passport_number", passportNumber.trim() || "PK9283712");
      formData.append("passport_expiry", passportExpiry);
      formData.append("gender", gender);
      formData.append("origin", flight.dep);
      formData.append("destination", flight.arr);
      formData.append("route", `${flight.dep} → ${flight.arr}`);
      formData.append("airline", flight.airline);
      formData.append("flight_code", flight.code);
      formData.append("date", formatDisplayDate(flight.date));
      formData.append("cls", flight.cls);
      formData.append("pax_count", String(flight.pax || 1));
      formData.append("base_fare", String(baseFare));
      formData.append("taxes", String(taxes));
      formData.append("surcharge", String(surcharge));
      formData.append("discount", String(discount));
      formData.append("promo_discount", String(promo));
      formData.append("amount_value", String(totalAmount));
      formData.append("status", statusChoice);
      if (passportFile) {
        formData.append("passport_copy", passportFile);
      }

      const created = await api.createBooking(formData);
      setCreatedBooking(created);
      setActiveStep(4);
    } catch (err: any) {
      setError(err?.message || "Failed to save booking. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stepper */}
      <div className="bg-white border border-[#E2E8F0] rounded-[14px] px-4 md:px-8 py-4 md:py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-x-auto">
        <div className="flex items-center justify-between min-w-[340px] max-w-2xl mx-auto">
          {steps.map((step, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-[12px] md:text-[13px] font-semibold transition-all ${
                    done ? "bg-[#22C55E] text-white" : active ? "bg-[#4F46E5] text-white shadow-[0_0_0_4px_#EEF2FF]" : "bg-[#F1F5F9] text-[#94A3B8]"
                  }`}>
                    {done ? <Check size={14} strokeWidth={2.5} /> : i + 1}
                  </div>
                  <span className={`text-[10px] md:text-[11px] font-medium whitespace-nowrap ${active ? "text-[#4F46E5]" : done ? "text-[#22C55E]" : "text-[#94A3B8]"}`}>
                    {step}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-10 md:w-16 mx-2 mb-5 rounded-full ${i < activeStep ? "bg-[#22C55E]" : "bg-[#E2E8F0]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Banner if created */}
      {createdBooking && (
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[14px] p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#22C55E] text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#15803D]">
                Booking Confirmed in Database! Reference: <span className="underline">{createdBooking.ref}</span>
              </p>
              <p className="text-[12px] text-[#166534]">
                Passenger: {createdBooking.passenger} · {createdBooking.route} ({createdBooking.airline}) · Total: {createdBooking.amount}
              </p>
            </div>
          </div>
          {onBookingCreated && (
            <button
              onClick={onBookingCreated}
              className="px-4 py-2 rounded-[10px] bg-[#15803D] text-white text-[12px] font-semibold hover:bg-[#166534] transition-colors flex-shrink-0"
            >
              View in Flight Bookings →
            </button>
          )}
        </div>
      )}

      {/* Mobile: Fare summary toggle bar */}
      <div className="lg:hidden bg-white border border-[#E2E8F0] rounded-[12px] p-3 shadow-sm">
        <button onClick={() => setFareStickyOpen(!fareStickyOpen)}
          className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-[#0F172A]">Fare Summary</span>
            <span className="text-[12px] font-bold text-[#4F46E5]">${totalAmount.toFixed(2)}</span>
          </div>
          <ChevronDown size={16} className={`text-[#94A3B8] transition-transform ${fareStickyOpen ? "rotate-180" : ""}`} />
        </button>
        {fareStickyOpen && (
          <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-2">
            {[
              { label: "Base Fare", value: `$${baseFare.toFixed(2)}` },
              { label: "Taxes",     value: `$${taxes.toFixed(2)}`  },
              { label: "Surcharge", value: `$${surcharge.toFixed(2)}`  },
              { label: "Discount",  value: `-$${discount.toFixed(2)}` },
              { label: "Promo",     value: `-$${promo.toFixed(2)}` },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-[12px] text-[#64748B]">{row.label}</span>
                <span className={`text-[12px] font-medium ${row.value.startsWith("-") ? "text-[#22C55E]" : "text-[#0F172A]"}`}>{row.value}</span>
              </div>
            ))}
            <button
              onClick={() => handleBookingSubmit("Pending")}
              disabled={submitting}
              className="w-full h-10 mt-2 rounded-[10px] text-white font-semibold text-[13px] flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}
            >
              {submitting ? "Saving Booking…" : <>Continue to Review <ArrowRight size={14} /></>}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Form */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_8px_rgba(15,23,42,0.06)] overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#4F46E5] text-white text-[12px] font-bold flex items-center justify-center">1</div>
                <span className="text-[13px] md:text-[14px] font-semibold text-[#0F172A]">
                  Passenger 1 — Adult {flight.pax > 1 ? `(+${flight.pax - 1} accompanying)` : ""}
                </span>
              </div>
              <ChevronDown size={16} className="text-[#94A3B8]" />
            </div>

            <div className="px-4 md:px-6 py-4 md:py-5 space-y-4 md:space-y-5">
              {error && (
                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] text-[12px] font-medium px-4 py-2.5 rounded-[10px]">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">Title</label>
                <div className="flex gap-2 flex-wrap">
                  {["Mr","Mrs","Miss","Dr"].map((t) => (
                    <button key={t} type="button" onClick={() => setTitle(t)}
                      className={`px-3 md:px-4 py-2 rounded-[10px] text-[13px] font-medium border transition-all ${
                        title === t ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]" : "border-[#E2E8F0] text-[#64748B] hover:border-[#4F46E5]"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <FloatingInput label="First Name" placeholder="e.g. Sara" value={firstName} onChange={setFirstName} />
                <FloatingInput label="Last Name"  placeholder="e.g. Malik" value={lastName} onChange={setLastName} />
              </div>

              {/* DOB */}
              <div>
                <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">Date of Birth</label>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <SelectField placeholder="Day" value={dobDay} onChange={setDobDay} options={Array.from({length:31},(_,i)=>String(i+1).padStart(2,"0"))} />
                  <SelectField placeholder="Month" value={dobMonth} onChange={setDobMonth} options={["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]} />
                  <SelectField placeholder="Year" value={dobYear} onChange={setDobYear} options={Array.from({length:70},(_,i)=>String(2006-i))} />
                </div>
              </div>

              {/* Nationality + Passport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <SelectField label="Nationality" placeholder="Select country" value={nationality} onChange={setNationality} options={["Pakistan","UAE","United Kingdom","Saudi Arabia","USA","Germany"]} />
                <FloatingInput label="Passport Number" placeholder="e.g. AA1234567" value={passportNumber} onChange={setPassportNumber} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">Passport Expiry</label>
                  <input type="date"
                    value={passportExpiry}
                    onChange={(e) => setPassportExpiry(e.target.value)}
                    className="w-full h-[48px] md:h-[52px] px-4 rounded-[10px] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">Gender</label>
                  <div className="flex gap-2">
                    {["Male","Female"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`flex-1 h-[48px] md:h-[52px] rounded-[10px] border text-[13px] font-medium transition-all ${
                          gender === g
                            ? "border-[#4F46E5] text-[#4F46E5] bg-[#EEF2FF]"
                            : "border-[#E2E8F0] text-[#64748B] hover:border-[#4F46E5] hover:text-[#4F46E5] hover:bg-[#EEF2FF]"
                        }`}
                      >
                        {g === "Male" ? "♂ " : "♀ "}{g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upload */}
              <div>
                <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">Passport Copy</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E2E8F0] rounded-[10px] p-5 flex flex-col items-center gap-2 hover:border-[#4F46E5] hover:bg-[#F8FAFF] transition-all cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                    <Upload size={16} className="text-[#4F46E5]" />
                  </div>
                  <p className="text-[13px] font-medium text-[#0F172A] text-center">
                    {passportFile ? (
                      <span className="text-[#16A34A] font-semibold">Selected: {passportFile.name}</span>
                    ) : (
                      <>Drag here or <span className="text-[#4F46E5]">click to browse</span></>
                    )}
                  </p>
                  <p className="text-[11px] text-[#94A3B8]">JPG, PNG, PDF — max 5MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fare Summary — desktop only (sticky) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[18px] shadow-[0_8px_32px_rgba(15,23,42,0.12)] p-6 sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Fare Summary</h3>
              <span className="text-[11px] font-medium text-[#06B6D4] bg-[#ECFEFF] px-2 py-0.5 rounded-full border border-[#A5F3FC]">
                {flight.dep} → {flight.arr}
              </span>
            </div>

            {/* Flight mini-card */}
            <div className="bg-[#EEF2FF] rounded-[10px] p-3 mb-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-semibold text-[#4F46E5]">{flight.airline}</span>
                <span className="text-[11px] text-[#94A3B8]">{flight.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[16px] font-bold text-[#0F172A]">{flight.dep}</p>
                  <p className="text-[11px] text-[#94A3B8]">{flight.depTime}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[#94A3B8]">{flight.duration}</p>
                  <div className="flex items-center gap-1">
                    <div className="w-10 h-px bg-[#CBD5E1]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                  </div>
                  <p className="text-[10px] text-[#94A3B8]">{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}</p>
                </div>
                <div className="text-right">
                  <p className="text-[16px] font-bold text-[#0F172A]">{flight.arr}</p>
                  <p className="text-[11px] text-[#94A3B8]">{flight.arrTime}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-[#C7D2FE]">
                <span className="text-[11px] text-[#4F46E5] font-medium">
                  {flight.cls} · {formatDisplayDate(flight.date)} · {flight.pax || 1} Pax
                </span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-0">
              {[
                { label: `Base Fare (${flight.pax || 1} Pax)`, value: `$${baseFare.toFixed(2)}` },
                { label: "Taxes",     value: `$${taxes.toFixed(2)}`  },
                { label: "Surcharge", value: `$${surcharge.toFixed(2)}`  },
                { label: "Discount",  value: `-$${discount.toFixed(2)}` },
                { label: "Promo",     value: `-$${promo.toFixed(2)}` },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[13px] text-[#64748B]">{row.label}</span>
                    <span className={`text-[13px] font-medium ${row.value.startsWith("-") ? "text-[#22C55E]" : "text-[#0F172A]"}`}>{row.value}</span>
                  </div>
                  {i < arr.length - 1 && <div className="border-t border-dashed border-[#E2E8F0]" />}
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[#E2E8F0] mt-3 pt-4 flex items-center justify-between">
              <span className="text-[14px] font-semibold text-[#0F172A]">Total</span>
              <span className="text-2xl font-bold text-[#4F46E5]">${totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={() => handleBookingSubmit("Approved")}
              disabled={submitting}
              className="w-full h-[52px] rounded-[10px] text-white font-semibold text-[14px] flex items-center justify-center gap-2 mt-5 hover:shadow-xl transition-all hover:scale-[1.01] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}
            >
              {submitting ? "Creating Booking…" : <>Confirm & Issue Booking <ArrowRight size={16} /></>}
            </button>
            <button
              onClick={() => handleBookingSubmit("Pending")}
              disabled={submitting}
              className="w-full h-10 mt-2 rounded-[10px] border border-[#E2E8F0] text-[13px] font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
            >
              Save as Pending Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (val: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full px-4 rounded-[10px] border border-[#E2E8F0] text-[13px] text-[#0F172A] placeholder-[#CBD5E1] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 transition-all"
        style={{ height: 48 }}
      />
    </div>
  );
}

function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label?: string;
  placeholder: string;
  options: string[];
  value?: string;
  onChange?: (val: string) => void;
}) {
  return (
    <div>
      {label && <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="w-full px-4 pr-8 rounded-[10px] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 transition-all appearance-none bg-white"
          style={{ height: 48 }}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
      </div>
    </div>
  );
}
