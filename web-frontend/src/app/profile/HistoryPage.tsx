import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

import {
  History as HistoryIcon,
  ArrowLeft,
  CalendarDays,
  Sparkles,
  ScanFace,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  RefreshCcw,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";

/* ============================================================
   TYPES
============================================================ */

interface ScanHistoryItem {
  id: string;

  profile_id?: string | null;

  face_shape?: string | null;

  ai_accuracy?: number | string | null;

  front_image_url?: string | null;
  left_image_url?: string | null;
  right_image_url?: string | null;

  created_at?: string | null;
  scanned_at?: string | null;

  scan_version?: string | null;

  [key: string]: any;
}

/* ============================================================
   COMPONENT
============================================================ */

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [
    history,
    setHistory,
  ] =
    useState<ScanHistoryItem[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    );

  /* ============================================================
     LOAD HISTORY

     Same mobile flow:

     Supabase User
          ↓
     profiles
          ↓
     profile.id
          ↓
     face_scans
          ↓
     created_at DESC
  ============================================================ */

  const loadHistory =
    async () => {
      try {
        setLoading(true);

        setErrorMessage(
          null
        );

        /* ============================
           AUTH USER
        ============================ */

        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        const user =
          userData.user;

        if (!user) {
          navigate(
            "/auth/login",
            {
              replace: true,
            }
          );

          return;
        }

        /* ============================
           PRIMARY PROFILE
        ============================ */

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .select("id")
            .eq(
              "auth_user_id",
              user.id
            )
            .single();

        if (profileError) {
          console.error(
            "PROFILE HISTORY PROFILE ERROR:",
            profileError
          );

          throw profileError;
        }

        if (!profile) {
          throw new Error(
            "Primary profile not found."
          );
        }

        /* ============================
           FACE SCANS
        ============================ */

        const {
          data: scans,
          error: scanError,
        } =
          await supabase
            .from("face_scans")
            .select(`
              id,
              face_shape,
              ai_accuracy,
              front_image_url,
              left_image_url,
              right_image_url,
              created_at
            `)
            .eq(
              "profile_id",
              profile.id
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            );

        if (scanError) {
          console.error(
            "HISTORY SCAN ERROR:",
            scanError
          );

          throw scanError;
        }

        console.log(
          "HISTORY DATA:",
          scans
        );

        setHistory(
          scans || []
        );
      } catch (
      error: any
      ) {
        console.error(
          "HISTORY ERROR:",
          error
        );

        setHistory([]);

        setErrorMessage(
          error?.message ||
          "Unable to load scan history."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadHistory();
  }, []);

  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) {
      return "--";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );
    } catch {
      return "--";
    }
  };

  const formatTime = (
    date?: string | null
  ) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleTimeString(
        undefined,
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };

  /* ============================================================
     ACCURACY DISPLAY
  ============================================================ */

  const formatAccuracy = (
    value:
      | string
      | number
      | null
      | undefined
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "--";
    }

    const text =
      String(value);

    return text.includes("%")
      ? text
      : `${text}%`;
  };

  /* ============================================================
     OPEN REPORT

     Same mobile behavior:
       history item scan id
             ↓
       Geometry
  ============================================================ */

  const openReport = (
    scanId: string
  ) => {
    if (!scanId) {
      setErrorMessage(
        "Scan ID is unavailable."
      );

      return;
    }

    navigate(
      `/geometry?scanId=${encodeURIComponent(
        scanId
      )}`,
      {
        state: {
          scanId,
        },
      }
    );
  };

  /* ============================================================
     OPEN FACE RESULT

     Additional useful Web action.
     Does not change the DB flow.
  ============================================================ */

  const openFaceResult = (
    scanId: string
  ) => {
    if (!scanId) {
      return;
    }

    navigate(
      `/face-result?scanId=${encodeURIComponent(
        scanId
      )}`,
      {
        state: {
          scanId,
        },
      }
    );
  };

  /* ============================================================
     SUMMARY
  ============================================================ */

  const totalScans =
    history.length;

  const latestScan =
    useMemo(
      () =>
        history.length
          ? history[0]
          : null,
      [history]
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20" />

          <div className="absolute w-12 h-12 rounded-full border-4 border-transparent border-t-primary animate-spin" />

          <HistoryIcon
            size={17}
            className="absolute text-primary"
          />
        </div>

        <p className="text-xs text-primary font-black uppercase tracking-wider">
          Loading Scan History...
        </p>

        <p className="text-[10px] text-textMuted">
          Retrieving previous AI
          face analysis reports
        </p>
      </div>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* =====================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[430px] w-[430px] rounded-full bg-primary/[0.025] blur-3xl" />

        <div className="absolute -right-40 top-[50%] h-[430px] w-[430px] rounded-full bg-primary/[0.02] blur-3xl" />
      </div>

      <div className="relative min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-7">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-border pb-6">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/profile"
                )
              }
              className="flex items-center gap-1.5 text-xs font-bold text-textMuted hover:text-primary transition-colors mb-3"
            >
              <ArrowLeft
                size={14}
              />

              Back to Profile
            </button>

            <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.16em] mb-1">
              <HistoryIcon
                size={14}
              />

              Biometric Records
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight">
              Scan History
            </h1>

            <p className="text-xs text-textSecondary mt-1">
              Previous AI face
              analysis reports for
              your primary profile
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={
                loadHistory
              }
              icon={
                <RefreshCcw
                  size={14}
                />
              }
            >
              Refresh
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                navigate(
                  "/scanner"
                )
              }
              icon={
                <Sparkles
                  size={14}
                />
              }
            >
              New Face Scan
            </Button>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {errorMessage && (
          <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-xs font-bold text-error flex items-start gap-3">
            <AlertCircle
              size={18}
              className="shrink-0 mt-0.5"
            />

            <span>
              {errorMessage}
            </span>
          </div>
        )}

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        {history.length >
          0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SummaryCard
                label="Total Scans"
                value={String(
                  totalScans
                )}
                icon={
                  <ScanFace
                    size={17}
                  />
                }
              />

              <SummaryCard
                label="Latest Shape"
                value={
                  latestScan?.face_shape ||
                  "--"
                }
                icon={
                  <CheckCircle2
                    size={17}
                  />
                }
              />

              <SummaryCard
                label="Latest Accuracy"
                value={formatAccuracy(
                  latestScan?.ai_accuracy
                )}
                icon={
                  <ShieldCheck
                    size={17}
                  />
                }
              />
            </div>
          )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {history.length ===
          0 ? (
          <Card
            variant="surface"
            className="p-12 border-dashed border-border text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-surfaceDark border border-border mx-auto flex items-center justify-center">
              <HistoryIcon
                size={28}
                className="text-textMuted"
              />
            </div>

            <h3 className="text-base font-black text-white mt-5">
              No Previous
              Scans Found
            </h3>

            <p className="text-xs text-textSecondary max-w-sm mx-auto mt-2 leading-relaxed">
              Complete your first
              three-angle AI face
              scan to create a facial
              geometry report.
            </p>

            <Button
              variant="primary"
              size="sm"
              className="mt-5"
              onClick={() =>
                navigate(
                  "/scanner"
                )
              }
              icon={
                <Sparkles
                  size={14}
                />
              }
            >
              START FACE SCAN
            </Button>
          </Card>
        ) : (
          /* ===================================================
             HISTORY LIST
          ==================================================== */

          <div className="space-y-5">
            {history.map(
              (
                item,
                index
              ) => (
                <Card
                  key={
                    item.id
                  }
                  variant="surface"
                  className="overflow-hidden border-border hover:border-primary/20 transition-all"
                >
                  {/* Card header */}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border bg-surfaceDark/40">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <ScanFace
                          size={16}
                          className="text-primary"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white">
                            AI Face Scan
                          </h3>

                          {index ===
                            0 && (
                              <span className="px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[8px] font-black uppercase tracking-wider text-emerald-400">
                                Latest
                              </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[10px] text-textMuted">
                          <CalendarDays
                            size={
                              11
                            }
                            className="text-primary"
                          />

                          <span>
                            {formatDate(
                              item.created_at
                            )}
                          </span>

                          {formatTime(
                            item.created_at
                          ) && (
                              <>
                                <span>
                                  •
                                </span>

                                <span>
                                  {formatTime(
                                    item.created_at
                                  )}
                                </span>
                              </>
                            )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono font-bold text-textMuted">
                      Scan #
                      {String(
                        history.length -
                        index
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* =========================================
                          IMAGES
                      ========================================== */}

                      <div className="lg:col-span-5">
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-primary mb-3">
                          3-Point
                          Biometric
                          Capture
                        </p>

                        <div className="grid grid-cols-3 gap-2.5">
                          <HistoryImage
                            src={
                              item.front_image_url
                            }
                            label="FRONT"
                          />

                          <HistoryImage
                            src={
                              item.left_image_url
                            }
                            label="LEFT"
                          />

                          <HistoryImage
                            src={
                              item.right_image_url
                            }
                            label="RIGHT"
                          />
                        </div>
                      </div>

                      {/* =========================================
                          DETAILS
                      ========================================== */}

                      <div className="lg:col-span-7 flex flex-col justify-between">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-primary mb-3">
                            Analysis
                            Summary
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl border border-border bg-surfaceDark p-4">
                              <p className="text-[9px] uppercase tracking-wider font-bold text-textMuted">
                                Face
                                Shape
                              </p>

                              <p className="mt-1.5 text-base font-black text-white capitalize">
                                {item.face_shape ||
                                  "--"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-border bg-surfaceDark p-4">
                              <p className="text-[9px] uppercase tracking-wider font-bold text-textMuted">
                                AI
                                Accuracy
                              </p>

                              <p className="mt-1.5 text-base font-black text-primary">
                                {formatAccuracy(
                                  item.ai_accuracy
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 rounded-xl border border-border bg-surfaceDark/70 px-4 py-3">
                            <p className="text-[9px] font-mono text-textMuted truncate">
                              SCAN ID:{" "}
                              {
                                item.id
                              }
                            </p>
                          </div>
                        </div>

                        {/* =======================================
                            ACTIONS
                        ======================================== */}

                        <div className="flex flex-col sm:flex-row gap-3 mt-5 pt-4 border-t border-border">
                          <Button
                            variant="secondary"
                            size="md"
                            className="w-full text-xs font-bold"
                            onClick={() =>
                              openFaceResult(
                                item.id
                              )
                            }
                          >
                            QUICK RESULT
                          </Button>

                          <Button
                            variant="primary"
                            size="md"
                            className="w-full text-xs font-black"
                            onClick={() =>
                              openReport(
                                item.id
                              )
                            }
                            icon={
                              <ArrowRight
                                size={
                                  15
                                }
                              />
                            }
                          >
                            VIEW REPORT
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>
        )}

        {/* =====================================================
            SECURITY INFO
        ====================================================== */}

        {history.length >
          0 && (
            <Card
              variant="dark"
              className="p-5 border-border"
            >
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={19}
                  className="text-primary shrink-0 mt-0.5"
                />

                <p className="text-[11px] text-textSecondary leading-relaxed">
                  <span className="font-black text-white">
                    Scan History:
                  </span>{" "}
                  Every item represents
                  a saved{" "}
                  <span className="font-bold text-primary">
                    face_scans
                  </span>{" "}
                  record. Opening a
                  report uses that
                  record's exact scan ID
                  to retrieve its facial
                  geometry metrics.
                </p>
              </div>
            </Card>
          )}
      </div>
    </div>
  );
};

/* ============================================================
   HISTORY IMAGE
============================================================ */

interface HistoryImageProps {
  src?: string | null;

  label: string;
}

const HistoryImage: React.FC<
  HistoryImageProps
> = ({
  src,
  label,
}) => {
    return (
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-surfaceDark">
        {src ? (
          <img
            src={src}
            alt={`${label} scan`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ScanFace
              size={19}
              className="text-textMuted"
            />
          </div>
        )}

        <span className="absolute left-1.5 right-1.5 bottom-1.5 py-0.5 rounded-md bg-black/80 text-[7px] font-black tracking-wider text-center text-primary">
          {label}
        </span>
      </div>
    );
  };

/* ============================================================
   SUMMARY CARD
============================================================ */

interface SummaryCardProps {
  label: string;

  value: string;

  icon: React.ReactNode;
}

const SummaryCard: React.FC<
  SummaryCardProps
> = ({
  label,
  value,
  icon,
}) => {
    return (
      <div className="rounded-2xl border border-border bg-surface px-5 py-4 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-textMuted">
              {label}
            </p>

            <p className="mt-1.5 text-lg font-black text-white capitalize">
              {value}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl border border-primary/25 bg-primary/[0.07] flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </div>
    );
  };

export default HistoryPage;