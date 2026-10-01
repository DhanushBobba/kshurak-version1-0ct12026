import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Shield, Cpu } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-surfaceDark/80 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface border border-primary/40 flex items-center justify-center p-1">
              <img src="/assets/images/logo.png" alt="Kshurak" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-white text-lg tracking-wider">KSHURAK AI</span>
          </div>
          <p className="text-xs text-textSecondary leading-relaxed">
            Next-generation biometric facial geometry estimation, hair diagnosis, and personalized haircut recommendation platform.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Vision Engine v2.0 Online
          </div>
        </div>

        <div>
          <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-4">Core Intelligence</h4>
          <ul className="space-y-2.5 text-xs text-textSecondary font-semibold">
            <li><Link to="/scanner" className="hover:text-white transition-colors">3-Angle Face Scanner</Link></li>
            <li><Link to="/survey" className="hover:text-white transition-colors">5-Step Hair Diagnostic</Link></li>
            <li><Link to="/tryon" className="hover:text-white transition-colors">Virtual AI Style Try-On</Link></li>
            <li><Link to="/booking" className="hover:text-white transition-colors">Verified Barber Network</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-4">User Profiles</h4>
          <ul className="space-y-2.5 text-xs text-textSecondary font-semibold">
            <li><Link to="/profile" className="hover:text-white transition-colors">Primary Account</Link></li>
            <li><Link to="/profile/add-child" className="hover:text-white transition-colors">Family & Child Profiles</Link></li>
            <li><Link to="/profile/history" className="hover:text-white transition-colors">Geometry Reports Archive</Link></li>
            <li><Link to="/profile/edit" className="hover:text-white transition-colors">Preferences & Security</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-4">Enterprise Safety</h4>
          <p className="text-xs text-textMuted leading-relaxed mb-3">
            All facial coordinate datasets are processed with enterprise-grade encryption. Images are never shared without permission.
          </p>
          <div className="flex items-center gap-3 text-textMuted text-xs">
            <span className="flex items-center gap-1"><Shield size={14} className="text-primary" /> 256-Bit</span>
            <span className="flex items-center gap-1"><Cpu size={14} className="text-primary" /> Gemini Flash</span>
            <span className="flex items-center gap-1"><Sparkles size={14} className="text-primary" /> Proportions</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-textMuted gap-4">
        <div>
          © {new Date().getFullYear()} Kshurak Technologies. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <span className="hover:text-textSecondary cursor-pointer">Privacy Protocol</span>
          <span className="hover:text-textSecondary cursor-pointer">Terms of Service</span>
          <span className="hover:text-textSecondary cursor-pointer">Model Cards</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
