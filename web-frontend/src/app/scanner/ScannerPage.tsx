import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { useCamera } from "@/hooks/useCamera";

import { uploadFaceImage } from "@/services/storage";

import { supabase } from "@/lib/supabase";

import {
  readFileAsDataURL,
} from "@/utils/imageConverter";

import {
  Camera,
  Upload,
  RotateCcw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  VideoOff,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";

/* ============================================================
   TYPES
============================================================ */

type ScanStep =
  | "front"
  | "left"
  | "right"
  | "complete";

type FaceImages = {
  front: string | null;
  left: string | null;
  right: string | null;
};

type FaceMetrics = {
  faceLength?: number | string | null;
  faceWidth?: number | string | null;
  faceRatio?: number | string | null;
  foreheadWidth?: number | string | null;
  foreheadHeight?: number | string | null;
  cheekboneWidth?: number | string | null;
  jawWidth?: number | string | null;
  jawAngle?: number | string | null;
  jawlineShape?: string | null;
  faceSymmetry?: number | string | null;
};

type FaceAnalysisResult = {
  faceShape: string;
  confidence: number | string;
  aiAccuracy?: number | string;
  metrics: FaceMetrics;
  [key: string]: any;
};

/* ============================================================
   BACKEND URL
============================================================ */
const API_URL = "";

/* ============================================================
   COMPONENT
============================================================ */

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    videoRef,
    isStreaming,
    error: cameraError,
    startCamera,
    stopCamera,
    capturePhoto,
  } = useCamera();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [step, setStep] =
    useState<ScanStep>("front");

  const [images, setImages] =
    useState<FaceImages>({
      front: null,
      left: null,
      right: null,
    });

  const [loading, setLoading] =
    useState(false);

  const [
    analysisProgress,
    setAnalysisProgress,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  // NO await here

  /* ============================================================
     CAMERA START / STOP
  ============================================================ */

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  /* ============================================================
     STEP HELPERS
  ============================================================ */

  const getStepNumber = () => {
    switch (step) {
      case "front":
        return "STEP 1 / 3";

      case "left":
        return "STEP 2 / 3";

      case "right":
        return "STEP 3 / 3";

      default:
        return "READY FOR AI ANALYSIS";
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case "front":
        return "LOOK STRAIGHT INTO CAMERA";

      case "left":
        return "TURN YOUR FACE LEFT";

      case "right":
        return "TURN YOUR FACE RIGHT";

      default:
        return "FACE CAPTURE COMPLETE";
    }
  };

  const getAngleLabel = () => {
    switch (step) {
      case "front":
        return "ANGLE: 0° FRONT";

      case "left":
        return "ANGLE: LEFT 45°";

      case "right":
        return "ANGLE: RIGHT 45°";

      default:
        return "CAPTURE COMPLETE";
    }
  };

  const getViewBadge = () => {
    switch (step) {
      case "front":
        return "1. FRONT VIEW";

      case "left":
        return "2. LEFT PROFILE";

      case "right":
        return "3. RIGHT PROFILE";

      default:
        return "3. COMPLETE";
    }
  };

  /* ============================================================
     RESET
  ============================================================ */

  const resetScan = () => {
    setImages({
      front: null,
      left: null,
      right: null,
    });

    setStep("front");

    setErrorMessage(null);

    setAnalysisProgress("");

    if (!isStreaming) {
      startCamera();
    }
  };

  /* ============================================================
     RETAKE
  ============================================================ */

  const retakeImage = (
    type:
      | "front"
      | "left"
      | "right"
  ) => {
    if (loading) {
      return;
    }

    setImages((prev) => ({
      ...prev,
      [type]: null,
    }));

    setStep(type);

    setErrorMessage(null);

    if (!isStreaming) {
      startCamera();
    }
  };

  /* ============================================================
     APPLY CAPTURE
  ============================================================ */

  const applyCapturedImage = (
    dataUrl: string
  ) => {
    setErrorMessage(null);

    if (step === "front") {
      setImages((prev) => ({
        ...prev,
        front: dataUrl,
      }));

      setStep("left");

      return;
    }

    if (step === "left") {
      setImages((prev) => ({
        ...prev,
        left: dataUrl,
      }));

      setStep("right");

      return;
    }

    if (step === "right") {
      setImages((prev) => ({
        ...prev,
        right: dataUrl,
      }));

      setStep("complete");

      return;
    }
  };

  /* ============================================================
     CAMERA CAPTURE
  ============================================================ */

  const handleCapture = () => {
    if (loading) {
      return;
    }

    if (
      step === "complete"
    ) {
      return;
    }

    if (!isStreaming) {
      setErrorMessage(
        "Camera is not active. Please allow camera access or upload an image."
      );

      return;
    }

    try {
      const photoDataUrl =
        capturePhoto();

      if (!photoDataUrl) {
        throw new Error(
          "Unable to capture image from camera."
        );
      }

      applyCapturedImage(
        photoDataUrl
      );
    } catch (error: any) {
      console.error(
        "CAMERA CAPTURE ERROR:",
        error
      );

      setErrorMessage(
        error?.message ||
        "Unable to capture image."
      );
    }
  };

  /* ============================================================
     MANUAL IMAGE UPLOAD
  ============================================================ */

  const handleFileUpload =
    async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target.files?.[0];

      /*
       * Allows user to select the
       * same filename again later.
       */
      e.target.value = "";

      if (!file) {
        return;
      }

      if (
        step === "complete"
      ) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setErrorMessage(
          "Please select a valid image file."
        );

        return;
      }

      try {
        const dataUrl =
          await readFileAsDataURL(
            file
          );

        applyCapturedImage(
          dataUrl
        );
      } catch (error) {
        console.error(
          "IMAGE UPLOAD ERROR:",
          error
        );

        setErrorMessage(
          "Failed to read the selected image."
        );
      }
    };

  /* ============================================================
     MOBILE-EQUIVALENT IMAGE COMPRESSION

     Mobile:
       resize width → 1024
       JPEG
       compress → 0.8
       Base64

     Browser equivalent below.
  ============================================================ */

  const convertToBase64 =
    async (
      source: string
    ): Promise<string> => {
      return new Promise(
        (resolve, reject) => {
          const image =
            new Image();

          image.onload = () => {
            try {
              const maxWidth =
                1024;

              const ratio =
                Math.min(
                  1,
                  maxWidth /
                  image.width
                );

              const width =
                Math.round(
                  image.width *
                  ratio
                );

              const height =
                Math.round(
                  image.height *
                  ratio
                );

              const canvas =
                document.createElement(
                  "canvas"
                );

              canvas.width =
                width;

              canvas.height =
                height;

              const context =
                canvas.getContext(
                  "2d"
                );

              if (!context) {
                reject(
                  new Error(
                    "Unable to process image."
                  )
                );

                return;
              }

              context.drawImage(
                image,
                0,
                0,
                width,
                height
              );

              const dataUrl =
                canvas.toDataURL(
                  "image/jpeg",
                  0.8
                );

              const base64 =
                dataUrl.split(
                  ","
                )[1];

              if (!base64) {
                reject(
                  new Error(
                    "Base64 conversion failed."
                  )
                );

                return;
              }

              resolve(base64);
            } catch (error) {
              reject(error);
            }
          };

          image.onerror = () => {
            reject(
              new Error(
                "Unable to load image for AI processing."
              )
            );
          };

          image.src = source;
        }
      );
    };

  /* ============================================================
     BACKEND FACE ANALYSIS

     Same request contract as Mobile:

     POST /api/v1/face/analyze

     {
       front,
       left,
       right
     }
  ============================================================ */

  const analyzeMultiAngleFace =
    async (
      faceImages: {
        front: string;
        left: string;
        right: string;
      }
    ): Promise<FaceAnalysisResult> => {
      if (
        !faceImages.front ||
        !faceImages.left ||
        !faceImages.right
      ) {
        throw new Error(
          "Three face images are required."
        );
      }

      const controller =
        new AbortController();

      const timeout =
        window.setTimeout(
          () =>
            controller.abort(),
          120000
        );

      try {
        const response = await fetch(
          `${API_URL}/api/v1/face/analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              front: faceImages.front,
              left: faceImages.left,
              right: faceImages.right,
            }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          let message =
            "Face analysis failed.";

          try {
            const body =
              await response.json();

            message =
              body?.detail ||
              message;
          } catch {
            const text =
              await response.text();

            if (text) {
              message = text;
            }
          }

          throw new Error(
            message
          );
        }

        const result =
          await response.json();

        if (!result) {
          throw new Error(
            "Empty AI response."
          );
        }

        /*
         * Same adapter strategy as mobile.
         */

        const rawMetrics =
          result.metrics ||
          result.face_metrics ||
          result.biometric_metrics ||
          {};

        return {
          ...result,

          faceShape:
            result.faceShape ||
            result.face_shape ||
            rawMetrics[
            "Face Shape"
            ] ||
            "Unknown",

          confidence:
            result.confidence ??
            result.ai_accuracy ??
            result.confidenceScore ??
            0,

          aiAccuracy:
            result.aiAccuracy ??
            result.ai_accuracy ??
            result.confidence ??
            0,

          metrics: {
            faceLength:
              rawMetrics.faceLength ??
              rawMetrics.face_length ??
              rawMetrics[
              "Face Length"
              ],

            faceWidth:
              rawMetrics.faceWidth ??
              rawMetrics.face_width ??
              rawMetrics[
              "Face Width"
              ],

            faceRatio:
              rawMetrics.faceRatio ??
              rawMetrics.face_ratio ??
              rawMetrics["Face Ratio"] ??
              rawMetrics["Face Ratio (Length-to-Width Ratio)"
              ],

            foreheadWidth:
              rawMetrics.foreheadWidth ??
              rawMetrics.forehead_width ??
              rawMetrics[
              "Forehead Width"
              ],

            foreheadHeight:
              rawMetrics.foreheadHeight ??
              rawMetrics.forehead_height ??
              rawMetrics[
              "Forehead Height"
              ],

            cheekboneWidth:
              rawMetrics.cheekboneWidth ??
              rawMetrics.cheekbone_width ??
              rawMetrics[
              "Cheekbone Width"
              ],

            jawWidth:
              rawMetrics.jawWidth ??
              rawMetrics.jaw_width ??
              rawMetrics[
              "Jaw Width"
              ],

            jawAngle:
              rawMetrics.jawAngle ??
              rawMetrics.jaw_angle ??
              rawMetrics[
              "Jaw Angle"
              ],

            jawlineShape:
              rawMetrics.jawlineShape ??
              rawMetrics.jawline_shape ??
              rawMetrics[
              "Jawline Shape"
              ],

            faceSymmetry:
              rawMetrics.faceSymmetry ??
              rawMetrics.face_symmetry ??
              rawMetrics[
              "Face Symmetry"
              ],
          },
        };
      } catch (error: any) {
        if (
          error?.name ===
          "AbortError"
        ) {
          throw new Error(
            "Face analysis timed out. Please try again."
          );
        }

        throw error;
      } finally {
        window.clearTimeout(
          timeout
        );
      }
    };

  /* ============================================================
     VALIDATE ALL IMAGES
  ============================================================ */

  const validateImages = () => {
    if (
      !images.front ||
      !images.left ||
      !images.right
    ) {
      setErrorMessage(
        "Please capture all three face angles: Front, Left and Right."
      );

      return false;
    }

    return true;
  };

  /* ============================================================
     MOBILE PARITY:
     COMPLETE AI + DATABASE FLOW
  ============================================================ */

  const startScan =
    async () => {
      if (loading) {
        return;
      }

      if (
        !validateImages()
      ) {
        return;
      }

      const frontImage =
        images.front;

      const leftImage =
        images.left;

      const rightImage =
        images.right;

      if (
        !frontImage ||
        !leftImage ||
        !rightImage
      ) {
        return;
      }

      try {
        setLoading(true);

        setErrorMessage(null);

        /*
         * ============================
         * AUTH USER
         * ============================
         */

        setAnalysisProgress(
          "Authenticating your Kshurak profile..."
        );

        const {
          data: authData,
          error: authError,
        } =
          await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        const authUser =
          authData.user ||
          user;

        if (!authUser) {
          navigate(
            "/auth/login",
            {
              replace: true,
            }
          );

          return;
        }

        /*
         * ============================
         * PROFILE LOOKUP

         * IMPORTANT:
         * Mobile uploads against profileId,
         * not auth user id.
         * ============================
         */

        const {
          data: profileRows,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id")
          .eq(
            "auth_user_id",
            authUser.id
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          )
          .limit(1);

        if (profileError) {
          throw profileError;
        }

        const profile =
          profileRows?.[0] || null;

        if (!profile) {
          throw new Error(
            "User profile is still being prepared. Please wait a moment and try again."
          );
        }

        const profileId =
          profile.id;

        console.log(
          "PROFILE ID:",
          profileId
        );

        /*
         * ============================
         * UPLOAD ORIGINAL IMAGES
         * ============================
         */

        setAnalysisProgress(
          "Uploading front, left and right face images..."
        );

        const [
          frontUrl,
          leftUrl,
          rightUrl,
        ] =
          await Promise.all([
            uploadFaceImage(
              frontImage,
              profileId,
              "front"
            ),

            uploadFaceImage(
              leftImage,
              profileId,
              "left"
            ),

            uploadFaceImage(
              rightImage,
              profileId,
              "right"
            ),
          ]);

        console.log(
          "FACE IMAGE URLS:",
          {
            frontUrl,
            leftUrl,
            rightUrl,
          }
        );

        /*
         * ============================
         * BASE64
         * ============================
         */

        setAnalysisProgress(
          "Preparing optimized biometric images..."
        );

        const [
          frontBase64,
          leftBase64,
          rightBase64,
        ] =
          await Promise.all([
            convertToBase64(
              frontImage
            ),

            convertToBase64(
              leftImage
            ),

            convertToBase64(
              rightImage
            ),
          ]);

        /*
         * Backend validates image lengths.
         */

        if (
          frontBase64.length <
          1000 ||
          leftBase64.length <
          1000 ||
          rightBase64.length <
          1000
        ) {
          throw new Error(
            "One or more captured images are invalid. Please retake the images."
          );
        }

        /*
         * ============================
         * FASTAPI → GEMINI
         * ============================
         */

        setAnalysisProgress(
          "AI is analyzing facial geometry..."
        );

        const result =
          await analyzeMultiAngleFace(
            {
              front:
                frontBase64,

              left:
                leftBase64,

              right:
                rightBase64,
            }
          );

        console.log(
          "FACE ANALYSIS RESULT:",
          result
        );

        /*
         * ============================
         * FACE SCAN
         * ============================
         */

        setAnalysisProgress(
          "Saving face scan..."
        );

        const {
          data: scanData,
          error: scanError,
        } =
          await supabase
            .from("face_scans")
            .insert({
              profile_id:
                profileId,

              front_image_url:
                frontUrl,

              left_image_url:
                leftUrl,

              right_image_url:
                rightUrl,

              face_shape:
                result.faceShape,

              ai_accuracy:
                result.confidence,

              scan_version:
                "3-angle",
            })
            .select()
            .single();

        if (scanError) {
          console.error(
            "SCAN INSERT ERROR:",
            scanError
          );

          throw scanError;
        }

        const scanId =
          scanData.id;

        console.log(
          "SCAN ID:",
          scanId
        );

        /*
         * ============================
         * FACE METRICS
         * ============================
         */

        setAnalysisProgress(
          "Saving facial geometry metrics..."
        );

        const metrics =
          result.metrics ||
          {};

        const {
          data: metricData,
          error: metricError,
        } =
          await supabase
            .from(
              "face_metrics"
            )
            .insert({
              scan_id:
                scanId,

              profile_id:
                profileId,

              face_length:
                metrics.faceLength ??
                null,

              face_width:
                metrics.faceWidth ??
                null,

              face_ratio:
                metrics.faceRatio ??
                null,

              forehead_width:
                metrics.foreheadWidth ??
                null,

              forehead_height:
                metrics.foreheadHeight ??
                null,

              cheekbone_width:
                metrics.cheekboneWidth ??
                null,

              jaw_width:
                metrics.jawWidth ??
                null,

              jaw_angle:
                metrics.jawAngle ??
                null,

              jawline_shape:
                metrics.jawlineShape ??
                null,

              face_symmetry:
                metrics.faceSymmetry ??
                null,
            })
            .select()
            .single();

        if (metricError) {
          console.error(
            "METRIC INSERT ERROR:",
            metricError
          );

          throw metricError;
        }

        console.log(
          "FACE METRICS:",
          metricData
        );

        /*
         * ============================
         * PROFILE HISTORY
         *
         * Same as mobile:
         * history failure should NOT
         * destroy successful scan.
         * ============================
         */

        setAnalysisProgress(
          "Updating profile history..."
        );

        try {
          const {
            error:
            historyError,
          } =
            await supabase
              .from(
                "profile_history"
              )
              .insert({
                profile_id:
                  profileId,

                activity_type:
                  "FACE_SCAN",

                title:
                  "AI Face Scan Completed",

                description:
                  `Face Shape: ${result.faceShape ||
                  "Detected"
                  } | Accuracy: ${result.confidence ||
                  result.aiAccuracy ||
                  "AI"
                  }`,

                activity_date:
                  new Date().toISOString(),
              });

          if (
            historyError
          ) {
            console.error(
              "HISTORY INSERT ERROR:",
              historyError
            );
          }
        } catch (
        historyError
        ) {
          console.error(
            "HISTORY INSERT ERROR:",
            historyError
          );
        }

        /*
         * ============================
         * SUCCESS
         * ============================
         */

        setAnalysisProgress(
          "Analysis complete. Opening your result..."
        );

        stopCamera();

        navigate(
          `/face-result?scanId=${encodeURIComponent(scanId)}`,
          {
            replace: true,
            state: {
              scanId,
              data: result,
              images: {
                front: frontUrl,
                left: leftUrl,
                right: rightUrl,
              },
            },
          }
        );
      } catch (
      error: any
      ) {
        console.error(
          "SCAN PROCESS ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
          "Unable to analyse face. Please verify the images and try again."
        );
      } finally {
        setLoading(false);

        setAnalysisProgress(
          ""
        );
      }
    };

  /* ============================================================
     CAPTURE COUNT
  ============================================================ */

  const imageCount = [
    images.front,
    images.left,
    images.right,
  ].filter(Boolean).length;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* =====================================================
          TOP BANNER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles
              size={14}
              className="fill-primary"
            />

            Computer Vision Module
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight">
            AI Face Geometry Scanner
          </h1>

          <p className="text-xs text-textSecondary mt-1">
            Capture three biometric
            viewpoints for accurate
            facial geometry analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetScan}
            disabled={loading}
            icon={
              <RotateCcw
                size={15}
              />
            }
          >
            Reset All
          </Button>

          <div className="px-3.5 py-1.5 rounded-full bg-surface border border-border text-xs font-bold text-white flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${step ===
                "complete"
                ? "bg-emerald-500"
                : "bg-primary animate-pulse"
                }`}
            />

            {getStepNumber()}
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
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
          MAIN LAYOUT
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ===================================================
            LEFT
        ==================================================== */}

        <div className="lg:col-span-7 space-y-4">
          <Card
            variant="surface"
            className="p-4 sm:p-6 overflow-hidden relative border-border"
          >
            {/* Viewfinder Header */}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${isStreaming
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-red-500"
                    }`}
                />

                <span className="text-xs font-black uppercase text-white tracking-wide">
                  Live Biometric Feed
                </span>
              </div>

              <div className="text-xs text-primary font-bold">
                {getAngleLabel()}
              </div>
            </div>

            {/* =================================================
                VIEWFINDER
            ================================================== */}

            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-black border-2 border-border flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Face frame */}

              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div
                  className={`relative w-64 h-80 rounded-[48%] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-between py-6 ${step ===
                    "complete"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-primary/60 bg-primary/5"
                    }`}
                >
                  <div className="text-[10px] uppercase font-black tracking-widest text-primary/80 bg-black/60 px-3 py-1 rounded-full">
                    {step ===
                      "front"
                      ? "Align Face in Center"
                      : step ===
                        "left"
                        ? "Turn Face Left"
                        : step ===
                          "right"
                          ? "Turn Face Right"
                          : "Aligned"}
                  </div>

                  {/* Scanner line */}

                  {step !==
                    "complete" && (
                      <div className="absolute left-6 right-6 top-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse" />
                    )}

                  <div className="w-12 h-12 border-t-2 border-b-2 border-primary/40 rounded-full" />

                  <div className="text-[10px] uppercase font-bold text-textMuted bg-black/60 px-3 py-0.5 rounded-full">
                    Jawline Indicator
                  </div>
                </div>
              </div>

              {/* Camera inactive */}

              {!isStreaming && (
                <div className="absolute inset-0 bg-surfaceDark/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                  <VideoOff
                    size={40}
                    className="text-textMuted"
                  />

                  <div>
                    <h4 className="text-sm font-black text-white">
                      Camera Access
                      Inactive
                    </h4>

                    <p className="text-xs text-textSecondary max-w-xs mt-1 leading-relaxed">
                      {cameraError ||
                        "Please allow camera access or use manual image upload."}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={
                      startCamera
                    }
                  >
                    Re-enable Camera
                  </Button>
                </div>
              )}

              {/* Viewpoint badge */}

              <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-xs font-black text-primary">
                {getViewBadge()}
              </div>

              {/* Step guide */}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-4 py-1.5 text-[10px] font-black tracking-wider text-white backdrop-blur-md">
                {getStepTitle()}
              </div>
            </div>

            {/* =================================================
                CONTROLS
            ================================================== */}

            <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-border">
              <div>
                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/*"
                  onChange={
                    handleFileUpload
                  }
                  className="hidden"
                />

                <Button
                  variant="secondary"
                  size="md"
                  disabled={
                    loading ||
                    step ===
                    "complete"
                  }
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  icon={
                    <Upload
                      size={16}
                    />
                  }
                >
                  Upload File
                </Button>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={
                  handleCapture
                }
                disabled={
                  loading ||
                  step ===
                  "complete" ||
                  !isStreaming
                }
                icon={
                  <Camera
                    size={20}
                  />
                }
                className="font-black px-8 text-sm"
              >
                {step ===
                  "front"
                  ? "CAPTURE FRONT"
                  : step ===
                    "left"
                    ? "CAPTURE LEFT"
                    : step ===
                      "right"
                      ? "CAPTURE RIGHT"
                      : "ALL CAPTURED"}
              </Button>
            </div>
          </Card>

          {/* ===================================================
              CAPTURE GUIDE
          ==================================================== */}

          <div className="p-4 rounded-2xl bg-surfaceDark border border-border flex items-start gap-3.5">
            <HelpCircle
              size={20}
              className="text-primary shrink-0 mt-0.5"
            />

            <div className="text-xs leading-relaxed text-textSecondary">
              <span className="font-bold text-white">
                Capturing Tips:
              </span>{" "}
              Keep your face clearly
              visible in even lighting.
              Capture the front view,
              then turn left and right
              without changing your
              distance from the camera.
              Remove sunglasses, hats or
              anything blocking facial
              geometry.
            </div>
          </div>
        </div>

        {/* ===================================================
            RIGHT
        ==================================================== */}

        <div className="lg:col-span-5 space-y-6">
          <Card
            variant="surface"
            className="p-6 border-border space-y-5"
          >
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                Biometric Viewpoint
                Gallery
              </span>

              <h3 className="text-lg font-black text-white mt-0.5">
                3-Point Profile Dataset
              </h3>

              <p className="text-xs text-textSecondary mt-1">
                {step ===
                  "front"
                  ? "Front Face Capture"
                  : step ===
                    "left"
                    ? "Left Profile Capture"
                    : step ===
                      "right"
                      ? "Right Profile Capture"
                      : "All 3 angles ready for AI processing"}
              </p>
            </div>

            {/* =================================================
                CAPTURE COUNTER
            ================================================== */}

            <div className="flex items-center justify-between rounded-xl border border-border bg-surfaceDark px-4 py-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-textMuted">
                  Dataset Progress
                </p>

                <p className="text-sm font-black text-white mt-0.5">
                  {imageCount} of 3
                  images captured
                </p>
              </div>

              <div className="text-xl font-black text-primary">
                {Math.round(
                  (imageCount /
                    3) *
                  100
                )}
                %
              </div>
            </div>

            {/* =================================================
                IMAGE GRID
            ================================================== */}

            <div className="grid grid-cols-3 gap-3">
              {/* FRONT */}

              <CapturePreview
                title="Front"
                angle="Front 0°"
                image={
                  images.front
                }
                active={
                  step ===
                  "front"
                }
                onRetake={() =>
                  retakeImage(
                    "front"
                  )
                }
              />

              {/* LEFT */}

              <CapturePreview
                title="Left"
                angle="Left 45°"
                image={
                  images.left
                }
                active={
                  step ===
                  "left"
                }
                onRetake={() =>
                  retakeImage(
                    "left"
                  )
                }
              />

              {/* RIGHT */}

              <CapturePreview
                title="Right"
                angle="Right 45°"
                image={
                  images.right
                }
                active={
                  step ===
                  "right"
                }
                onRetake={() =>
                  retakeImage(
                    "right"
                  )
                }
              />
            </div>

            {/* =================================================
                CHECKLIST
            ================================================== */}

            <div className="space-y-2 pt-2 border-t border-border">
              <ChecklistRow
                ready={
                  Boolean(
                    images.front
                  )
                }
                label="Frontal symmetry baseline"
              />

              <ChecklistRow
                ready={
                  Boolean(
                    images.left
                  )
                }
                label="Left temporal & jaw angle"
              />

              <ChecklistRow
                ready={
                  Boolean(
                    images.right
                  )
                }
                label="Right temporal & crown curve"
              />
            </div>

            {/* =================================================
                AI TRIGGER
            ================================================== */}

            <div className="pt-4 space-y-3">
              <Button
                variant="primary"
                size="lg"
                onClick={
                  startScan
                }
                loading={
                  loading
                }
                disabled={
                  loading ||
                  !images.front ||
                  !images.left ||
                  !images.right
                }
                icon={
                  <Sparkles
                    size={18}
                  />
                }
                className="w-full text-base font-black py-4 shadow-xl shadow-amber-500/20"
              >
                {loading
                  ? "PROCESSING BIOMETRICS..."
                  : "SCAN & CALCULATE GEOMETRY"}
              </Button>

              {loading &&
                analysisProgress && (
                  <div className="p-3 rounded-xl bg-surfaceDark border border-primary/30 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-3 h-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />

                      <p className="text-xs text-primary font-bold">
                        {
                          analysisProgress
                        }
                      </p>
                    </div>
                  </div>
                )}

              <p className="text-[11px] text-textMuted text-center leading-relaxed">
                Three captured views are
                securely sent to the
                Kshurak backend for AI
                facial geometry analysis.
              </p>
            </div>
          </Card>

          {/* ===================================================
              ENGINE INFO
          ==================================================== */}

          <Card
            variant="dark"
            className="p-5 border-border space-y-3"
          >
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <ShieldCheck
                size={16}
              />

              <span>
                Biometric Processing
                Pipeline
              </span>
            </div>

            <p className="text-xs text-textSecondary leading-relaxed">
              Front, left and right
              captures are processed
              through the same backend
              analysis pipeline used by
              the mobile application.
              Scan results and facial
              metrics are stored against
              the authenticated Kshurak
              profile.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   CAPTURE PREVIEW
============================================================ */

interface CapturePreviewProps {
  title: string;
  angle: string;
  image: string | null;
  active: boolean;
  onRetake: () => void;
}

const CapturePreview: React.FC<
  CapturePreviewProps
> = ({
  title,
  angle,
  image,
  active,
  onRetake,
}) => {
    return (
      <div
        className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all bg-surfaceDark flex flex-col items-center justify-center p-2 text-center ${image
          ? "border-primary shadow-lg shadow-amber-500/10"
          : active
            ? "border-primary/60 border-dashed"
            : "border-border"
          }`}
      >
        {image ? (
          <>
            <img
              src={image}
              alt={`${title} View`}
              className="w-full h-full object-cover"
            />

            <div className="absolute top-2 right-2 bg-black/80 rounded-full p-1 text-primary">
              <CheckCircle
                size={14}
              />
            </div>

            <button
              type="button"
              onClick={
                onRetake
              }
              className="absolute inset-x-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg border border-primary/30 bg-black/80 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-primary backdrop-blur"
            >
              Retake
            </button>
          </>
        ) : (
          <div className="space-y-1">
            <Camera
              size={22}
              className={`mx-auto ${active
                ? "text-primary"
                : "text-textMuted"
                }`}
            />

            <span
              className={`text-[11px] font-bold block ${active
                ? "text-primary"
                : "text-textMuted"
                }`}
            >
              {title}
            </span>

            {active && (
              <span className="text-[8px] uppercase tracking-wider text-primary">
                Current
              </span>
            )}
          </div>
        )}

        <span className="absolute bottom-2 left-2 right-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-black text-primary uppercase">
          {angle}
        </span>
      </div>
    );
  };

/* ============================================================
   CHECKLIST
============================================================ */

interface ChecklistRowProps {
  ready: boolean;
  label: string;
}

const ChecklistRow: React.FC<
  ChecklistRowProps
> = ({
  ready,
  label,
}) => {
    return (
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-textSecondary flex items-center gap-2">
          <CheckCircle
            size={14}
            className={
              ready
                ? "text-primary"
                : "text-border"
            }
          />

          {label}
        </span>

        <span
          className={`font-bold ${ready
            ? "text-primary"
            : "text-white"
            }`}
        >
          {ready
            ? "Ready"
            : "Pending"}
        </span>
      </div>
    );
  };

export default ScannerPage;
