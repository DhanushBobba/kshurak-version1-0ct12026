import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  ClipboardList,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  ShieldCheck,
  Layers3,
  Scissors,
  Waves,
  CircleDot,
  Activity,
  Palette,
  HeartPulse,
} from "lucide-react";
import Button from "@/components/ui/Button";

type SurveyData = {
  hair_texture: string;
  density: string;
  growth_length: string;
  silhouette: string;
  maintenance: string;
  scalp_profile: string;
};

type SurveyField =
  | "hair_texture"
  | "density"
  | "growth_length"
  | "silhouette"
  | "scalp_profile";

type SurveyOption = {
  value: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
};

type StepConfig = {
  number: number;
  title: string;
  eyebrow: string;
  question: string;
  description: string;
  field: SurveyField;
  options: SurveyOption[];
};

export const SurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /*
   * Keep this aligned with the mobile survey.
   *
   * Mobile starts the answers empty instead of preselecting values.
   * maintenance is part of the persisted schema, but the current
   * five-step mobile survey does not expose a maintenance question.
   */
  const [data, setData] = useState<SurveyData>({
    hair_texture: "",
    density: "",
    growth_length: "",
    silhouette: "",
    maintenance: "",
    scalp_profile: "",
  });

  const steps: StepConfig[] = useMemo(
    () => [
      {
        number: 1,
        title: "Texture",
        eyebrow: "Hair Biology",
        question: "What is your natural hair texture?",
        description:
          "Choose the strand pattern that most closely matches your natural hair without styling products.",
        field: "hair_texture",
        options: [
          {
            value: "Straight",
            title: "Straight",
            desc: "Smooth strands with little to no natural curl pattern.",
            icon: <Waves size={20} />,
          },
          {
            value: "Wavy",
            title: "Wavy",
            desc: "Soft S-shaped bends with natural movement and body.",
            icon: <Waves size={20} />,
          },
          {
            value: "Curly",
            title: "Curly",
            desc: "Defined loops or spirals with noticeable natural bounce.",
            icon: <Waves size={20} />,
          },
          {
            value: "Coily",
            title: "Coily",
            desc: "Compact curls or tight coils with strong texture definition.",
            icon: <Waves size={20} />,
          },
        ],
      },
      {
        number: 2,
        title: "Density",
        eyebrow: "Hair Volume",
        question: "How would you describe your hair density?",
        description:
          "Select the option that best represents overall thickness and scalp coverage.",
        field: "density",
        options: [
          {
            value: "Low",
            title: "Low Density",
            desc: "Lighter overall coverage with more visible scalp areas.",
            icon: <CircleDot size={20} />,
          },
          {
            value: "Medium",
            title: "Medium Density",
            desc: "Balanced coverage with flexible styling possibilities.",
            icon: <CircleDot size={20} />,
          },
          {
            value: "High",
            title: "High Density",
            desc: "Full, thick coverage that supports heavier structured styles.",
            icon: <CircleDot size={20} />,
          },
        ],
      },
      {
        number: 3,
        title: "Length",
        eyebrow: "Current Length",
        question: "What is your current hair length?",
        description:
          "Choose the range that best reflects your current usable styling length.",
        field: "growth_length",
        options: [
          {
            value: "Short",
            title: "Short",
            desc: "Ideal for crops, fades, buzz cuts and tighter silhouettes.",
            icon: <Scissors size={20} />,
          },
          {
            value: "Medium",
            title: "Medium",
            desc: "Suitable for quiffs, side parts, fringes and pompadours.",
            icon: <Scissors size={20} />,
          },
          {
            value: "Long",
            title: "Long",
            desc: "Supports flowing styles, layered cuts and longer silhouettes.",
            icon: <Scissors size={20} />,
          },
        ],
      },
      {
        number: 4,
        title: "Preference",
        eyebrow: "Style Direction",
        question: "What hairstyle direction do you prefer?",
        description:
          "Tell the recommendation engine what overall visual direction feels most like you.",
        field: "silhouette",
        options: [
          {
            value: "Classic",
            title: "Classic",
            desc: "Timeless, polished styles with clean and balanced proportions.",
            icon: <Palette size={20} />,
          },
          {
            value: "Modern",
            title: "Modern",
            desc: "Sharp contemporary styling with texture, fades and precision.",
            icon: <Palette size={20} />,
          },
          {
            value: "Trendy",
            title: "Trendy",
            desc: "Bold, expressive looks influenced by current grooming trends.",
            icon: <Palette size={20} />,
          },
        ],
      },
      {
        number: 5,
        title: "Scalp Profile",
        eyebrow: "Scalp Condition",
        question: "How would you describe your scalp condition?",
        description:
          "This helps personalize recommendations around sensitivity and scalp behavior.",
        field: "scalp_profile",
        options: [
          {
            value: "Resilient",
            title: "Resilient",
            desc: "Generally comfortable scalp with minimal irritation or sensitivity.",
            icon: <HeartPulse size={20} />,
          },
          {
            value: "Sensitive",
            title: "Sensitive",
            desc: "More prone to dryness, flaking, irritation or product sensitivity.",
            icon: <HeartPulse size={20} />,
          },
          {
            value: "Oily",
            title: "Oily",
            desc: "Higher natural oil production requiring lighter grooming products.",
            icon: <HeartPulse size={20} />,
          },
        ],
      },
    ],
    []
  );

  const currentStep = steps[step - 1];
  const currentValue = data[currentStep.field];
  const completedAnswers = [
    data.hair_texture,
    data.density,
    data.growth_length,
    data.silhouette,
    data.scalp_profile,
  ].filter(Boolean).length;

  const updateValue = (
    field: keyof SurveyData,
    value: string
  ) => {
    setErrorMessage(null);

    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
   * Same profile resolution strategy as mobile:
   *
   * 1. auth_user_id
   * 2. email fallback
   */
  const getProfile = async () => {
    try {
      if (!user?.id) {
        return null;
      }

      const {
        data: authProfiles,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, auth_user_id, email")
        .eq(
          "auth_user_id",
          user.id
        )
        .order("created_at", {
          ascending: true,
        })
        .limit(1);

      if (profileError) {
        console.error(
          "PROFILE LOOKUP BY AUTH ID ERROR:",
          profileError
        );
      }

      const authProfile =
        authProfiles?.[0] || null;

      if (authProfile) {
        return authProfile;
      }

      if (!user.email) {
        return null;
      }

      const {
        data: emailProfiles,
        error: emailProfileError,
      } = await supabase
        .from("profiles")
        .select("id, auth_user_id, email")
        .eq(
          "email",
          user.email
        )
        .order("created_at", {
          ascending: true,
        })
        .limit(1);

      if (emailProfileError) {
        console.error(
          "PROFILE LOOKUP BY EMAIL ERROR:",
          emailProfileError
        );

        return null;
      }

      const emailProfile =
        emailProfiles?.[0] || null;

      if (!emailProfile) {
        return null;
      }

      if (
        emailProfile.auth_user_id !==
        user.id
      ) {
        const {
          error: updateError,
        } = await supabase
          .from("profiles")
          .update({
            auth_user_id:
              user.id,
          })
          .eq(
            "id",
            emailProfile.id
          );

        if (updateError) {
          console.error(
            "PROFILE AUTH LINK ERROR:",
            updateError
          );
        }
      }

      return emailProfile;
    } catch (error) {
      console.error(
        "Profile fetch error",
        error
      );

      return null;
    }
  };

  /*
   * Same profile_history behavior used by mobile.
   * History failure must not block survey completion.
   */
  const saveSurveyHistory = async (
    profileId: string
  ) => {
    try {
      const { error } = await supabase
        .from("profile_history")
        .insert({
          profile_id: profileId,
          activity_type: "SURVEY",
          title: "AI Hair Survey Completed",
          description:
            `Hair Texture: ${data.hair_texture}, ` +
            `Density: ${data.density}, ` +
            `Length: ${data.growth_length}, ` +
            `Style: ${data.silhouette}, ` +
            `Maintenance: ${data.maintenance}, ` +
            `Scalp: ${data.scalp_profile}`,
          activity_date: new Date().toISOString(),
        });

      if (error) {
        console.error(
          "Survey history error",
          error
        );
      }
    } catch (error) {
      console.error(
        "Survey history error",
        error
      );
    }
  };

  /*
   * MOBILE PARITY FLOW
   *
   * auth user
   * → profile
   * → user_surveys
   * → profile_history
   * → scanner
   */
  const saveSurvey = async () => {
    if (saving) {
      return;
    }

    try {
      if (!user?.id) {
        navigate("/auth/login");
        return;
      }

      setSaving(true);
      setErrorMessage(null);

      const profile = await getProfile();

      if (!profile) {
        throw new Error(
          "User profile not found. Please set up your profile before completing the survey."
        );
      }

      const {
        error: surveyError,
      } = await supabase
        .from("user_surveys")
        .insert({
          user_id: user.id,
          profile_id: profile.id,
          hair_texture: data.hair_texture,
          density: data.density,
          growth_length: data.growth_length,
          silhouette: data.silhouette,
          maintenance: data.maintenance,
          scalp_profile: data.scalp_profile,
        });

      if (surveyError) {
        throw surveyError;
      }

      await saveSurveyHistory(profile.id);

      localStorage.setItem(
        "surveyCompleted",
        "true"
      );

      /*
       * Web equivalent of:
       * router.replace("/scanner")
       *
       * replace:true avoids returning to the completed survey
       * with the browser Back button.
       */
      navigate("/scanner", {
        replace: true,
      });
    } catch (error: any) {
      console.error(
        "SURVEY SAVE ERROR:",
        error
      );

      setErrorMessage(
        error?.message ||
        "Unable to save your survey. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (saving) {
      return;
    }

    /*
     * Mobile itself allows navigation through steps without
     * explicit validation. For a cleaner web experience we
     * preserve the flow, but show a helpful message when the
     * current question has not yet been answered.
     *
     * Remove this block if you want completely unrestricted
     * navigation exactly like mobile.
     */
    if (!currentValue) {
      setErrorMessage(
        `Please select an option for ${currentStep.title.toLowerCase()} before continuing.`
      );

      return;
    }

    setErrorMessage(null);

    if (step < 5) {
      setStep((prev) => prev + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    await saveSurvey();
  };

  const handleBack = () => {
    if (saving) {
      return;
    }

    if (step > 1) {
      setErrorMessage(null);

      setStep((prev) => prev - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const goToCompletedStep = (
    targetStep: number
  ) => {
    if (saving) {
      return;
    }

    /*
     * User can revisit the current/completed progression,
     * but cannot jump ahead into unanswered steps.
     */
    if (targetStep <= step) {
      setErrorMessage(null);
      setStep(targetStep);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient premium background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-16 h-[420px] w-[420px] rounded-full bg-primary/[0.035] blur-3xl" />
        <div className="absolute -right-40 top-[35%] h-[460px] w-[460px] rounded-full bg-primary/[0.025] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.025),transparent_38%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <section className="mb-7 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              <ClipboardList size={13} />
              Personalized Hair Intelligence
            </div>

            <h1 className="max-w-3xl text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl lg:text-[42px] lg:leading-[1.05]">
              Build Your{" "}
              <span className="text-primary">
                AI Hair Profile
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-xs font-medium leading-6 text-textSecondary sm:text-sm">
              Five quick profile inputs help Kshurak
              personalize your face analysis and hairstyle
              recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface/80 px-4 py-3 shadow-xl shadow-black/10 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Layers3 size={18} />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.17em] text-textMuted">
                Profile Progress
              </p>

              <p className="mt-0.5 text-sm font-black text-white">
                {completedAnswers} / 5{" "}
                <span className="font-semibold text-textMuted">
                  answered
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN SURVEY SHELL
        ====================================================== */}
        <div className="overflow-hidden rounded-[28px] border border-border bg-surface/95 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          {/* Top progress area */}
          <div className="border-b border-border bg-surfaceDark/60 px-5 py-5 sm:px-7 lg:px-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">
                  Step {String(step).padStart(2, "0")} of 05
                </p>

                <p className="mt-1 text-sm font-black text-white">
                  {currentStep.title}
                </p>
              </div>

              <div className="rounded-full border border-primary/25 bg-primary/[0.07] px-3 py-1.5 font-mono text-[10px] font-black text-primary">
                {step * 20}% COMPLETE
              </div>
            </div>

            <div className="relative h-1.5 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-primary to-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.5)] transition-all duration-500 ease-out"
                style={{
                  width: `${step * 20}%`,
                }}
              />
            </div>

            {/* Desktop step navigator */}
            <div className="mt-5 hidden grid-cols-5 gap-2 lg:grid">
              {steps.map((item) => {
                const active =
                  item.number === step;

                const completed =
                  item.number < step ||
                  Boolean(data[item.field]);

                return (
                  <button
                    type="button"
                    key={item.number}
                    disabled={
                      saving ||
                      item.number > step
                    }
                    onClick={() =>
                      goToCompletedStep(
                        item.number
                      )
                    }
                    className={`group rounded-xl border px-3 py-3 text-left transition-all duration-300 ${active
                        ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/5"
                        : completed
                          ? "border-border bg-surface hover:border-primary/25 hover:bg-surfaceLight"
                          : "cursor-default border-border/60 bg-background/30 opacity-45"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[9px] font-black tracking-[0.15em] ${active ||
                            completed
                            ? "text-primary"
                            : "text-textMuted"
                          }`}
                      >
                        0{item.number}
                      </span>

                      {completed && !active && (
                        <Check
                          size={12}
                          className="text-primary"
                        />
                      )}
                    </div>

                    <p
                      className={`mt-1 truncate text-[10px] font-black uppercase tracking-wide ${active
                          ? "text-white"
                          : "text-textSecondary"
                        }`}
                    >
                      {item.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question body */}
          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
            {/* Left information panel */}
            <aside className="relative overflow-hidden border-b border-border bg-background/60 p-6 sm:p-7 lg:border-b-0 lg:border-r lg:p-8">
              <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/[0.05] blur-3xl" />

              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/5">
                  {step === 1 && (
                    <Waves size={21} />
                  )}

                  {step === 2 && (
                    <Activity size={21} />
                  )}

                  {step === 3 && (
                    <Scissors size={21} />
                  )}

                  {step === 4 && (
                    <Palette size={21} />
                  )}

                  {step === 5 && (
                    <HeartPulse size={21} />
                  )}
                </div>

                <p className="mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                  {currentStep.eyebrow}
                </p>

                <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.025em] text-white sm:text-[28px]">
                  {currentStep.question}
                </h2>

                <p className="mt-4 max-w-sm text-xs font-medium leading-6 text-textSecondary">
                  {currentStep.description}
                </p>

                <div className="mt-7 rounded-2xl border border-border bg-surface/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/[0.08] text-primary">
                      <ShieldCheck size={15} />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-white">
                        Private Profile Data
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-textMuted">
                        Your answers are linked to your
                        Kshurak profile and used for
                        personalized grooming
                        recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right options panel */}
            <main className="p-5 sm:p-7 lg:p-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-textMuted">
                    Select one option
                  </p>

                  <p className="mt-1 text-xs font-semibold text-textSecondary">
                    Choose the answer that best
                    describes you.
                  </p>
                </div>

                {currentValue && (
                  <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 sm:flex">
                    <Check size={11} />
                    Answer selected
                  </div>
                )}
              </div>

              <div
                className={`grid gap-3 ${currentStep.options.length ===
                    4
                    ? "sm:grid-cols-2"
                    : "grid-cols-1"
                  }`}
              >
                {currentStep.options.map(
                  (option) => (
                    <OptionCard
                      key={option.value}
                      selected={
                        currentValue ===
                        option.value
                      }
                      onClick={() =>
                        updateValue(
                          currentStep.field,
                          option.value
                        )
                      }
                      title={option.title}
                      desc={option.desc}
                      icon={option.icon}
                    />
                  )
                )}
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3">
                  <p className="text-xs font-bold leading-5 text-red-300">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-7 flex items-center justify-between gap-3 border-t border-border pt-6">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleBack}
                  disabled={
                    step === 1 || saving
                  }
                  icon={
                    <ChevronLeft size={17} />
                  }
                  className="min-w-[110px]"
                >
                  BACK
                </Button>

                <div className="hidden flex-1 px-4 sm:block">
                  <p className="text-center text-[9px] font-bold uppercase tracking-[0.14em] text-textMuted">
                    {step === 5
                      ? "Finish profile to continue to face analysis"
                      : `${5 - step} ${5 - step === 1
                        ? "step"
                        : "steps"
                      } remaining`}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNext}
                  loading={saving}
                  disabled={saving}
                  icon={
                    step === 5 ? (
                      <Sparkles size={17} />
                    ) : (
                      <ChevronRight
                        size={17}
                      />
                    )
                  }
                  className="min-w-[150px] px-5 font-black"
                >
                  {step === 5
                    ? "COMPLETE & SCAN"
                    : "NEXT STEP"}
                </Button>
              </div>
            </main>
          </div>
        </div>

        {/* Bottom guidance */}
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoCard
            number="01"
            title="Profile Based"
            text="Answers remain associated with your authenticated Kshurak profile."
          />

          <InfoCard
            number="02"
            title="AI Calibrated"
            text="Survey information complements your facial geometry analysis."
          />

          <InfoCard
            number="03"
            title="Cross Platform"
            text="The same Supabase profile data is available to mobile and web."
          />
        </section>
      </div>
    </div>
  );
};

type OptionCardProps = {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  icon: React.ReactNode;
};

const OptionCard: React.FC<
  OptionCardProps
> = ({
  selected,
  onClick,
  title,
  desc,
  icon,
}) => {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5 ${selected
            ? "border-primary bg-primary/[0.09] shadow-[0_10px_35px_rgba(245,158,11,0.1)] ring-1 ring-primary/20"
            : "border-border bg-surfaceDark hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surfaceLight hover:shadow-xl hover:shadow-black/10"
          }`}
      >
        {selected && (
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        )}

        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${selected
                ? "border-primary bg-primary text-black shadow-lg shadow-primary/15"
                : "border-border bg-background text-primary group-hover:border-primary/30"
              }`}
          >
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  className={`text-sm font-black tracking-tight transition-colors ${selected
                      ? "text-primary"
                      : "text-white"
                    }`}
                >
                  {title}
                </h3>

                {selected && (
                  <p className="mt-1 text-[8px] font-black uppercase tracking-[0.18em] text-primary">
                    Selected
                  </p>
                )}
              </div>

              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${selected
                    ? "border-primary bg-primary"
                    : "border-border bg-transparent group-hover:border-primary/40"
                  }`}
              >
                {selected && (
                  <Check
                    size={12}
                    strokeWidth={4}
                    className="text-black"
                  />
                )}
              </div>
            </div>

            <p className="mt-2 text-[11px] font-medium leading-5 text-textSecondary">
              {desc}
            </p>
          </div>
        </div>
      </button>
    );
  };

type InfoCardProps = {
  number: string;
  title: string;
  text: string;
};

const InfoCard: React.FC<InfoCardProps> = ({
  number,
  title,
  text,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-surface/55 px-4 py-4 transition-colors hover:border-primary/20">
      <div className="flex items-start gap-3">
        <span className="font-mono text-[9px] font-black text-primary">
          {number}
        </span>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white">
            {title}
          </p>

          <p className="mt-1 text-[10px] font-medium leading-4 text-textMuted">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;