import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Camera,
  ClipboardList,
  Sparkles,
  Calendar,
  Compass,
  User,
  History,
  UserPlus,
  Home,
  ShieldCheck,
} from "lucide-react";

export const Sidebar: React.FC<{ className?: string }> = ({ className = "" }) => {
  const location = useLocation();

  const links = [
    { label: "Dashboard", path: "/", icon: Home },
    { label: "Face Scanner", path: "/scanner", icon: Camera },
    { label: "Hair Survey", path: "/survey", icon: ClipboardList },
    { label: "Virtual Try-On", path: "/tryon", icon: Sparkles },
    { label: "Bookings", path: "/booking", icon: Calendar },
    { label: "Explore Styles", path: "/explore", icon: Compass },
    { label: "Account Profile", path: "/profile", icon: User },
    { label: "Add Child Profile", path: "/profile/add-child", icon: UserPlus },
    { label: "Activity History", path: "/profile/history", icon: History },
  ];

  return (
    <aside
      className={`w-64 bg-surface border-r border-border p-4 flex flex-col justify-between shrink-0 ${className}`}
    >
      <div className="space-y-6">
        <div className="px-3 pt-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-textMuted">
            Platform Navigation
          </p>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-black font-black shadow-md shadow-amber-500/20"
                    : "text-textSecondary hover:text-white hover:bg-surfaceLight"
                }`}
              >
                <Icon size={16} className={isActive ? "text-black" : "text-primary"} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 bg-surfaceDark rounded-2xl border border-border mt-8">
        <div className="flex items-center gap-2 text-primary text-xs font-bold mb-1">
          <ShieldCheck size={16} />
          <span>AI Precision Engine</span>
        </div>
        <p className="text-[11px] text-textMuted leading-relaxed">
          Biometric face geometry powered by Gemini Vision & golden proportion algorithms.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
