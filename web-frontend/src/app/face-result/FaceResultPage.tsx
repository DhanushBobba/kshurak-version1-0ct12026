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

import {
    CheckCircle2,
    Sparkles,
    ArrowRight,
    AlertCircle,
    ScanFace,
    Cpu,
    BarChart3,
    ShieldCheck,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";

/* ============================================================
   TYPES
============================================================ */

interface FaceResultData {
    scanId: string;

    faceShape: string;

    aiAccuracy: number | string;

    faceLength: any;
    faceWidth: any;
    faceRatio: any;

    foreheadWidth: any;
    foreheadHeight: any;

    cheekboneWidth: any;

    jawWidth: any;
    jawAngle: any;

    jawlineShape: any;

    faceSymmetry: any;
}

interface FaceImages {
    front?: string | null;
    left?: string | null;
    right?: string | null;
}

/* ============================================================
   COMPONENT
============================================================ */

export const FaceResultPage: React.FC = () => {
    const navigate = useNavigate();

    const location = useLocation();

    const [searchParams] =
        useSearchParams();

    /*
     * Supports both:
     *
     * navigate("/face-result", {
     *   state: {
     *     scanId
     *   }
     * })
     *
     * and:
     *
     * /face-result?scanId=xxxx
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

    const [
        result,
        setResult,
    ] =
        useState<FaceResultData | null>(
            null
        );

    const [
        images,
        setImages,
    ] =
        useState<FaceImages>({});

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
       LOAD SCAN
       Same functional flow as mobile
    ============================================================ */

    useEffect(() => {
        const loadScan =
            async () => {
                try {
                    setLoading(true);

                    setErrorMessage(
                        null
                    );

                    if (!scanId) {
                        throw new Error(
                            "Scan ID missing."
                        );
                    }

                    console.log(
                        "FACE RESULT RECEIVED SCAN ID:",
                        scanId
                    );

                    /* ============================
                       FACE SCAN
                    ============================ */

                    const {
                        data: scan,
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
                            "FACE SCAN ERROR:",
                            scanError
                        );

                        throw scanError;
                    }

                    if (!scan) {
                        throw new Error(
                            `Face scan not found: ${scanId}`
                        );
                    }

                    /* ============================
                       FACE METRICS
                    ============================ */

                    const {
                        data: metrics,
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

                    if (metricError) {
                        console.error(
                            "FACE METRICS ERROR:",
                            metricError
                        );

                        throw metricError;
                    }

                    if (!metrics) {
                        throw new Error(
                            "Face metrics not found."
                        );
                    }

                    /*
                     * Same formatted result as mobile
                     */

                    const formatted: FaceResultData =
                    {
                        faceShape:
                            scan.face_shape ||
                            "Analyzed",

                        aiAccuracy:
                            scan.ai_accuracy ||
                            0,

                        faceLength:
                            metrics.face_length ??
                            metrics.faceLength ??
                            "--",

                        faceWidth:
                            metrics.face_width ??
                            metrics.faceWidth ??
                            "--",

                        faceRatio:
                            metrics.face_ratio ??
                            metrics.faceRatio ??
                            "--",

                        foreheadWidth:
                            metrics.forehead_width ??
                            metrics.foreheadWidth ??
                            "--",

                        foreheadHeight:
                            metrics.forehead_height ??
                            metrics.foreheadHeight ??
                            "--",

                        cheekboneWidth:
                            metrics.cheekbone_width ??
                            metrics.cheekboneWidth ??
                            "--",

                        jawWidth:
                            metrics.jaw_width ??
                            metrics.jawWidth ??
                            "--",

                        jawAngle:
                            metrics.jaw_angle ??
                            metrics.jawAngle ??
                            "--",

                        jawlineShape:
                            metrics.jawline_shape ??
                            metrics.jawlineShape ??
                            "--",

                        faceSymmetry:
                            metrics.face_symmetry ??
                            metrics.faceSymmetry ??
                            "--",

                        scanId:
                            scan.id,
                    };

                    const scanImages: FaceImages =
                    {
                        front:
                            scan.front_image_url,

                        left:
                            scan.left_image_url,

                        right:
                            scan.right_image_url,
                    };

                    console.log(
                        "FACE RESULT DATA:",
                        formatted
                    );

                    setResult(
                        formatted
                    );

                    setImages(
                        scanImages
                    );
                } catch (
                error: any
                ) {
                    console.error(
                        "FACE RESULT LOAD ERROR:",
                        error
                    );

                    setResult(null);

                    setImages({});

                    setErrorMessage(
                        error?.message ||
                        "Unable to load face analysis result."
                    );
                } finally {
                    setLoading(false);
                }
            };

        loadScan();
    }, [scanId]);

    /* ============================================================
       DISPLAY HELPERS
    ============================================================ */

    const displayValue = (
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
                result?.aiAccuracy ===
                null ||
                result?.aiAccuracy ===
                undefined ||
                result?.aiAccuracy ===
                ""
            ) {
                return "--";
            }

            const text =
                String(
                    result.aiAccuracy
                );

            return text.includes("%")
                ? text
                : `${text}%`;
        }, [result]);

    /* ============================================================
       QUICK METRICS
       Same 5 metrics as mobile
    ============================================================ */

    const quickMetrics =
        useMemo(
            () => [
                {
                    title:
                        "Face Ratio",
                    value:
                        displayValue(
                            result?.faceRatio
                        ),
                },

                {
                    title:
                        "Face Length",
                    value:
                        displayValue(
                            result?.faceLength
                        ),
                },

                {
                    title:
                        "Face Width",
                    value:
                        displayValue(
                            result?.faceWidth
                        ),
                },

                {
                    title:
                        "Jaw Shape",
                    value:
                        displayValue(
                            result?.jawlineShape
                        ),
                },

                {
                    title:
                        "Symmetry",
                    value:
                        displayValue(
                            result?.faceSymmetry
                        ),
                },
            ],
            [result]
        );

    /* ============================================================
       OPEN GEOMETRY
       Same mobile flow
    ============================================================ */

    const openGeometry = () => {
        const currentScanId =
            String(
                result?.scanId ||
                scanId ||
                ""
            );

        console.log(
            "OPEN GEOMETRY SCAN ID:",
            currentScanId
        );

        if (!currentScanId) {
            setErrorMessage(
                "Scan ID is unavailable."
            );

            return;
        }

        navigate(
            `/geometry?scanId=${encodeURIComponent(
                currentScanId
            )}`,
            {
                state: {
                    scanId:
                        currentScanId,
                },
            }
        );
    };

    /* ============================================================
       LOADING
    ============================================================ */

    if (loading) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center px-4">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/20" />

                    <div className="absolute w-16 h-16 rounded-full border-2 border-transparent border-t-primary animate-spin" />

                    <span className="absolute text-sm font-black text-primary">
                        AI
                    </span>
                </div>

                <p className="mt-5 text-sm font-black text-primary">
                    Analysing Face Data...
                </p>

                <p className="mt-2 text-[11px] text-textMuted text-center">
                    Processing facial
                    geometry and proportions
                </p>
            </div>
        );
    }

    /* ============================================================
       ERROR
    ============================================================ */

    if (!result) {
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
                        Face Result
                        Unavailable
                    </h2>

                    <p className="mt-2 text-xs text-textSecondary leading-relaxed">
                        {errorMessage ||
                            "The face analysis result could not be loaded."}
                    </p>

                    <Button
                        variant="primary"
                        size="md"
                        className="mt-6"
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
                </Card>
            </div>
        );
    }

    /* ============================================================
       MAIN UI
    ============================================================ */

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Ambient background */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-36 top-16 h-[420px] w-[420px] rounded-full bg-primary/[0.03] blur-3xl" />

                <div className="absolute -right-36 top-[45%] h-[420px] w-[420px] rounded-full bg-primary/[0.02] blur-3xl" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
                {/* =====================================================
            HEADER
        ====================================================== */}

                <section className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-[9px] font-black uppercase tracking-[0.17em] text-textSecondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />

                        AI Analysis Complete
                    </div>

                    <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
                        Face Analysis{" "}
                        <span className="text-primary">
                            Result
                        </span>
                    </h1>

                    <p className="mt-2 text-xs text-textSecondary">
                        AI Powered Facial
                        Geometry Analysis
                    </p>
                </section>

                {/* =====================================================
            MAIN RESULT
        ====================================================== */}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT */}

                    <div className="lg:col-span-5 space-y-6">
                        {/* Face Shape Card */}

                        <Card
                            variant="surface"
                            className="p-6 border-border overflow-hidden relative"
                        >
                            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary/[0.04] blur-3xl" />

                            <div className="relative">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
                                        Detected Face
                                        Shape
                                    </span>

                                    <span className="px-2.5 py-1 rounded-full bg-surfaceDark border border-border text-[8px] font-black uppercase tracking-wider text-textSecondary">
                                        Analyzed
                                    </span>
                                </div>

                                <h2 className="mt-4 text-4xl font-black text-white capitalize">
                                    {
                                        result.faceShape
                                    }
                                </h2>

                                <p className="mt-1 text-[11px] text-textSecondary font-medium">
                                    Facial geometry
                                    profile
                                </p>

                                <div className="h-px bg-border my-5" />

                                <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surfaceDark p-4">
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-wider">
                                            AI Accuracy
                                        </p>

                                        <p className="text-[9px] text-textMuted mt-1">
                                            Analysis
                                            confidence
                                        </p>
                                    </div>

                                    <div className="min-w-[76px] px-3 py-2.5 rounded-xl bg-surface border border-primary/20 text-center">
                                        <span className="text-lg font-black text-primary">
                                            {
                                                accuracyValue
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Images */}

                        <Card
                            variant="surface"
                            className="p-5 border-border space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-primary">
                                        Scan Views
                                    </p>

                                    <h3 className="text-sm font-black text-white mt-1">
                                        Captured Dataset
                                    </h3>
                                </div>

                                <Cpu
                                    size={17}
                                    className="text-textMuted"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2.5">
                                <FaceImage
                                    src={
                                        images.front
                                    }
                                    label="FRONT"
                                />

                                <FaceImage
                                    src={
                                        images.left
                                    }
                                    label="LEFT"
                                />

                                <FaceImage
                                    src={
                                        images.right
                                    }
                                    label="RIGHT"
                                />
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT */}

                    <div className="lg:col-span-7 space-y-6">
                        {/* Quick Metrics */}

                        <Card
                            variant="surface"
                            className="p-6 border-border"
                        >
                            <div className="flex items-center justify-between gap-4 mb-5">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-textMuted">
                                        Facial Profile
                                    </p>

                                    <h3 className="text-lg font-black text-primary mt-1">
                                        Quick Analysis
                                    </h3>
                                </div>

                                <div className="px-3 py-1 rounded-full bg-surfaceDark border border-border text-[9px] font-black text-textSecondary">
                                    5 METRICS
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {quickMetrics.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <MetricCard
                                            key={
                                                item.title
                                            }
                                            index={
                                                index + 1
                                            }
                                            title={
                                                item.title
                                            }
                                            value={
                                                item.value
                                            }
                                        />
                                    )
                                )}
                            </div>
                        </Card>

                        {/* Geometry CTA */}

                        <Card
                            variant="dark"
                            className="p-5 border-border"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-xl bg-surface border border-primary/30 flex items-center justify-center text-primary shrink-0">
                                    <BarChart3
                                        size={19}
                                    />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-sm font-black text-white">
                                        Complete
                                        Geometry Report
                                    </h3>

                                    <p className="mt-1 text-[11px] leading-relaxed text-textSecondary">
                                        Explore all 10
                                        detailed facial
                                        measurements,
                                        proportions,
                                        symmetry and jaw
                                        geometry from this
                                        scan.
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full mt-5 text-sm font-black"
                                onClick={
                                    openGeometry
                                }
                                icon={
                                    <ArrowRight
                                        size={17}
                                    />
                                }
                            >
                                VIEW COMPLETE
                                GEOMETRY
                            </Button>
                        </Card>

                        {/* Trusted pipeline */}

                        <Card
                            variant="dark"
                            className="p-5 border-border"
                        >
                            <div className="flex items-start gap-3">
                                <ShieldCheck
                                    size={19}
                                    className="text-primary shrink-0 mt-0.5"
                                />

                                <p className="text-[11px] leading-relaxed text-textSecondary">
                                    <span className="font-black text-white">
                                        Verified AI
                                        Result:
                                    </span>{" "}
                                    this page is loaded
                                    from the saved{" "}
                                    <span className="text-primary font-bold">
                                        face_scans
                                    </span>{" "}
                                    and{" "}
                                    <span className="text-primary font-bold">
                                        face_metrics
                                    </span>{" "}
                                    records for this
                                    exact scan.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>

                <p className="text-center text-[8px] font-black uppercase tracking-[0.2em] text-textMuted pb-2">
                    KSHURAK • AI FACIAL
                    INTELLIGENCE
                </p>
            </div>
        </div>
    );
};

