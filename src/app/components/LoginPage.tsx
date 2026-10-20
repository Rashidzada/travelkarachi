import { useState, useEffect } from "react";
import { Eye, EyeOff, Plane, ArrowRight, Lock, Mail, CheckCircle2 } from "lucide-react";
import { api, AuthUser, setAuthSession } from "../api";

interface LoginPageProps {
  onLogin: (user?: AuthUser) => void;
}

const ORB_CONFIG = [
  { size: 480, top: "-10%", left: "-8%",  color: "rgba(79,70,229,0.06)",  dur: 22 },
  { size: 360, top: "55%",  left: "60%",  color: "rgba(124,58,237,0.05)", dur: 28 },
  { size: 280, top: "20%",  left: "70%",  color: "rgba(6,182,212,0.04)",  dur: 18 },
  { size: 220, top: "75%",  left: "10%",  color: "rgba(167,139,250,0.05)",dur: 24 },
  { size: 180, top: "35%",  left: "40%",  color: "rgba(16,185,129,0.03)", dur: 32 },
];

const STATS = [
  { value: "500+",  label: "Airlines Connected" },
  { value: "2.4M+", label: "Bookings Processed" },
  { value: "127",   label: "Active Agents" },
  { value: "99.9%", label: "Platform Uptime" },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail]               = useState("admin@aerodesk.io");
  const [password, setPassword]         = useState("adminpassword123");
  const [showPass, setShowPass]         = useState(false);
  const [remember, setRemember]         = useState(true);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [mounted, setMounted]           = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your credentials to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setAuthSession(res.token, res.user);
      setLoading(false);
      onLogin(res.user);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Unable to sign in. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative" style={{ background: "linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)" }}>

      {/* Animated background orbs */}
      {ORB_CONFIG.map((orb, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: orb.size, height: orb.size,
            borderRadius: "50%",
            background: orb.color,
            filter: "blur(80px)",
            top: orb.top, left: orb.left,
            animation: `floatOrb${i % 3} ${orb.dur}s ease-in-out infinite`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg,rgba(15,23,42,0.03) 1px,transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* ── Left panel (desktop only) ──────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative z-10"
        style={{
          width: 520, flexShrink: 0,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateX(0)" : "translateX(-30px)",
          transition: "opacity 600ms ease, transform 600ms ease",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(79,70,229,0.25)",
          }}>
            <Plane size={20} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ color: "#0F172A", fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>AeroDesk</p>
            <p style={{ color: "#94A3B8", fontSize: 10, letterSpacing: "0.1em", fontWeight: 600 }}>FLIGHT MANAGEMENT</p>
          </div>
        </div>

        {/* Center copy */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 0" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.18)",
            borderRadius: 20, padding: "5px 14px", marginBottom: 28, width: "fit-content",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px rgba(16,185,129,0.6)", display: "inline-block" }} />
            <span style={{ color: "#64748B", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>ALL SYSTEMS OPERATIONAL</span>
          </div>

          <h2 style={{
            color: "#0F172A", fontSize: 42, fontWeight: 900, lineHeight: 1.1,
            letterSpacing: "-0.04em", marginBottom: 20,
          }}>
            The future<br />of{" "}
            <span style={{ background: "linear-gradient(90deg, #4F46E5, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              travel ops
            </span>
          </h2>
          <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.7, maxWidth: 360 }}>
            A unified platform for airlines, travel agents, and booking professionals. Streamline operations, manage agents, and grow revenue.
          </p>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 44 }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                background: "#ffffff", border: "1px solid #E2E8F0",
                borderRadius: 16, padding: "18px 20px", boxShadow: "0 4px 16px rgba(15,23,42,0.03)"
              }}>
                <p style={{ color: "#4F46E5", fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</p>
                <p style={{ color: "#64748B", fontSize: 11, marginTop: 6 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 24 }}>
          <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
            "AeroDesk transformed how we manage 200+ daily flight bookings. It's the gold standard."
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "white",
            }}>FK</div>
            <div>
              <p style={{ color: "#0F172A", fontSize: 13, fontWeight: 600 }}>Falcon Travels</p>
              <p style={{ color: "#94A3B8", fontSize: 11 }}>Top Agency · Karachi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider line */}
      <div className="hidden lg:block" style={{
        width: 1, alignSelf: "stretch", margin: "40px 0",
        background: "linear-gradient(180deg, transparent, #E2E8F0 30%, #E2E8F0 70%, transparent)",
      }} />

      {/* ── Right panel — login form ──────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-5 sm:px-10 py-12 relative z-10"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 600ms ease 150ms, transform 600ms cubic-bezier(0.34,1.2,0.64,1) 150ms",
        }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(79,70,229,0.25)" }}>
            <Plane size={18} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ color: "#0F172A", fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>AeroDesk</span>
        </div>

        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ color: "#0F172A", fontSize: 30, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 10 }}>
              Welcome back
            </h1>
            <p style={{ color: "#64748B", fontSize: 14 }}>
              Sign in to your AeroDesk workspace
            </p>
          </div>

          {/* White card */}
          <div style={{
            background: "#ffffff",
            border: "1px solid #E2E8F0",
            borderRadius: 24, padding: 32,
            boxShadow: "0 16px 48px rgba(15,23,42,0.06)",
          }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Email */}
              <div>
                <label style={{ display: "block", color: "#64748B", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focusedField === "email" ? "#4F46E5" : "#94A3B8", transition: "color 150ms", pointerEvents: "none" }} />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="admin@aerodesk.io"
                    autoComplete="email"
                    style={{
                      width: "100%", height: 48, paddingLeft: 42, paddingRight: 16, boxSizing: "border-box",
                      background: focusedField === "email" ? "rgba(79,70,229,0.03)" : "#F8FAFC",
                      border: `1.5px solid ${focusedField === "email" ? "#4F46E5" : "#E2E8F0"}`,
                      borderRadius: 12, color: "#0F172A", fontSize: 14, outline: "none",
                      transition: "border-color 150ms ease, background 150ms ease",
                      boxShadow: focusedField === "email" ? "0 0 0 3px rgba(79,70,229,0.08)" : "none",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ color: "#64748B", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Password
                  </label>
                  <button type="button" style={{ color: "#4F46E5", fontSize: 12, fontWeight: 600, background: "none", border: "none", cursor: "pointer", transition: "color 150ms" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#3730A3")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#4F46E5")}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focusedField === "pass" ? "#4F46E5" : "#94A3B8", transition: "color 150ms", pointerEvents: "none" }} />
                  <input
                    type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("pass")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    style={{
                      width: "100%", height: 48, paddingLeft: 42, paddingRight: 46, boxSizing: "border-box",
                      background: focusedField === "pass" ? "rgba(79,70,229,0.03)" : "#F8FAFC",
                      border: `1.5px solid ${focusedField === "pass" ? "#4F46E5" : "#E2E8F0"}`,
                      borderRadius: 12, color: "#0F172A", fontSize: 14, outline: "none",
                      transition: "border-color 150ms ease, background 150ms ease",
                      boxShadow: focusedField === "pass" ? "0 0 0 3px rgba(79,70,229,0.08)" : "none",
                    }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 4,
                    transition: "color 150ms",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#64748B")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button type="button" onClick={() => setRemember(!remember)} style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: "pointer",
                  border: remember ? "none" : "1.5px solid #CBD5E1",
                  background: remember ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "#F8FAFC",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 150ms ease",
                  boxShadow: remember ? "0 4px 12px rgba(79,70,229,0.25)" : "none",
                }}>
                  {remember && <CheckCircle2 size={13} color="white" strokeWidth={2.5} />}
                </button>
                <span style={{ color: "#64748B", fontSize: 13 }}>Remember me for 30 days</span>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
                  borderRadius: 10, padding: "10px 14px", color: "#EF4444", fontSize: 13,
                }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} style={{
                height: 52, borderRadius: 13,
                background: loading ? "rgba(79,70,229,0.4)" : "linear-gradient(135deg,#4F46E5,#7C3AED)",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                color: "white", fontSize: 15, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                boxShadow: loading ? "none" : "0 4px 16px rgba(79,70,229,0.25)",
                transition: "all 200ms ease",
                letterSpacing: "-0.01em",
              }}
                onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(79,70,229,0.35)"; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = loading ? "none" : "0 4px 16px rgba(79,70,229,0.25)"; }}
              >
                {loading ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: "spinAero 0.75s linear infinite" }}>
                    <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
                    <path d="M10 2a8 8 0 0 1 8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <>Sign in to AeroDesk <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </div>

          {/* Demo hint */}
          <p style={{ textAlign: "center", color: "#94A3B8", fontSize: 12, marginTop: 24 }}>
            Connected to Django API · Default: admin@aerodesk.io / adminpassword123
          </p>
        </div>
      </div>

      <style>{`
        @keyframes floatOrb0 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,-30px) scale(1.08); } 66% { transform: translate(-20px,20px) scale(0.95); } }
        @keyframes floatOrb1 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-35px,25px) scale(1.06); } 66% { transform: translate(25px,-15px) scale(0.97); } }
        @keyframes floatOrb2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,30px) scale(1.05); } }
        @keyframes spinAero { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #CBD5E1 !important; }
      `}</style>
    </div>
  );
}
