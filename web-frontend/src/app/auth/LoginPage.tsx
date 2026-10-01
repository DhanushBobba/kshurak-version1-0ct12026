import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  User,
  Scissors,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    login,
    googleLogin,
    facebookLogin,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [userRole, setUserRole] =
    useState<"user" | "barber">("user");

  const [loading, setLoading] =
    useState(false);

  const [socialLoading, setSocialLoading] =
    useState<"google" | "facebook" | null>(
      null
    );

  const [error, setError] =
    useState<string | null>(null);

  /*
   * ============================================================
   * EMAIL LOGIN
   * ============================================================
   *
   * Web flow:
   *
   * Email + Password
   *      ↓
   * AuthContext.login()
   *      ↓
   * Supabase authentication
   *      ↓
   * profile/session handling
   *      ↓
   * Home
   */

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Please fill in both email and password."
      );

      return;
    }

    try {
      setLoading(true);
      setError(null);

      await login(
        cleanEmail,
        password
      );

      /*
       * React Router equivalent of
       * mobile router.replace("/")
       */

      navigate("/", {
        replace: true,
      });
    } catch (err: any) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * GOOGLE LOGIN
   * ============================================================
   *
   * IMPORTANT:
   * On web, Supabase redirects the browser to Google.
   * Do NOT force navigate("/") immediately here.
   *
   * OAuth callback + AuthContext/onAuthStateChange
   * restores the session after returning.
   */

  const handleGoogle = async () => {
    if (
      loading ||
      socialLoading
    ) {
      return;
    }

    try {
      setSocialLoading("google");
      setError(null);

      await googleLogin();

      /*
       * No navigate("/") here.
       *
       * Supabase OAuth controls the browser
       * redirect and returns the user to
       * the configured redirect URL.
       */
    } catch (err: any) {
      console.error(
        "GOOGLE LOGIN ERROR:",
        err
      );

      setError(
        err?.message ||
        "Unable to sign in with Google."
      );

      setSocialLoading(null);
    }
  };

  /*
   * ============================================================
   * FACEBOOK LOGIN
   * ============================================================
   */

  const handleFacebook = async () => {
    if (
      loading ||
      socialLoading
    ) {
      return;
    }

    try {
      setSocialLoading("facebook");
      setError(null);

      await facebookLogin();

      /*
       * OAuth browser redirect handles
       * returning to the web application.
       */
    } catch (err: any) {
      console.error(
        "FACEBOOK LOGIN ERROR:",
        err
      );

      setError(
        err?.message ||
        "Unable to sign in with Facebook."
      );

      setSocialLoading(null);
    }
  };

  const authBusy =
    loading ||
    Boolean(socialLoading);

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/[0.035] blur-3xl" />

        <div className="absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full bg-primary/[0.02] blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        {/* =====================================================
            BRAND HEADER
        ====================================================== */}

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img
              src="/assets/images/logo.png"
              alt="Kshurak Logo"
              className="h-[76px] sm:h-[84px] w-auto object-contain drop-shadow-[0_8px_20px_rgba(245,158,11,0.15)]"
              draggable={false}
            />
          </div>

          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome Back
            </h1>

            <p className="text-xs text-textSecondary mt-2 leading-relaxed">
              Sign in to access your AI facial
              geometry & hairstyle records
            </p>
          </div>
        </div>

        {/* =====================================================
            AUTH CARD
        ====================================================== */}

        <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.35)] space-y-6">
          {/* ===================================================
              USER / BARBER SELECTOR
          ==================================================== */}

          <div className="grid grid-cols-2 p-1 bg-surfaceDark rounded-2xl border border-border">
            <button
              type="button"
              disabled={authBusy}
              onClick={() => {
                setUserRole("user");
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all disabled:cursor-not-allowed disabled:opacity-60 ${userRole === "user"
                  ? "bg-surfaceLight text-primary border border-primary/30 shadow-md shadow-primary/5"
                  : "text-textMuted hover:text-white"
                }`}
            >
              <User size={15} />

              User Login
            </button>

            <button
              type="button"
              disabled={authBusy}
              onClick={() => {
                setUserRole("barber");
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all disabled:cursor-not-allowed disabled:opacity-60 ${userRole === "barber"
                  ? "bg-surfaceLight text-primary border border-primary/30 shadow-md shadow-primary/5"
                  : "text-textMuted hover:text-white"
                }`}
            >
              <Scissors size={15} />

              Barber Login
            </button>
          </div>

          {/*
            Mobile currently displays the Barber tab,
            but uses the same auth entry-point.

            Therefore this web page does NOT invent
            a separate barber authentication API.
          */}

          {userRole === "barber" && (
            <div className="rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3">
              <p className="text-[11px] leading-relaxed text-textSecondary">
                <span className="font-black text-primary">
                  Barber Login
                </span>{" "}
                currently uses the same secure
                authentication entry point.
              </p>
            </div>
          )}

          {/* ===================================================
              ERROR
          ==================================================== */}

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-bold leading-relaxed"
            >
              {error}
            </div>
          )}

          {/* ===================================================
              EMAIL LOGIN
          ==================================================== */}

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => {
                setEmail(
                  e.target.value
                );

                if (error) {
                  setError(null);
                }
              }}
              icon={
                <Mail size={18} />
              }
              disabled={authBusy}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(
                  e.target.value
                );

                if (error) {
                  setError(null);
                }
              }}
              icon={
                <Lock size={18} />
              }
              rightElement={
                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={authBusy}
                  onClick={() =>
                    setShowPassword(
                      (prev) =>
                        !prev
                    )
                  }
                  className="text-textMuted hover:text-white p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>
              }
              disabled={authBusy}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-base font-black mt-2"
              loading={loading}
              disabled={authBusy}
              icon={
                <Sparkles
                  size={16}
                />
              }
            >
              VERIFY & LOGIN
            </Button>
          </form>

          {/* ===================================================
              SOCIAL LOGINS
          ==================================================== */}

          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-border w-full" />

              <span className="bg-surface px-3 text-[11px] font-bold text-textMuted uppercase tracking-wider absolute">
                Or Continue With
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Google */}

              <button
                type="button"
                disabled={authBusy}
                onClick={handleGoogle}
                className="flex items-center justify-center gap-2 min-h-[46px] py-3 px-4 rounded-xl bg-surfaceDark hover:bg-surfaceLight border border-border hover:border-primary/25 text-white text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {socialLoading ===
                  "google" ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />

                    Connecting...
                  </>
                ) : (
                  <>
                    <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[11px] font-black text-[#4285F4]">
                      G
                    </span>

                    Google
                  </>
                )}
              </button>

              {/* Facebook */}

              <button
                type="button"
                disabled={authBusy}
                onClick={
                  handleFacebook
                }
                className="flex items-center justify-center gap-2 min-h-[46px] py-3 px-4 rounded-xl bg-surfaceDark hover:bg-surfaceLight border border-border hover:border-primary/25 text-white text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {socialLoading ===
                  "facebook" ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />

                    Connecting...
                  </>
                ) : (
                  <>
                    <span className="w-6 h-6 rounded-lg bg-[#1877F2]/15 flex items-center justify-center text-[#4A8DF6] text-sm font-black">
                      f
                    </span>

                    Facebook
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            SECURITY
        ====================================================== */}

        <div className="flex items-center justify-center gap-3 text-center text-xs text-textMuted">
          <div className="w-9 h-9 rounded-xl bg-surface border border-primary/25 flex items-center justify-center shrink-0">
            <Shield
              size={17}
              className="text-primary"
            />
          </div>

          <span className="leading-relaxed">
            Your biometric data is
            protected with secure
            authentication and encrypted
            connections.
          </span>
        </div>

        {/* =====================================================
            SIGNUP REDIRECT
        ====================================================== */}

        <div className="text-center text-xs text-textSecondary">
          Don't have an account?{" "}

          <Link
            to="/auth/signup"
            className="text-primary font-black hover:underline"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;