/* ============================================================
   FACE IMAGE
============================================================ */

interface FaceImageProps {
    src?: string | null;
    label: string;
}

const FaceImage: React.FC<
    FaceImageProps
> = ({
    src,
    label,
}) => {
        return (
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surfaceDark border border-border">
                {src ? (
                    <img
                        src={src}
                        alt={label}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-textMuted">
                        <ScanFace
                            size={20}
                        />
                    </div>
                )}

                <span className="absolute bottom-1.5 left-1.5 right-1.5 py-0.5 rounded bg-black/80 text-center text-[8px] font-black tracking-wider text-primary">
                    {label}
                </span>
            </div>
        );
    };

/* ============================================================
   METRIC CARD
============================================================ */

interface MetricCardProps {
    index: number;
    title: string;
    value: string;
}

const MetricCard: React.FC<
    MetricCardProps
> = ({
    index,
    title,
    value,
}) => {
        return (
            <div className="rounded-xl border border-border bg-surfaceDark p-3.5 transition-all hover:bg-surfaceLight hover:border-primary/20">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />

                            <span className="text-[10px] font-bold text-textSecondary">
                                {title}
                            </span>
                        </div>

                        <p className="mt-2 text-sm font-black text-white">
                            {value || "--"}
                        </p>
                    </div>

                    <span className="text-[9px] font-mono font-black text-primary/50">
                        {String(
                            index
                        ).padStart(
                            2,
                            "0"
                        )}
                    </span>
                </div>
            </div>
        );
    };

export default FaceResultPage;