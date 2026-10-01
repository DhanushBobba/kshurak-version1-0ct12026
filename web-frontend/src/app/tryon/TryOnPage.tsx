import React, { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  getRecommendedHairstyles,
  HairstyleRecommendation,
} from "@/constants/hairstyleRecommendations";
import {
  Sparkles,
  Camera,
  Scissors,
  Calendar,
  Check,
  ScanFace,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Ruler,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";

interface ScanRecord {
  id: string;
  face_shape?: string | null;
  ai_accuracy?: string | number | null;
  front_image_url?: string | null;
  left_image_url?: string | null;
  right_image_url?: string | null;
  [key: string]: any;
}

interface MetricRecord {
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

interface GeometryMetricProps {
  label: string;
  value: string;
  wide?: boolean;
}

interface ScanImageProps {
  uri?: string | null;
  label: string;
}

const normalizeShapeForFolder = (
  value?: string | null
) => {
  if (!value) return "";

  return value
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");
};

const getWebHairstyleImage = (
  hairstyle: HairstyleRecommendation,
  faceShape?: string | null
) => {
  const shapeFolder =
    normalizeShapeForFolder(faceShape);

  return `/assets/hairstyles/${shapeFolder}/${hairstyle.id}.png`;
};

export const TryOnPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateScanId =
    location.state?.scanId
      ? String(location.state.scanId)
      : "";

  const queryScanId =
    searchParams.get("scanId") || "";

  const scanId =
    stateScanId || queryScanId;

  const [scan, setScan] =
    useState<ScanRecord | null>(null);

  const [metrics, setMetrics] =
    useState<MetricRecord | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [
    selectedHairstyle,
    setSelectedHairstyle,
  ] =
    useState<HairstyleRecommendation | null>(
      null
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(null);

  useEffect(() => {
    const loadTryOnData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        if (!scanId) {
          setLoading(false);
          return;
        }

        const {
          data: scanData,
          error: scanError,
        } = await supabase
          .from("face_scans")
          .select("*")
          .eq("id", scanId)
          .maybeSingle();

        if (scanError) {
          throw scanError;
        }

        if (!scanData) {
          throw new Error(
            "Face scan data not found."
          );
        }

        const {
          data: metricData,
          error: metricError,
        } = await supabase
          .from("face_metrics")
          .select("*")
          .eq("scan_id", scanId)
          .maybeSingle();

        if (metricError) {
          throw metricError;
        }

        if (!metricData) {
          throw new Error(
            "Face metrics data not found."
          );
        }

        console.log(
          "TRYON SCAN DATA:",
          scanData
        );

        console.log(
          "TRYON METRICS DATA:",
          metricData
        );

        setScan(scanData);
        setMetrics(metricData);
      } catch (error: any) {
        console.error(
          "TRYON LOAD ERROR:",
          error
        );

        setScan(null);
        setMetrics(null);

        setErrorMessage(
          error?.message ||
          "Unable to load Try-On data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTryOnData();
  }, [scanId]);

  const recommendedHairstyles =
    useMemo(() => {
      if (!scan?.face_shape) {
        return [];
      }

      return getRecommendedHairstyles(
        scan.face_shape
      );
    }, [scan?.face_shape]);

  const handleTryOn = (
    hairstyle: HairstyleRecommendation
  ) => {
    setSelectedHairstyle(
      hairstyle
    );
  };

  const formatValue = (
    value: any
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "--";
    }

    return String(value);
  };

  const accuracyValue =
    useMemo(() => {
      if (
        scan?.ai_accuracy === null ||
        scan?.ai_accuracy === undefined ||
        scan?.ai_accuracy === ""
      ) {
        return "--";
      }

      const value =
        String(scan.ai_accuracy);

      return value.includes("%")
        ? value
        : `${value}%`;
    }, [scan?.ai_accuracy]);

  const geometryMetrics =
    useMemo(
      () => [
        {
          label: "Face Length",
          value: formatValue(
            metrics?.face_length
          ),
        },
        {
          label: "Face Width",
          value: formatValue(
            metrics?.face_width
          ),
        },
        {
          label: "Face Ratio",
          value: formatValue(
            metrics?.face_ratio
          ),
        },
        {
          label: "Forehead Width",
          value: formatValue(
            metrics?.forehead_width
          ),
        },
        {
          label: "Forehead Height",
          value: formatValue(
            metrics?.forehead_height
          ),
        },
        {
          label: "Cheekbone Width",
          value: formatValue(
            metrics?.cheekbone_width
          ),
        },
        {
          label: "Jaw Width",
          value: formatValue(
            metrics?.jaw_width
          ),
        },
        {
          label: "Jaw Angle",
          value: formatValue(
            metrics?.jaw_angle
          ),
        },
        {
          label: "Jawline Shape",
          value: formatValue(
            metrics?.jawline_shape
          ),
        },
        {
          label: "Face Symmetry",
          value: formatValue(
            metrics?.face_symmetry
          ),
        },
      ],
      [metrics]
    );

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-4 border-primary/20" />
          <div className="absolute w-14 h-14 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <Scissors
            size={19}
            className="absolute text-primary"
          />
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-wider text-primary">
          Loading Recommendations...
        </p>
        <p className="mt-2 text-[10px] text-textMuted">
          Matching hairstyles with your facial geometry
        </p>
      </div>
    );
  }

  if (!scanId) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <Card
          variant="surface"
          className="w-full max-w-lg p-8 border-border text-center"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl border border-primary/25 bg-primary/[0.07] flex items-center justify-center">
            <ScanFace
              size={25}
              className="text-primary"
            />
          </div>
          <h2 className="mt-5 text-xl font-black text-white">
            Face Scan Required
          </h2>
          <p className="mt-2 text-xs text-textSecondary leading-relaxed">
            Complete a face scan first to view personalized hairstyle recommendations.
          </p>
          <Button
            variant="primary"
            size="md"
            className="mt-6"
            onClick={() =>
              navigate("/scanner")
            }
            icon={
              <Camera size={16} />
            }
          >
            START FACE SCAN
          </Button>
        </Card>
      </div>
    );
  }

  if (!scan || !metrics) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <Card
          variant="surface"
          className="w-full max-w-lg p-8 border-border text-center"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-error/10 border border-error/30 flex items-center justify-center">
            <AlertCircle
              size={26}
              className="text-error"
            />
          </div>
          <h2 className="mt-5 text-xl font-black text-white">
            Report Not Available
          </h2>
          <p className="mt-2 text-xs text-textSecondary leading-relaxed">
            {errorMessage ||
              "We could not load the facial geometry information for this scan."}
          </p>
          <Button
            variant="primary"
            size="md"
            className="mt-6"
            onClick={() =>
              navigate("/scanner")
            }
          >
            NEW FACE SCAN
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[430px] w-[430px] rounded-full bg-primary/[0.025] blur-3xl" />
        <div className="absolute -right-40 top-[55%] h-[430px] w-[430px] rounded-full bg-primary/[0.02] blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.16em] mb-1">
              <Sparkles
                size={14}
                className="fill-primary"
              />
              Personalized Selection
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight">
              AI Hairstyle Try-On
            </h1>

            <p className="text-xs text-textSecondary mt-1">
              Recommended using your saved facial geometry and detected face shape
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate("/scanner")
              }
              icon={
                <Camera size={14} />
              }
            >
              New Face Scan
            </Button>

            <Button
              variant="primary"
              size="sm"
              disabled={!selectedHairstyle}
              onClick={() =>
                navigate(
                  "/booking",
                  {
                    state: {
                      scanId,
                      hairstyle:
                        selectedHairstyle,
                    },
                  }
                )
              }
              icon={
                <Calendar size={14} />
              }
            >
              Book This Cut
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <Card
              variant="surface"
              className="p-6 border-border space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">
                    Your Face Scan
                  </p>

                  <h3 className="mt-1 text-sm font-black text-white">
                    3-Angle Dataset
                  </h3>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-surfaceDark border border-border text-[9px] font-black text-textSecondary">
                  3 ANGLES
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <ScanImage
                  uri={
                    scan.front_image_url
                  }
                  label="FRONT"
                />

                <ScanImage
                  uri={
                    scan.left_image_url
                  }
                  label="LEFT"
                />

                <ScanImage
                  uri={
                    scan.right_image_url
                  }
                  label="RIGHT"
                />
              </div>
            </Card>

            <Card
              variant="surface"
              className="p-6 border-border"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">
                    Facial Geometry
                  </p>

                  <h3 className="mt-1 text-base font-black text-white">
                    Complete Geometry Report
                  </h3>
                </div>

                <BarChart3
                  size={19}
                  className="text-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <GeometryMetric
                  label="Face Shape"
                  value={formatValue(
                    scan.face_shape
                  )}
                />

                <GeometryMetric
                  label="AI Accuracy"
                  value={
                    accuracyValue
                  }
                />
              </div>

              <div className="h-px bg-border my-4" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Ruler
                    size={14}
                    className="text-primary"
                  />

                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-textSecondary">
                    Facial Measurements
                  </p>
                </div>

                <span className="rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-1 text-[8px] font-black text-primary">
                  10 METRICS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {geometryMetrics.map(
                  (item) => (
                    <GeometryMetric
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      wide={
                        item.label ===
                        "Jawline Shape" ||
                        item.label ===
                        "Face Symmetry"
                      }
                    />
                  )
                )}
              </div>
            </Card>

            <Card
              variant="dark"
              className="p-5 border-border"
            >
              {selectedHairstyle ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-primary/30 bg-surfaceDark shrink-0">
                    <img
                      src={getWebHairstyleImage(
                        selectedHairstyle,
                        scan.face_shape
                      )}
                      alt={
                        selectedHairstyle.name
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-primary">
                      Selected Hairstyle
                    </p>

                    <h4 className="mt-1 text-base font-black text-white">
                      {
                        selectedHairstyle.name
                      }
                    </h4>

                    <p className="mt-1 text-[10px] text-textMuted">
                      Recommended for your{" "}
                      {scan.face_shape} face profile
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={19}
                    className="text-primary shrink-0 mt-0.5"
                  />

                  <div>
                    <p className="text-xs font-black text-white">
                      Choose a Recommended Style
                    </p>

                    <p className="mt-1 text-[10px] leading-relaxed text-textSecondary">
                      Select one of the hairstyles recommended for your detected face shape.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">
                Personalized Selection
              </p>

              <h2 className="mt-1 text-2xl font-black text-white">
                Try On Recommended Hairstyles
              </h2>

              <p className="mt-2 text-xs text-textSecondary leading-relaxed">
                These hairstyles are selected for your{" "}
                <span className="font-black text-primary capitalize">
                  {scan.face_shape}
                </span>{" "}
                face shape and saved facial geometry.
              </p>
            </div>

            {recommendedHairstyles.length >
              0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {recommendedHairstyles.map(
                  (
                    hairstyle,
                    index
                  ) => {
                    const selected =
                      selectedHairstyle?.id ===
                      hairstyle.id;

                    const imageUrl =
                      getWebHairstyleImage(
                        hairstyle,
                        scan.face_shape
                      );

                    return (
                      <Card
                        key={
                          hairstyle.id
                        }
                        variant="surface"
                        className={`overflow-hidden transition-all ${selected
                            ? "border-primary shadow-xl shadow-amber-500/10"
                            : "border-border hover:border-primary/25"
                          }`}
                      >
                        <div className="relative aspect-[4/4.5] bg-surfaceDark overflow-hidden">
                          <img
                            src={
                              imageUrl
                            }
                            alt={
                              hairstyle.name
                            }
                            className="w-full h-full object-cover object-top"
                            onError={(
                              event
                            ) => {
                              console.error(
                                "HAIRSTYLE IMAGE FAILED:",
                                imageUrl
                              );

                              event.currentTarget.style.display =
                                "none";
                            }}
                          />

                          <div className="absolute top-3 left-3 min-w-[32px] h-7 px-2 rounded-lg bg-black/80 border border-white/10 flex items-center justify-center">
                            <span className="text-[8px] font-black tracking-wider text-primary">
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>
                          </div>

                          {selected && (
                            <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-primary text-black flex items-center gap-1.5 shadow-lg">
                              <Check
                                size={11}
                              />

                              <span className="text-[8px] font-black uppercase tracking-wider">
                                Selected
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h3
                            className={`text-sm font-black ${selected
                                ? "text-primary"
                                : "text-white"
                              }`}
                          >
                            {
                              hairstyle.name
                            }
                          </h3>

                          <p className="mt-1 text-[10px] text-textMuted">
                            Recommended for{" "}
                            {
                              scan.face_shape
                            }{" "}
                            facial geometry
                          </p>

                          <Button
                            type="button"
                            variant={
                              selected
                                ? "primary"
                                : "outline"
                            }
                            size="sm"
                            className="w-full mt-4 font-black"
                            onClick={() =>
                              handleTryOn(
                                hairstyle
                              )
                            }
                          >
                            {selected
                              ? "SELECTED"
                              : "TRY ON"}
                          </Button>
                        </div>
                      </Card>
                    );
                  }
                )}
              </div>
            ) : (
              <Card
                variant="surface"
                className="p-8 border-border text-center"
              >
                <Scissors
                  size={28}
                  className="text-textMuted mx-auto"
                />

                <h3 className="mt-4 text-sm font-black text-white">
                  Recommendations Unavailable
                </h3>

                <p className="mt-2 text-xs text-textSecondary">
                  No hairstyle collection was found for "
                  {scan.face_shape}".
                </p>
              </Card>
            )}

            {selectedHairstyle && (
              <Card
                variant="dark"
                className="p-5 border-border"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-primary">
                      Ready for the Next Step?
                    </p>

                    <h3 className="mt-1 text-sm font-black text-white">
                      {
                        selectedHairstyle.name
                      }
                    </h3>

                    <p className="mt-1 text-[10px] text-textSecondary">
                      Continue with this selected hairstyle to booking.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() =>
                      navigate(
                        "/booking",
                        {
                          state: {
                            scanId,
                            hairstyle:
                              selectedHairstyle,
                          },
                        }
                      )
                    }
                    icon={
                      <Calendar
                        size={15}
                      />
                    }
                  >
                    BOOK THIS CUT
                  </Button>
                </div>
              </Card>
            )}

            <div className="flex items-center gap-4 pt-2">
              <div className="h-px bg-border flex-1" />

              <p className="text-[8px] font-bold text-textMuted text-center">
                Recommendations based on your stored face analysis
              </p>

              <div className="h-px bg-border flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScanImage: React.FC<
  ScanImageProps
> = ({
  uri,
  label,
}) => {
    return (
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surfaceDark border border-border">
        {uri ? (
          <img
            src={uri}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ScanFace
              size={20}
              className="text-textMuted"
            />
          </div>
        )}

        <span className="absolute bottom-1.5 left-1.5 right-1.5 rounded-md bg-black/80 py-0.5 text-center text-[8px] font-black tracking-wider text-primary">
          {label}
        </span>
      </div>
    );
  };

const GeometryMetric: React.FC<
  GeometryMetricProps
> = ({
  label,
  value,
  wide = false,
}) => {
    return (
      <div
        className={`rounded-xl border border-border bg-surfaceDark p-3.5 transition-all hover:border-primary/25 hover:bg-surfaceLight ${wide
            ? "col-span-2"
            : ""
          }`}
      >
        <p className="text-[8px] font-black uppercase tracking-[0.13em] text-textMuted">
          {label}
        </p>

        <p className="mt-1.5 break-words text-[12px] font-black leading-5 text-white">
          {value || "--"}
        </p>
      </div>
    );
  };

export default TryOnPage;