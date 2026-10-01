import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'emerald' | 'charcoal' | 'amber' | 'crimson';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  className = '',
}) => {
  const variantStyles = {
    gold: 'bg-[#C5A880]/15 text-[#DFCA9B] border border-[#C5A880]/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    charcoal: 'bg-[#1C2028] text-gray-300 border border-[#2A303C]',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    crimson: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
