import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface FooterProps {
  onNavigate?: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate: externalNavigate }) => {
  let routerNavigate: any;
  try {
    routerNavigate = useNavigate();
  } catch {}

  const onNavigate =
    externalNavigate ||
    routerNavigate ||
    ((route: string) => {
      window.location.href = route;
    });

  return (
    <footer className="relative bg-[#020408] text-white border-t border-[#D4AF37]/25 overflow-hidden select-none">
      
      {/* Dynamic Golden Fluid Wave / Caustic Lights in Background */}
      <div className="pointer-events-none absolute -right-20 top-0 w-[550px] h-[350px] bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.18)_0%,transparent_65%)] blur-[80px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 w-[450px] h-[250px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.08)_0%,transparent_65%)] blur-[80px]" />

      {/* Decorative Gold Flowing Curved Accent Ribbon on Right */}
      <svg 
        className="pointer-events-none absolute right-0 top-0 h-full w-[45%] opacity-35" 
        viewBox="0 0 500 300" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path 
          d="M 500,0 C 400,80 320,160 380,240 C 420,290 480,290 500,300 L 500,0 Z" 
          fill="url(#goldGradientWave)" 
        />
        <path 
          d="M 500,0 C 400,80 320,160 380,240 C 420,290 480,290 500,300" 
          stroke="url(#goldStrokeWave)" 
          strokeWidth="1.5" 
        />
        <defs>
          <linearGradient id="goldGradientWave" x1="500" y1="0" x2="350" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F3CF65" stopOpacity="0.25" />
            <stop offset="0.7" stopColor="#D4AF37" stopOpacity="0.05" />
            <stop offset="1" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="goldStrokeWave" x1="500" y1="0" x2="350" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFE79A" stopOpacity="0.8" />
            <stop offset="0.5" stopColor="#D4AF37" stopOpacity="0.5" />
            <stop offset="1" stopColor="#A88424" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom Corner Dot-Matrix Grid Accents */}
      <div className="pointer-events-none absolute bottom-12 left-4 w-28 h-20 opacity-20 flex flex-wrap gap-2">
        {Array.from({ length: 48 }).map((_, i) => (
          <span key={i} className="w-[1.5px] h-[1.5px] rounded-full bg-[#D4AF37]" />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-12 right-4 w-28 h-20 opacity-20 flex flex-wrap gap-2 justify-end">
        {Array.from({ length: 48 }).map((_, i) => (
          <span key={i} className="w-[1.5px] h-[1.5px] rounded-full bg-[#D4AF37]" />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-8 relative z-10">
        
        {/* ============================================================ */}
        {/* 1. THREE MAIN COLUMNS                                        */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 pb-14">
          
          {/* ========================================================== */}
          {/* COLUMN 1: BRAND IDENTITY & TELEMETRY (Col span 5)          */}
          {/* ========================================================== */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Logo + Title */}
            <div 
              className="flex items-center gap-3.5 cursor-pointer group" 
              onClick={() => onNavigate('/')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D4AF37]/60 bg-gradient-to-br from-[#1B2236] to-[#0A0D15] shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:border-[#F3CF65] transition-all duration-300">
                <span className="font-serif text-[#F3CF65] font-black text-lg">K</span>
              </div>
              <div>
                <span className="font-cinzel tracking-[0.25em] font-bold uppercase text-lg text-white block">
                  KSHURAK
                </span>
                <span className="text-[8.5px] tracking-[0.25em] font-mono text-[#D4AF37] uppercase font-bold block mt-0.5">
                  AI SALON OS // VIBE SOLUTIONING
                </span>
              </div>
            </div>

            {/* Description Paragraph */}
            <p className="text-xs text-slate-300/85 max-w-sm leading-relaxed font-normal">
              The deterministic AI operating system for modern grooming sanctuaries. Delivering real-time facial landmark telemetry, FLUX generative 3D previews, and verified in-chair escrow slots.
            </p>

            {/* Active Telemetry Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#06080E]/90 px-4 py-1.5 text-[10px] font-mono font-semibold text-[#F3CF65] shadow-[0_0_15px_rgba(212,175,55,0.18)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F3CF65] animate-pulse shadow-[0_0_6px_#F3CF65]" />
              <span>ATELIER ONLINE // 468 BIOMETRIC VECTORS ACTIVE</span>
            </div>

            {/* Micro Tagline */}
            <div className="flex items-center gap-3 pt-2 text-slate-500 font-mono text-[9px] uppercase tracking-[0.25em]">
              <span>PRECISION × PRIVACY × PERSONAL STYLE</span>
              <span className="flex-1 h-[1px] bg-gradient-to-r from-slate-700/60 to-transparent max-w-[100px]" />
            </div>

          </div>

          {/* ========================================================== */}
          {/* COLUMN 2: ATELIER SERVICES (Col span 3)                    */}
          {/* ========================================================== */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Atelier Services
            </h4>
            
            <ul className="space-y-2 font-sans text-xs">
              {[
                { label: 'Diagnostic Hair Quiz', route: '/quiz' },
                { label: 'Face Mesh Scanner', route: '/face-scan' },
                { label: 'Virtual Try-On Lab', route: '/try-on' },
                { label: 'Find Sanctuary', route: '/barbers' },
                { label: 'Slot Booking & Escrow', route: '/booking' },
                { label: 'Live Queue Telemetry', route: '/live-queue' },
              ].map((item) => (
                <li key={item.route}>
                  <button 
                    onClick={() => onNavigate(item.route)} 
                    className="w-full flex items-center justify-between text-slate-300/90 hover:text-[#F3CF65] py-0.5 group transition-colors duration-200"
                  >
                    <span>{item.label}</span>
                    <span className="text-slate-500 group-hover:text-[#F3CF65] group-hover:translate-x-1 transition-all text-xs font-mono font-bold">
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ========================================================== */}
          {/* COLUMN 3: ZERO-CLOUD PRIVACY (Col span 4)                  */}
          {/* ========================================================== */}
          <div className="md:col-span-4 space-y-3.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Zero-Cloud Privacy
            </h4>
            
            <p className="text-xs text-slate-300/85 leading-relaxed font-normal max-w-sm">
              All facial coordinates are computed in transient browser memory with MediaPipe client-side mesh. No raw photographic data is persisted on cloud databases without permission.
            </p>

            {/* Privacy Status Readout */}
            <div className="pt-2 text-[10.5px] font-mono text-[#34D399] tracking-wider font-bold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#34D399] shadow-[0_0_8px_#34D399] animate-pulse" />
              <span>END-TO-END CLIENT ENCRYPTED</span>
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* 2. GLOWING DIVIDER LINE WITH STARBURST LENS FLARE            */}
        {/* ============================================================ */}
        <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent my-4">
          {/* Starburst Lens Flare Node */}
          <div className="absolute left-[8%] -top-[4px] w-2.5 h-2.5 rounded-full bg-[#F3CF65] shadow-[0_0_15px_6px_rgba(243,207,101,0.8)]" />
        </div>

        {/* ============================================================ */}
        {/* 3. BOTTOM BAR (COPYRIGHT & LEGAL LINKS)                      */}
        {/* ============================================================ */}
        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-slate-400">
          
          <p className="text-slate-500">
            © 2026 Kshurak Inc. All rights reserved. Sovereign Grooming OS.
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400">
            <button 
              onClick={() => onNavigate('/profiles')} 
              className="hover:text-[#F3CF65] transition-colors"
            >
              Profile Management
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => onNavigate('/booking')} 
              className="hover:text-[#F3CF65] transition-colors"
            >
              Protected Escrow Protocol
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => onNavigate('/privacy')} 
              className="hover:text-[#F3CF65] transition-colors"
            >
              Biometric Privacy
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
