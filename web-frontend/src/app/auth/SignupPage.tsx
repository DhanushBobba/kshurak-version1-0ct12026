import React, { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import {
  User,
  Mail,
  Lock,
  Sparkles,
  ChevronDown,
  Check,
  ShieldCheck,
  Hash,
  VenusAndMars,
  Eye,
  EyeOff,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";

type SignupForm = {
  username: string;
  age: string;
  gender: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const { signup } = useAuth();

  const [form, setForm] =
    useState<SignupForm>({
      username: "",
      age: "",
      gender: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  /*
   * ============================================================
   * UPDATE FIELD
   * ============================================================
   */

  const update = (
    key: keyof SignupForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (error) {
      setError(null);
    }
  };

  /*
   * ============================================================
   * SIGNUP
   *
   * Same functional flow as Mobile:
   *
   * Validate
   *   ↓
   * signup()
   *   ↓
   * Supabase Auth
   *   ↓
   * AuthContext ensures profile
   *   ↓
   * profiles
   *   ↓
   * user_profiles PRIMARY
   *   ↓
   * Home
   * ============================================================
   */

  const handleSignup = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    /*
     * Mobile parity:
     * all fields are mandatory.
     */

    if (
      !form.username.trim() ||
      !form.age ||
      !form.gender ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError(
        "Please fill all fields."
      );

      return;
    }

    /*
     * Mobile parity:
     * passwords must match.
     */

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    try {
      setLoading(true);
      setError(null);

      /*
       * Same payload as Mobile.
       */

      await signup({
        username:
          form.username.trim(),

        age:
          form.age,

        gender:
          form.gender,

        email:
          form.email
            .trim()
            .toLowerCase(),

        password:
          form.password,
      });

      /*
       * React Router equivalent of:
       *
       * router.replace("/")
       */

      navigate("/", {
        replace: true,
      });
    } catch (err: any) {
      console.error(
        "SIGNUP ERROR:",
        err
      );

      setError(
        err?.message ||
        "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    Boolean(
      form.password &&
      form.confirmPassword
    ) &&
    form.password ===
    form.confirmPassword;

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 py-10 sm:py-12">
      {/* =====================================================
          PREMIUM BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-primary/[0.035] blur-3xl" />

        <div className="absolute -left-36 bottom-0 h-[320px] w-[320px] rounded-full bg-primary/[0.025] blur-3xl" />

        <div className="absolute -right-36 top-1/3 h-[340px] w-[340px] rounded-full bg-primary/[0.02] blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg space-y-7">
        {/* =====================================================
            BRAND
        ====================================================== */}

        <div className="text-center">
          <div className="flex justify-center">
            <img
              src="/assets/images/logo.png"
              alt="Kshurak Logo"
              className="h-[76px] sm:h-[84px] w-auto object-contain drop-shadow-[0_8px_24px_rgba(245,158,11,0.16)]"
              draggable={false}
            />
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Create Account
          </h1>

          <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-relaxed text-textSecondary">
            Build your personalized
            grooming profile to unlock AI
            face analysis and tailored
            hairstyle recommendations.
          </p>
        </div>

        {/* =====================================================
            REGISTRATION CARD
        ====================================================== */}

        <div className="overflow-hidden rounded-[28px] border border-border bg-surface/95 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {/* Card Header */}

          <div className="flex items-center justify-between border-b border-border bg-surfaceDark/50 px-6 py-4 sm:px-8">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">
                New Profile
              </p>

              <h2 className="mt-1 text-sm font-black text-white">
                Account Details
              </h2>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/[0.07] text-[10px] font-black text-primary">
              01
            </div>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            {/* Error */}

            {error && (
              <div className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-xs font-bold leading-relaxed text-error">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSignup}
              className="space-y-4"
            >
              {/* =================================================
                  USERNAME
              ================================================== */}

              <Input
                label="Full Name / Username"
                type="text"
                placeholder="e.g. Alex Morgan"
                value={form.username}
                onChange={(e) =>
                  update(
                    "username",
                    e.target.value
                  )
                }
                icon={
                  <User size={18} />
                }
                disabled={loading}
                autoComplete="name"
                required
              />

              {/* =================================================
                  AGE + GENDER
              ================================================== */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Age"
                  type="number"
                  placeholder="e.g. 26"
                  value={form.age}
                  onChange={(e) =>
                    update(
                      "age",
                      e.target.value
                    )
                  }
                  icon={
                    <Hash size={17} />
                  }
                  min="5"
                  max="120"
                  disabled={loading}
                  required
                />

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-black uppercase tracking-wider text-primary">
                    Gender
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-primary">
                      <VenusAndMars
                        size={17}
                      />
                    </div>

                    <select
                      value={
                        form.gender
                      }
                      disabled={loading}
                      onChange={(e) =>
                        update(
                          "gender",
                          e.target.value
                        )
                      }
                      className="w-full cursor-pointer appearance-none rounded-2xl border border-border bg-surfaceDark py-3.5 pl-12 pr-11 text-sm font-semibold text-white transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                      required
                    >
                      <option
                        value=""
                        disabled
                        className="bg-surfaceDark text-textMuted"
                      >
                        Select Gender
                      </option>

                      <option
                        value="Male"
                        className="bg-surfaceDark text-white"
                      >
                        Male
                      </option>

                      <option
                        value="Female"
                        className="bg-surfaceDark text-white"
                      >
                        Female
                      </option>

                      <option
                        value="Others"
                        className="bg-surfaceDark text-white"
                      >
                        Others
                      </option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-textMuted"
                    />
                  </div>
                </div>
              </div>

              {/* =================================================
                  EMAIL
              ================================================== */}

              <Input
                label="Email Address"
                type="email"
                placeholder="name@domain.com"
                value={form.email}
                onChange={(e) =>
                  update(
                    "email",
                    e.target.value
                  )
                }
                icon={
                  <Mail size={18} />
                }
                disabled={loading}
                autoComplete="email"
                required
              />

              {/* =================================================
                  PASSWORD
              ================================================== */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="••••••••"
                  value={
                    form.password
                  }
                  onChange={(e) =>
                    update(
                      "password",
                      e.target.value
                    )
                  }
                  icon={
                    <Lock
                      size={18}
                    />
                  }
                  rightElement={
                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      className="p-1 text-textMuted transition-colors hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff
                          size={17}
                        />
                      ) : (
                        <Eye
                          size={17}
                        />
                      )}
                    </button>
                  }
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />

                <Input
                  label="Confirm Password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="••••••••"
                  value={
                    form.confirmPassword
                  }
                  onChange={(e) =>
                    update(
                      "confirmPassword",
                      e.target.value
                    )
                  }
                  icon={
                    <Lock
                      size={18}
                    />
                  }
                  rightElement={
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      className="p-1 text-textMuted transition-colors hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          size={17}
                        />
                      ) : (
                        <Eye
                          size={17}
                        />
                      )}
                    </button>
                  }
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>

              {/* Password Match */}

              {form.confirmPassword && (
                <div
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[10px] font-bold ${passwordsMatch
                      ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400"
                      : "border-red-500/20 bg-red-500/[0.06] text-red-300"
                    }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${passwordsMatch
                        ? "bg-emerald-500/15"
                        : "bg-red-500/10"
                      }`}
                  >
                    {passwordsMatch ? (
                      <Check
                        size={12}
                      />
                    ) : (
                      <Lock
                        size={10}
                      />
                    )}
                  </div>

                  {passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
                </div>
              )}

              {/* =================================================
                  SUBMIT
              ================================================== */}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="mt-4 w-full text-base font-black"
                loading={loading}
                disabled={loading}
                icon={
                  <Sparkles
                    size={16}
                  />
                }
              >
                COMPLETE REGISTRATION
              </Button>
            </form>

            {/* =================================================
                SECURITY
            ================================================== */}

            <div className="rounded-2xl border border-border bg-surfaceDark/80 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-background text-primary">
                  <ShieldCheck
                    size={17}
                  />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-primary">
                    Secure Registration
                  </p>

                  <p className="mt-1 text-[10px] font-medium leading-4 text-textMuted">
                    Your account information
                    is securely handled through
                    authenticated Supabase
                    services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            LOGIN LINK
        ====================================================== */}

        <div className="text-center text-xs text-textSecondary">
          Already have an account?{" "}

          <Link
            to="/auth/login"
            className="font-black text-primary hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;