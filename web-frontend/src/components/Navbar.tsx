import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
  onNavigate?: (route: string) => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName = 'My Profile',
  onLogout,
  onNavigate: externalNavigate,
  onOpenAuth,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const onNavigate = (route: string) => {
    if (externalNavigate) {
      externalNavigate(route);
    } else {
      window.location.href = route;
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(212,175,55,0.15)] bg-[#030407]/85 backdrop-blur-2xl px-4 sm:px-8 py-3 text-white transition-all shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Monogram */}
        <div className="flex items-center gap-8">
          <div 
            onClick={() => onNavigate('/')} 
            className="group flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1A2234] to-[#0B0F19] border border-[#D4AF37]/50 text-[#F5ECCB] font-serif font-black text-base shadow-[0_0_20px_rgba(212,175,55,0.25)] group-hover:shadow-[0_0_28px_rgba(212,175,55,0.45)] group-hover:border-[#F3C649] transition-all duration-300">
              <span className="text-gold-gradient">K</span>
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
            </div>
            <div>
              <span className="font-serif tracking-[0.2em] font-bold uppercase text-base text-white group-hover:text-[#F3C649] transition">
                KSHURAK
              </span>
              <span className="block text-[8px] tracking-[0.3em] font-mono text-[#D4AF37]/80 uppercase">
                AI SALON OS // ATELIER
              </span>
            </div>
          </div>

          {/* Cleaned Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium tracking-wide text-white/70">
            {[
              { label: 'Diagnostic Quiz', route: '/quiz' },
              { label: 'Face Scanner', route: '/face-scan' },
              { label: 'Try-On Lab', route: '/try-on' },
              { label: 'Find Sanctuary', route: '/barbers' },
              { label: 'Slot Booking', route: '/booking' },
              { label: 'Live Queue', route: '/live-queue' },
            ].map((item) => (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className="px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 border border-transparent transition-all duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile & Account Dropdown & Book Now */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-[#0C101A]/90 px-3.5 py-1.5 text-xs text-white hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition duration-200"
            >
              <span className="h-2 w-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
              <span className="capitalize font-medium tracking-wide text-slate-100">{userName}</span>
              <span className="text-[10px] text-[#D4AF37] opacity-80 ml-0.5">⌵</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-56 rounded-2xl border border-[#D4AF37]/30 bg-[#080C16]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">Active Account</div>
                  <div className="text-xs font-bold text-white truncate">{userName}</div>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigate('/profiles');
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-[#D4AF37]/15 hover:text-[#F3C649] transition flex items-center justify-between"
                >
                  <span>Manage Profiles & Family</span>
                  <span className="text-xs text-[#D4AF37]">→</span>
                </button>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-gold-300 hover:bg-[#D4AF37]/10 transition"
                  >
                    Partner Portal
                  </button>
                )}
                <hr className="my-1 border-[rgba(212,175,55,0.15)]" />
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                >
                  Sign Out of Atelier
                </button>
              </div>
            )}
          </div>

          {/* Book Now Button */}
          <button
            onClick={() => onNavigate('/booking')}
            className="rounded-full bg-gradient-to-r from-[#F5ECCB] via-[#E0C566] to-[#D4AF37] hover:from-[#FFF4D0] hover:to-[#E5C058] text-[#0A0D14] px-4 sm:px-5 py-1.5 text-xs font-bold tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_28px_rgba(212,175,55,0.5)] flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span>Book Now</span>
            <span className="text-xs">→</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
