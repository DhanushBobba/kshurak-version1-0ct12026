import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  Camera,
  ClipboardList,
  Calendar,
  Compass,
  User as UserIcon,
  LogOut,
  Crown,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import Button from "@/components/ui/Button";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const rawName = user
    ? user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "User"
    : "Guest";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const navLinks = [
    { label: "HOME", path: "/" },
    { label: "5 STEP SURVEY", path: "/survey" },
    { label: "FACE SCANNER", path: "/scanner" },
    { label: "AI TRY-ON", path: "/tryon" },
    { label: "BARBERS", path: "/booking" },
    { label: "EXPLORE", path: "/explore" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setProfileDropdownOpen(false);
      navigate("/auth/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 grid grid-cols-[1fr_auto_1fr] items-center">

        {/* LEFT - KSHURAK BRAND LOGO */}
        <div className="flex items-center justify-start">
          <Link
            to="/"
            className="flex items-center"
          >
            <img
              src="assets/images/logo.png"
              alt="Kshurak"
              className="h-[56px] w-auto object-contain transition-transform duration-300 hover:scale-[1.02]"
              draggable={false}
            />
          </Link>
        </div>

        {/* CENTER - NAV ITEMS */}
        <nav className="hidden lg:flex items-center justify-center gap-7 xl:gap-9">
          {navLinks.map((link) => {
            const isActive =
              link.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.label}
                to={link.path}
                className={`relative whitespace-nowrap py-2 text-xs font-black tracking-wider transition-colors uppercase ${isActive
                  ? "text-primary"
                  : "text-textSecondary hover:text-white"
                  }`}
              >
                {link.label}

                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_#F59E0B]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT - PROFILE */}
        <div className="hidden sm:flex items-center justify-end gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() =>
                  setProfileDropdownOpen(!profileDropdownOpen)
                }
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-surface hover:bg-surfaceLight border border-border transition-all"
              >
                <div className="relative w-9 h-9 rounded-full border-2 border-primary overflow-hidden bg-surfaceDark flex items-center justify-center">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon
                      size={18}
                      className="text-primary"
                    />
                  )}
                </div>

                <span className="text-xs font-black text-white">
                  {displayName}
                </span>

                <ChevronDown
                  size={14}
                  className="text-textMuted"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">

                  <div className="p-3 border-b border-border/80 mb-1">
                    <p className="text-xs font-bold text-white truncate">
                      {user.email}
                    </p>

                    <p className="text-[11px] text-textMuted">
                      Connected Account
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() =>
                      setProfileDropdownOpen(false)
                    }
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-textSecondary hover:text-white hover:bg-surfaceLight rounded-xl transition-all"
                  >
                    <UserIcon
                      size={15}
                      className="text-primary"
                    />
                    Manage Profile & Family
                  </Link>

                  <Link
                    to="/profile/history"
                    onClick={() =>
                      setProfileDropdownOpen(false)
                    }
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-textSecondary hover:text-white hover:bg-surfaceLight rounded-xl transition-all"
                  >
                    <ClipboardList
                      size={15}
                      className="text-primary"
                    />
                    Scan History
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>

                </div>
              )}

            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                navigate("/auth/login")
              }
            >
              LOGIN
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surfaceDark px-4 py-5 space-y-3 animate-in slide-in-from-top-4">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${isActive
                    ? "bg-primary text-black font-black"
                    : "text-white hover:bg-surface"
                    }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border text-white font-bold text-sm"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon size={18} className="text-primary" /> {displayName}'s Profile
                  </span>
                  <span className="text-xs text-primary font-bold">Edit →</span>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  icon={<LogOut size={16} />}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
