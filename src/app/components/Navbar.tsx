import { useState } from "react";
import { Bell, Search, ChevronDown, Globe, X, Menu, LogOut } from "lucide-react";
import { AuthUser } from "../api";

interface NavbarProps {
  breadcrumb: string;
  page: string;
  onMenuClick: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
}

export function Navbar({ breadcrumb, page, onMenuClick, user, onLogout }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-14 md:h-16 bg-white border-b border-[#E2E8F0] flex items-center px-4 md:px-8 gap-3 flex-shrink-0 relative z-30">

      {/* Hamburger — mobile only */}
      {!searchOpen && (
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-[10px] text-[#0F172A] hover:bg-[#F1F5F9] active:bg-[#E2E8F0] transition-colors flex-shrink-0"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Breadcrumb */}
      {!searchOpen && (
        <div className="flex items-center gap-1.5 text-sm flex-shrink-0 min-w-0">
          <span className="text-[#94A3B8] hidden sm:inline truncate">{breadcrumb}</span>
          <span className="text-[#94A3B8] hidden sm:inline">/</span>
          <span className="text-[#0F172A] font-semibold truncate">{page}</span>
        </div>
      )}

      {/* Desktop search */}
      <div className="flex-1 hidden md:flex justify-center">
        <div className="relative w-[360px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search bookings, agents, flights…"
            className="w-full h-9 pl-9 pr-4 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 transition-all"
          />
        </div>
      </div>

      {/* Mobile inline search */}
      {searchOpen && (
        <div className="flex-1 flex items-center gap-2 md:hidden">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              autoFocus
              type="text"
              placeholder="Search…"
              className="w-full h-9 pl-8 pr-3 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
          <button
            onClick={() => setSearchOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748B] hover:bg-[#F8FAFC]"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0 ml-auto">
        {/* Search trigger — mobile */}
        {!searchOpen && (
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC]"
          >
            <Search size={17} />
          </button>
        )}

        {/* Language — desktop */}
        <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#94A3B8] hover:bg-[#F8FAFC] transition-colors text-sm">
          <Globe size={15} /><span>EN</span><ChevronDown size={12} />
        </button>

        {/* Bell */}
        <button className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
          <Bell size={17} />
          <span className="absolute top-1 right-1 md:top-1.5 md:right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
        </button>

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 pl-1 pr-2 md:pr-3 py-1 rounded-lg hover:bg-[#F8FAFC] transition-colors"
          >
            <div
              className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}
            >
              {user?.initials || "AM"}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-[#0F172A]">{user?.name || "Admin User"}</p>
              <p className="text-[11px] text-[#94A3B8]">{user?.role || "Super Admin"}</p>
            </div>
            <ChevronDown size={13} className="text-[#94A3B8] hidden md:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-[12px] shadow-lg py-1.5 z-50">
              <div className="px-3 py-2 border-b border-[#F1F5F9]">
                <p className="text-[12px] font-semibold text-[#0F172A] truncate">{user?.name || "Admin User"}</p>
                <p className="text-[11px] text-[#94A3B8] truncate">{user?.email || "admin@aerodesk.io"}</p>
              </div>
              {onLogout && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                >
                  <LogOut size={14} /> Sign out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
