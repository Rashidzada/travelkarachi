import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { LoginPage } from "./components/LoginPage";
import { LayoutDashboard, Plane, Users, BarChart3, Settings, CheckCircle2 } from "lucide-react";
import { Dashboard } from "./components/dashboard/Dashboard";
import { FlightBookings } from "./components/bookings/FlightBookings";
import { FlightPOS } from "./components/pos/FlightPOS";
import { PassengerBookingForm } from "./components/booking-form/PassengerBookingForm";
import { SegmentManagement } from "./components/segments/SegmentManagement";
import { SubAgentManagement } from "./components/agents/SubAgentManagement";
import { api, AuthUser, clearAuthSession, getAuthToken, getStoredUser, SelectedFlightContext } from "./api";

type Screen =
  | "dashboard"
  | "flight-bookings"
  | "flight-management"
  | "flight-pos"
  | "segment-management"
  | "sub-agents"
  | "reports"
  | "settings";

const screenMeta: Record<Screen, { breadcrumb: string; page: string }> = {
  dashboard:            { breadcrumb: "AeroDesk",   page: "Dashboard"          },
  "flight-bookings":    { breadcrumb: "Flights",    page: "Flight Bookings"    },
  "flight-management":  { breadcrumb: "Flights",    page: "Passenger Booking"  },
  "flight-pos":         { breadcrumb: "Flights",    page: "Flight POS"         },
  "segment-management": { breadcrumb: "Flights",    page: "Segment Management" },
  "sub-agents":         { breadcrumb: "Management", page: "Sub Agents"         },
  reports:              { breadcrumb: "AeroDesk",   page: "Reports"            },
  settings:             { breadcrumb: "AeroDesk",   page: "Settings"           },
};

