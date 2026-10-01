import React from 'react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = 'Back' }) => {
  return (
    <div className="absolute top-6 left-6 z-40">
      <button
        onClick={onClick}
        type="button"
        className="group flex items-center gap-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#0A0E1A]/85 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-200 backdrop-blur-xl transition-all duration-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 hover:text-[#FFF0D0] hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] active:scale-95 shadow-[0_8px_25px_rgba(0,0,0,0.8)]"
      >
        <span className="text-sm text-[#D4AF37] transition-transform group-hover:-translate-x-1">←</span>
        <span>{label}</span>
      </button>
    </div>
  );
};

export default BackButton;
