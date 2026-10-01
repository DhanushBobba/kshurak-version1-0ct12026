import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { supabase } from "@/lib/supabase";
import { generatePDF } from "@/utils/pdfGenerator";

import {
  Download,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  BarChart3,
  Flame,
  AlertCircle,
  ScanFace,
  RotateCcw,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";

/* ============================================================
   TYPES
============================================================ */

interface FaceScanRecord {
  id: string;

  profile_id?: string | null;

  front_image_url?: string | null;
  left_image_url?: string | null;
  right_image_url?: string | null;

  face_shape?: string | null;

  ai_accuracy?: number | string | null;

  scan_version?: string | null;

  scanned_at?: string | null;
  created_at?: string | null;

  [key: string]: any;
}

interface FaceMetricsRecord {
  id?: string;

  scan_id?: string;
  profile_id?: string | null;

  face_length?: any;
  face_width?: any;
  face_ratio?: any;

  forehead_width?: any;
  forehead_height?: any;

  cheekbone_width?: any;

  jaw_width?: any;
  jaw_angle?: any;
  jawline_shape?: any;

  face_symmetry?: any;

  [key: string]: any;
}

/* ============================================================
   COMPONENT
============================================================ */

export const GeometryPage: React.FC = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const [searchParams] =
    useSearchParams();

  /*
   * ==========================================================
   * SCAN ID
   * ==========================================================
   *
   * Scanner currently sends:
   *
   * navigate("/geometry", {
   *   state: {
   *     scanId,
   *     data,
   *     images
   *   }
   * })
   *
   * We also support:
   *
   * /geometry?scanId=xxxx
   *
   * This allows the same scan to survive
   * refresh/deep-link navigation later.
   */

  const stateScanId =
    location.state?.scanId
      ? String(
          location.state.scanId
        )
      : "";

  const queryScanId =
    searchParams.get("scanId") ||
    "";

  const scanId =
    stateScanId ||
    queryScanId;

  /*
   * ==========================================================
   * STATE
   * ==========================================================
   */

  const [
    scan,
    setScan,
  ] =
    useState<FaceScanRecord | null>(
      null
    );

  const [
    metrics,
    setMetrics,
  ] =
    useState<FaceMetricsRecord | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    downloading,
    setDownloading,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    );

  /* ============================================================
     LOAD GEOMETRY

     Same flow as mobile:
       scanId
       ↓
       face_scans
       ↓
       face_metrics
  ============================================================ */

  useEffect(() => {
    const loadGeometry =
      async () => {
        try {
          setLoading(true);

          setErrorMessage(
            null
          );

          /*
           * Mobile requires scanId.
           * Web should not silently render fake sample data.
           */

          if (!scanId) {
            throw new Error(
              "Geometry scan ID is missing. Please complete a face scan first."
            );
          }

          console.log(
            "GEOMETRY RECEIVED SCAN ID:",
            scanId
          );

          /* ============================
             FACE SCAN
          ============================ */

          const {
            data: scanData,
            error: scanError,
          } =
            await supabase
              .from(
                "face_scans"
              )
              .select("*")
              .eq(
                "id",
                scanId
              )
              .maybeSingle();

          if (scanError) {
            console.error(
              "FACE SCAN LOAD ERROR:",
              scanError
            );

            throw scanError;
          }

          if (!scanData) {
            throw new Error(
              "Face scan data was not found."
            );
          }

          /* ============================
             FACE METRICS
          ============================ */

          const {
            data: metricData,
            error: metricError,
          } =
            await supabase
              .from(
                "face_metrics"
              )
              .select("*")
              .eq(
                "scan_id",
                scanId
              )
              .maybeSingle();

          if (
            metricError
          ) {
            console.error(
              "FACE METRICS LOAD ERROR:",
              metricError
            );

            throw metricError;
          }

          if (!metricData) {
            throw new Error(
              "Face metrics data was not found for this scan."
            );
          }

          console.log(
            "GEOMETRY SCAN DATA:",
            scanData
          );

          console.log(
            "GEOMETRY METRICS DATA:",
            metricData
          );

          /*
           * Same mobile principle:
           * DB becomes source of truth.
           */

          setScan(scanData);

          /*
           * Normalize snake_case /
           * camelCase possibilities.
           */

          setMetrics({
            ...metricData,

            face_length:
              metricData.face_length ??
              metricData.faceLength,

            face_width:
              metricData.face_width ??
              metricData.faceWidth,

            face_ratio:
              metricData.face_ratio ??
              metricData.faceRatio,

            forehead_width:
              metricData.forehead_width ??
              metricData.foreheadWidth,

            forehead_height:
              metricData.forehead_height ??
              metricData.foreheadHeight,

            cheekbone_width:
              metricData.cheekbone_width ??
              metricData.cheekboneWidth,

            jaw_width:
              metricData.jaw_width ??
              metricData.jawWidth,

            jaw_angle:
              metricData.jaw_angle ??
              metricData.jawAngle,

            jawline_shape:
              metricData.jawline_shape ??
              metricData.jawlineShape,

            face_symmetry:
              metricData.face_symmetry ??
              metricData.faceSymmetry,
          });
        } catch (
          error: any
        ) {
          console.error(
            "GEOMETRY LOAD ERROR:",
            error
          );

          setScan(null);

          setMetrics(null);

          setErrorMessage(
            error?.message ||
              "Unable to load geometry report."
          );
        } finally {
          setLoading(false);
        }
      };

    loadGeometry();
  }, [scanId]);

  /* ============================================================
     DISPLAY VALUE
  ============================================================ */

  const displayValue = (
    value: any,
    suffix = ""
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

    /*
     * Do not duplicate suffix if
     * backend already supplied it.
     */

    if (
      suffix &&
      text
        .toLowerCase()
        .includes(
          suffix.toLowerCase()
        )
    ) {
      return text;
    }

    return `${text}${suffix}`;
  };

  /* ============================================================
     CONFIDENCE
  ============================================================ */

  const accuracyValue =
    useMemo(() => {
      if (
        !scan?.ai_accuracy
      ) {
        return "--";
      }

      const text =
        String(
          scan.ai_accuracy
        );

      return text.includes(
        "%"
      )
        ? text
        : `${text}%`;
    }, [scan]);

  /* ============================================================
     METRICS ARRAY

     Same 10 mobile metrics.
  ============================================================ */

  const metricList =
    useMemo(
      () => [
        {
          title:
            "Face Length",
          value:
            displayValue(
              metrics?.face_length
            ),
        },

        {
          title:
            "Face Width",
          value:
            displayValue(
              metrics?.face_width
            ),
        },

        {
          title:
            "Face Ratio (L/W)",
          value:
            displayValue(
              metrics?.face_ratio
            ),
        },

        {
          title:
            "Forehead Width",
          value:
            displayValue(
              metrics?.forehead_width
            ),
        },

        {
          title:
            "Forehead Height",
          value:
            displayValue(
              metrics?.forehead_height
            ),
        },

        {
          title:
            "Cheekbone Width",
          value:
            displayValue(
              metrics?.cheekbone_width
            ),
        },

        {
          title:
            "Jaw Width",
          value:
            displayValue(
              metrics?.jaw_width
            ),
        },

        {
          title:
            "Jaw Angle",
          value:
            displayValue(
              metrics?.jaw_angle
            ),
        },

        {
          title:
            "Jawline Shape",
          value:
            displayValue(
              metrics?.jawline_shape
            ),
        },

        {
          title:
            "Face Symmetry",
          value:
            displayValue(
              metrics?.face_symmetry
            ),
        },
      ],
      [metrics]
    );

  /* ============================================================
     DOWNLOAD REPORT

     Mobile behavior:
       use already-saved face_scans /
       face_metrics
       ↓
       generate PDF

     No additional geometry_reports insert.
  ============================================================ */

  const handleDownload =
    async () => {
      if (
        !scan ||
        !metrics
      ) {
        setErrorMessage(
          "Geometry report data is unavailable."
        );

        return;
      }

      try {
        setDownloading(
          true
        );

        setErrorMessage(
          null
        );

        await generatePDF({
          image:
            scan.front_image_url ||
            undefined,

          faceShape:
            scan.face_shape ||
            "N/A",

          symmetry:
            displayValue(
              metrics.face_symmetry
            ),

          metrics:
            metricList,

          /*
           * Keep PDF helper contract.
           * Recommendation details will be
           * aligned further when Try-On /
           * recommendation mapping is integrated.
           */
          style:
            `Personalized hairstyle recommendations for ${scan.face_shape || "your"} face shape`,
        });
      } catch (
        error: any
      ) {
        console.error(
          "PDF ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
            "Unable to generate PDF report."
        );
      } finally {
        setDownloading(
          false
        );
      }
    };

  /* ============================================================
     TRY ON

     Same mobile flow:
       Geometry
       ↓
       TryOn
       ↓
       same scanId
  ============================================================ */

  const openRecommendedTryOn =
    () => {
      if (!scanId) {
        setErrorMessage(
          "Scan ID is unavailable."
        );

        return;
      }

      /*
       * Pass scanId two ways:
       *
       * 1. query string → survives refresh
       * 2. state → easy React Router access
       */

      navigate(
        `/tryon?scanId=${encodeURIComponent(
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
     LOADING UI
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20" />

          <div className="absolute w-16 h-16 rounded-full border-2 border-transparent border-t-primary animate-spin" />

          <ScanFace
            size={24}
            className="absolute text-primary"
          />
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-primary">
          Loading Geometry Report
        </p>

        <p className="mt-2 text-[11px] text-textMuted">
          Reading your verified
          facial metrics...
        </p>
      </div>
    );
  }

  /* ============================================================
     ERROR / MISSING SCAN
  ============================================================ */

  if (
    !scan ||
    !metrics
  ) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <Card
          variant="surface"
          className="w-full max-w-lg p-8 border-border text-center"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl border border-error/30 bg-error/10 flex items-center justify-center">
            <AlertCircle
              size={26}
              className="text-error"
            />
          </div>

          <h2 className="mt-5 text-xl font-black text-white">
            Geometry Report
            Unavailable
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-textSecondary">
            {errorMessage ||
              "We could not find the facial scan data required to build this report."}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                navigate("/")
              }
            >
              GO HOME
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={
                <ScanFace
                  size={16}
                />
              }
              onClick={() =>
                navigate(
                  "/scanner"
                )
              }
            >
              START NEW SCAN
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ============================================================
     MAIN UI
  ============================================================ */

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* =====================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[440px] w-[440px] rounded-full bg-primary/[0.025] blur-3xl" />

        <div className="absolute -right-40 top-[45%] h-[440px] w-[440px] rounded-full bg-primary/[0.02] blur-3xl" />
      </div>

      <div className="relative py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* =====================================================
            TOP BANNER
        ====================================================== */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider mb-1">
              <CheckCircle2
                size={16}
                className="text-primary"
              />

              Analysis Verified
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight">
              AI Facial Geometry
              Report
            </h1>

            <p className="text-xs text-textSecondary mt-1">
              Computed from your
              verified front, left and
              right facial captures
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={
                handleDownload
              }
              loading={
                downloading
              }
              disabled={
                downloading
              }
              icon={
                <Download
                  size={16}
                />
              }
            >
              Download PDF Report
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={
                openRecommendedTryOn
              }
              icon={
                <Sparkles
                  size={16}
                />
              }
            >
              Try AI Hairstyle
            </Button>
          </div>
        </div>

        {/* =====================================================
            ERROR BANNER
        ====================================================== */}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-error/10 border border-error/30 text-error text-xs font-bold flex items-start gap-3">
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
            MAIN GRID
        ====================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ===================================================
              LEFT
          ==================================================== */}

          <div className="lg:col-span-6 space-y-6">
            {/* =================================================
                MULTI VIEW IMAGES
            ================================================== */}

            <Card
              variant="surface"
              className="p-6 border-border space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-primary">
                    Multi-View
                    Biometric Capture
                  </span>

                  <p className="text-[10px] text-textMuted mt-1">
                    Scan ID:{" "}
                    <span className="font-mono text-textSecondary">
                      {scanId.slice(
                        0,
                        8
                      )}
                      ...
                    </span>
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 whitespace-nowrap">
                  ✓ 3 ANGLES VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FaceImage
                  src={
                    scan.front_image_url
                  }
                  alt="Front View"
                  label="FRONT 0°"
                />

                <FaceImage
                  src={
                    scan.left_image_url
                  }
                  alt="Left View"
                  label="LEFT 45°"
                />

                <FaceImage
                  src={
                    scan.right_image_url
                  }
                  alt="Right View"
                  label="RIGHT 45°"
                />
              </div>
            </Card>

            {/* =================================================
                FACE PROFILE SUMMARY
            ================================================== */}

            <Card
              variant="surface"
              className="p-6 border-border space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-primary uppercase tracking-wider">
                  Face Profile Summary
                </h3>

                <Cpu
                  size={16}
                  className="text-textMuted"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SummaryMetric
                  label="Shape"
                  value={
                    scan.face_shape ||
                    "--"
                  }
                />

                <SummaryMetric
                  label="Symmetry"
                  value={displayValue(
                    metrics.face_symmetry
                  )}
                  accent
                />

                <SummaryMetric
                  label="Confidence"
                  value={
                    accuracyValue
                  }
                  success
                />
              </div>
            </Card>

            {/* =================================================
                RECOMMENDED HAIRSTYLES
            ================================================== */}

            <Card
              variant="surface"
              className="p-6 border-border space-y-4"
            >
              <div className="flex items-center gap-2">
                <Flame
                  size={18}
                  className="text-primary fill-primary"
                />

                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Personalized
                  Hairstyle
                  Recommendations
                </h3>
              </div>

              <div className="p-4 bg-surfaceDark rounded-2xl border border-border space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-primary">
                      Detected Face
                      Shape
                    </p>

                    <h4 className="text-lg font-black text-white mt-1 capitalize">
                      {scan.face_shape ||
                        "Detected"}{" "}
                      Face
                    </h4>
                  </div>

                  <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-primary/10 text-primary rounded-full border border-primary/30">
                    AI Matched
                  </span>
                </div>

                <p className="text-xs text-textSecondary leading-relaxed">
                  Kshurak will use
                  your{" "}
                  <span className="font-bold text-white">
                    {scan.face_shape ||
                      "detected"}
                  </span>{" "}
                  face shape together
                  with your saved facial
                  geometry to present
                  recommended hairstyles
                  in the Try-On module.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    "Face Shape Based",
                    "Geometry Matched",
                    "AI Recommended",
                    "Try-On Ready",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full text-sm font-black"
                onClick={
                  openRecommendedTryOn
                }
                icon={
                  <Sparkles
                    size={16}
                  />
                }
              >
                TRY ON RECOMMENDED
                HAIRSTYLES →
              </Button>
            </Card>
          </div>

          {/* ===================================================
              RIGHT
          ==================================================== */}

          <div className="lg:col-span-6 space-y-6">
            {/* =================================================
                METRICS
            ================================================== */}

            <Card
              variant="surface"
              className="p-6 border-border space-y-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white">
                    Biometric Facial
                    Measurements
                  </h3>

                  <p className="text-xs text-textSecondary mt-0.5">
                    10 facial geometry
                    values returned by
                    the AI analysis
                    pipeline
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.07]">
                  <BarChart3
                    size={20}
                    className="text-primary"
                  />
                </div>
              </div>

              {/* 2-column compact premium metrics */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {metricList.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item.title
                      }
                      className="group rounded-xl border border-border bg-surfaceDark p-3.5 transition-all hover:border-primary/25 hover:bg-surfaceLight"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />

                            <span className="text-[10px] font-bold uppercase tracking-wide text-textMuted truncate">
                              {
                                item.title
                              }
                            </span>
                          </div>

                          <p className="mt-2 text-sm font-black text-white break-words">
                            {
                              item.value
                            }
                          </p>
                        </div>

                        <span className="text-[9px] font-mono font-black text-primary/50">
                          {String(
                            index +
                              1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Actions */}

              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-xs font-bold"
                  onClick={
                    handleDownload
                  }
                  loading={
                    downloading
                  }
                  disabled={
                    downloading
                  }
                  icon={
                    <Download
                      size={16}
                    />
                  }
                >
                  DOWNLOAD SPEC SHEET
                  PDF
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full text-xs font-bold"
                  onClick={() =>
                    navigate(
                      "/booking",
                      {
                        state: {
                          scanId,
                        },
                      }
                    )
                  }
                >
                  BOOK CONSULTATION
                </Button>
              </div>
            </Card>

            {/* =================================================
                PIPELINE INFO
            ================================================== */}

            <Card
              variant="dark"
              className="p-5 border-border"
            >
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="text-primary shrink-0 mt-0.5"
                />

                <div className="text-xs text-textSecondary leading-relaxed">
                  <span className="font-bold text-white">
                    Verified Scan
                    Record:
                  </span>{" "}
                  This report is
                  loaded directly from
                  the same{" "}
                  <span className="text-primary font-bold">
                    face_scans
                  </span>{" "}
                  and{" "}
                  <span className="text-primary font-bold">
                    face_metrics
                  </span>{" "}
                  records used by the
                  mobile application.
                </div>
              </div>
            </Card>

            {/* =================================================
                NEW SCAN
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/scanner"
                )
              }
              className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-textMuted transition-colors hover:text-primary"
            >
              <RotateCcw
                size={14}
              />

              Run Another Face Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   FACE IMAGE
============================================================ */

interface FaceImageProps {
  src?: string | null;

  alt: string;

  label: string;
}

const FaceImage: React.FC<
  FaceImageProps
> = ({
  src,
  alt,
  label,
}) => {
  return (
    <div className="space-y-1.5 text-center">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surfaceDark border border-border">
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-textMuted">
            <ScanFace
              size={22}
            />

            <span className="text-[9px] font-bold uppercase">
              No Image
            </span>
          </div>
        )}

        <span className="absolute bottom-1.5 left-1.5 right-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-black text-primary">
          {label}
        </span>
      </div>
    </div>
  );
};

/* ============================================================
   SUMMARY METRIC
============================================================ */

interface SummaryMetricProps {
  label: string;

  value: string;

  accent?: boolean;

  success?: boolean;
}

const SummaryMetric: React.FC<
  SummaryMetricProps
> = ({
  label,
  value,
  accent = false,
  success = false,
}) => {
  return (
    <div className="p-3.5 bg-surfaceDark rounded-xl border border-border text-center">
      <span className="text-[10px] text-textMuted font-bold uppercase block">
        {label}
      </span>

      <span
        className={`text-base font-black mt-1 block capitalize ${
          success
            ? "text-emerald-400"
            : accent
            ? "text-primary"
            : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

export default GeometryPage;