function ReportsScreen() {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    api.getReports().then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white border border-[#E2E8F0] rounded-[18px] shadow-[0_2px_8px_rgba(15,23,42,0.06)] gap-3">
        <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center text-2xl">📊</div>
        <p className="text-[16px] font-semibold text-[#0F172A]">Loading Analytics…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[#0F172A]">Analytics & Financial Reports</h1>
          <p className="text-[13px] text-[#94A3B8]">Live database aggregation across airlines and booking statuses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[18px] p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
          <h3 className="text-[15px] font-bold text-[#0F172A] mb-4">Revenue by Airline</h3>
          <div className="space-y-3">
            {data.airline_breakdown?.map((item: any) => (
              <div key={item.airline} className="flex items-center justify-between border-b border-dashed border-[#E2E8F0] pb-2.5">
                <div>
                  <p className="text-[13px] font-semibold text-[#0F172A]">{item.airline}</p>
                  <p className="text-[11px] text-[#94A3B8]">{item.bookings} bookings</p>
                </div>
                <span className="text-[14px] font-bold text-[#4F46E5]">${Number(item.revenue).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[18px] p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
          <h3 className="text-[15px] font-bold text-[#0F172A] mb-4">Bookings by Status</h3>
          <div className="space-y-3">
            {data.status_breakdown?.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between border-b border-dashed border-[#E2E8F0] pb-2.5">
                <span className="text-[13px] font-semibold text-[#0F172A]">{item.status}</span>
                <span className="px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[12px] font-bold">
                  {item.count} records
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsScreen() {
  const [settings, setSettings] = useState<any>({
    agency_name: "AeroDesk Travel Karachi",
    support_email: "ops@aerodesk.pk",
    support_phone: "+92-21-35880011",
    default_currency: "USD",
    default_origin: "KHI",
    tax_percentage: "14.50",
    auto_approve_under: "500.00",
    email_notifications: true,
    gds_live_sync: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then((res) => {
        if (res.settings) setSettings(res.settings);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateSettings(settings);
      if (res.settings) setSettings(res.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-[#0F172A]">Platform Settings</h1>
        <p className="text-[13px] text-[#94A3B8]">Configure agency defaults stored in the Django database</p>
      </div>

      {saved && (
        <div className="bg-[#F0FDF4] border border-[#86EFAC] text-[#15803D] px-4 py-3 rounded-[12px] text-[13px] font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} /> Settings saved to Django database!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-[#E2E8F0] rounded-[18px] p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1.5">Agency Name</label>
            <input value={settings.agency_name || ""} onChange={(e) => setSettings({ ...settings, agency_name: e.target.value })}
              className="w-full h-11 px-3.5 rounded-[10px] border border-[#E2E8F0] text-[13px]" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1.5">Support Email</label>
            <input value={settings.support_email || ""} onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              className="w-full h-11 px-3.5 rounded-[10px] border border-[#E2E8F0] text-[13px]" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1.5">Support Phone</label>
            <input value={settings.support_phone || ""} onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
              className="w-full h-11 px-3.5 rounded-[10px] border border-[#E2E8F0] text-[13px]" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] uppercase block mb-1.5">Default Hub (IATA)</label>
            <input value={settings.default_origin || ""} onChange={(e) => setSettings({ ...settings, default_origin: e.target.value.toUpperCase() })} maxLength={3}
              className="w-full h-11 px-3.5 rounded-[10px] border border-[#E2E8F0] text-[13px] font-bold" />
          </div>
        </div>
        <div className="pt-2">
          <button type="submit" className="px-6 h-11 rounded-[10px] text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  const [user, setUser]                           = useState<AuthUser | null>(() => getStoredUser());
  const [isLoggedIn, setIsLoggedIn]               = useState<boolean>(() => Boolean(getAuthToken()));
  const [screen, setScreen]                       = useState<Screen>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedFlight, setSelectedFlight]       = useState<SelectedFlightContext | null>(null);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    clearAuthSession();
    setUser(null);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={(loggedInUser) => {
          if (loggedInUser) setUser(loggedInUser);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  const meta        = screenMeta[screen];
  const isFullBleed = screen === "flight-pos";

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":
        return <Dashboard onNavigate={(s) => setScreen(s as Screen)} />;
      case "flight-bookings":
        return <FlightBookings onNewBooking={() => setScreen("flight-pos")} />;
      case "flight-pos":
        return (
          <FlightPOS
            onBookFlight={(flightCtx) => {
              if (flightCtx) setSelectedFlight(flightCtx);
              setScreen("flight-management");
            }}
          />
        );
      case "flight-management":
        return (
          <PassengerBookingForm
            selectedFlight={selectedFlight}
            onBookingCreated={() => setScreen("flight-bookings")}
          />
        );
      case "segment-management":
        return <SegmentManagement />;
      case "sub-agents":
        return <SubAgentManagement />;
      case "reports":
        return <ReportsScreen />;
      case "settings":
        return <SettingsScreen />;
      default:
        return <Dashboard onNavigate={(s) => setScreen(s as Screen)} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      {/* Sidebar — desktop always visible, mobile as drawer */}
      <Sidebar
        activeScreen={screen}
        onNavigate={(s) => setScreen(s as Screen)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar
          breadcrumb={meta.breadcrumb}
          page={meta.page}
          onMenuClick={() => setMobileSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        <main
          className={`flex-1 overflow-y-auto ${isFullBleed ? "p-0" : "p-4 md:p-8"} pb-[72px] md:pb-0`}
          style={{ scrollbarWidth: "thin", scrollbarColor: "#E2E8F0 transparent" }}
        >
          {renderScreen()}
        </main>
      </div>

      {/* ── Mobile bottom navigation bar ─────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid #E2E8F0",
          paddingBottom: "env(safe-area-inset-bottom)",
          height: "calc(60px + env(safe-area-inset-bottom))",
        }}
      >
        {([
          { icon: <LayoutDashboard size={22} />, label: "Home",     screens: ["dashboard"]                                                              },
          { icon: <Plane size={22} />,           label: "Flights",  screens: ["flight-bookings","flight-pos","segment-management"]   },
          { icon: <Users size={22} />,           label: "Agents",   screens: ["sub-agents"]                                                             },
          { icon: <BarChart3 size={22} />,       label: "Reports",  screens: ["reports"]                                                                },
          { icon: <Settings size={22} />,        label: "Settings", screens: ["settings"]                                                               },
        ] as { icon: React.ReactNode; label: string; screens: Screen[] }[]).map((item) => {
          const active = item.screens.includes(screen);
          // tapping Flights opens drawer so user can pick a sub-page
          const handleTap = () => {
            if (item.label === "Flights") {
              setMobileSidebarOpen(true);
            } else {
              setScreen(item.screens[0]);
            }
          };
          return (
            <button
              key={item.label}
              onClick={handleTap}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-all active:scale-95"
            >
              {/* Active top pill indicator */}
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full"
                  style={{ background: "linear-gradient(90deg,#4F46E5,#7C3AED)" }}
                />
              )}
              {/* Icon */}
              <span
                className="transition-all duration-150"
                style={{
                  color: active ? "#4F46E5" : "#94A3B8",
                  filter: active ? "drop-shadow(0 0 6px rgba(79,70,229,0.3))" : "none",
                  transform: active ? "translateY(-1px)" : "translateY(0)",
                }}
              >
                {item.icon}
              </span>
              {/* Label */}
              <span
                className="text-[10px] font-semibold tracking-wide transition-colors duration-150"
                style={{ color: active ? "#4F46E5" : "#94A3B8" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
