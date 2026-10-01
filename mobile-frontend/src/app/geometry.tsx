import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert
} from "react-native";
import {
    useLocalSearchParams,
    useRouter
} from "expo-router";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/constants/colors";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export default function Geometry() {
    const params = useLocalSearchParams();
    const router = useRouter();

    const scanId =
        String(params.scanId || "");

    const [scan, setScan] = useState<any>({});
    const [metrics, setMetrics] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.scanId) {
            loadGeometry();
        }
    }, [params.scanId]);

    const loadGeometry = async () => {
        try {
            const scanId =
                String(params.scanId || "");

            console.log(
                "GEOMETRY RECEIVED SCAN ID:",
                scanId
            );

            if (!scanId) {
                throw new Error(
                    "Geometry scan ID missing"
                );
            }

            const {
                data: scanData,
                error: scanError
            } =
                await supabase
                    .from("face_scans")
                    .select("*")
                    .eq(
                        "id",
                        scanId
                    )
                    .maybeSingle();

            if (scanError) {
                throw scanError;
            }

            if (!scanData) {
                throw new Error(
                    "Face scan data not found"
                );
            }

            const {
                data: metricData,
                error: metricError
            } =
                await supabase
                    .from("face_metrics")
                    .select("*")
                    .eq(
                        "scan_id",
                        scanId
                    )
                    .maybeSingle();

            if (metricError) {
                throw metricError;
            }

            if (!metricData) {
                throw new Error(
                    "Face metrics data not found"
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

            setScan(scanData);

            /*
             * IMPORTANT:
             * Keep the original Supabase data exactly as it is,
             * but normalize possible snake_case / camelCase
             * metric field names for Geometry display.
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
                    metricData.faceSymmetry
            });
        }
        catch (error: any) {
            console.log(
                "GEOMETRY LOAD ERROR:",
                error.message || error
            );

            Alert.alert(
                "Error",
                "Unable to load geometry report"
            );
        }
        finally {
            setLoading(false);
        }
    };

    const downloadReport = async () => {
        try {
            const html = `
<html>
<head>
<style>
body{
font-family:Arial;
padding:25px;
color:#111;
}
.title{
font-size:26px;
font-weight:bold;
text-align:center;
}
.subtitle{
text-align:center;
margin-bottom:25px;
}
.card{
border:1px solid #ddd;
padding:15px;
margin-bottom:15px;
border-radius:15px;
}
.row{
margin-bottom:10px;
}
.label{
font-weight:bold;
}
.images{
display:flex;
gap:10px;
}
img{
width:30%;
height:150px;
object-fit:cover;
border-radius:10px;
}
</style>
</head>
<body>

<div class="title">
KSHURAK AI FACE REPORT
</div>

<div class="subtitle">
Facial Geometry Analysis
</div>

<div class="card">
<h3>
Face Summary
</h3>

<div class="row">
<span class="label">
Face Shape:
</span>
${scan.face_shape || "--"}
</div>

<div class="row">
<span class="label">
AI Accuracy:
</span>
${scan.ai_accuracy || "--"}%
</div>
</div>

<div class="card">
<h3>
Scan Images
</h3>

<div class="images">
<img src="${scan.front_image_url}"/>
<img src="${scan.left_image_url}"/>
<img src="${scan.right_image_url}"/>
</div>
</div>

<div class="card">
<h3>
Facial Metrics
</h3>

<div class="row">
Face Length:
${metrics.face_length ?? "--"}
</div>

<div class="row">
Face Width:
${metrics.face_width ?? "--"}
</div>

<div class="row">
Face Ratio:
${metrics.face_ratio ?? "--"}
</div>

<div class="row">
Forehead Width:
${metrics.forehead_width ?? "--"}
</div>

<div class="row">
Forehead Height:
${metrics.forehead_height ?? "--"}
</div>

<div class="row">
Cheekbone Width:
${metrics.cheekbone_width ?? "--"}
</div>

<div class="row">
Jaw Width:
${metrics.jaw_width ?? "--"}
</div>

<div class="row">
Jaw Angle:
${metrics.jaw_angle ?? "--"}
</div>

<div class="row">
Jawline:
${metrics.jawline_shape ?? "--"}
</div>

<div class="row">
Symmetry:
${metrics.face_symmetry ?? "--"}
</div>

</div>

</body>
</html>
`;

            const file =
                await Print.printToFileAsync({
                    html,
                    base64: false
                });

            await Sharing.shareAsync(
                file.uri,
                {
                    mimeType: "application/pdf",
                    dialogTitle:
                        "Kshurak Face Geometry Report"
                }
            );
        }
        catch (error: any) {
            console.log(
                "PDF ERROR",
                error
            );

            Alert.alert(
                "PDF Error",
                error.message
            );
        }
    };

    const openRecommendedTryOn = () => {
        if (!scanId) {
            Alert.alert(
                "Error",
                "Scan ID is unavailable"
            );

            return;
        }

        router.push({
            pathname: "/tryon",
            params: {
                scanId
            }
        });
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <Text style={styles.loadingText}>
                    Loading Geometry...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.header}>
                FACE GEOMETRY REPORT
            </Text>

            <Text style={styles.subtitle}>
                AI Facial Landmark Analysis
            </Text>

            <View style={styles.imageCard}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        SCAN IMAGES
                    </Text>

                    <Text style={styles.sectionHint}>
                        3 ANGLES
                    </Text>
                </View>

                <View style={styles.imageRow}>
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{
                                uri: scan.front_image_url
                            }}
                            style={styles.faceImage}
                        />

                        <Text style={styles.imageLabel}>
                            FRONT
                        </Text>
                    </View>

                    <View style={styles.imageWrapper}>
                        <Image
                            source={{
                                uri: scan.left_image_url
                            }}
                            style={styles.faceImage}
                        />

                        <Text style={styles.imageLabel}>
                            LEFT
                        </Text>
                    </View>

                    <View style={styles.imageWrapper}>
                        <Image
                            source={{
                                uri: scan.right_image_url
                            }}
                            style={styles.faceImage}
                        />

                        <Text style={styles.imageLabel}>
                            RIGHT
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>
                        FACE SHAPE
                    </Text>

                    <Text style={styles.summaryValue}>
                        {scan.face_shape || "--"}
                    </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>
                        AI ACCURACY
                    </Text>

                    <Text style={styles.summaryValue}>
                        {scan.ai_accuracy
                            ? `${scan.ai_accuracy}%`
                            : "--"}
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        FACIAL METRICS
                    </Text>

                    <Text style={styles.sectionHint}>
                        10 METRICS
                    </Text>
                </View>

                <View style={styles.metricsGrid}>
                    <Metric
                        title="Face Length"
                        value={metrics.face_length}
                    />

                    <Metric
                        title="Face Width"
                        value={metrics.face_width}
                    />

                    <Metric
                        title="Face Ratio"
                        value={metrics.face_ratio}
                    />

                    <Metric
                        title="Forehead Width"
                        value={metrics.forehead_width}
                    />

                    <Metric
                        title="Forehead Height"
                        value={metrics.forehead_height}
                    />

                    <Metric
                        title="Cheekbone Width"
                        value={metrics.cheekbone_width}
                    />

                    <Metric
                        title="Jaw Width"
                        value={metrics.jaw_width}
                    />

                    <Metric
                        title="Jaw Angle"
                        value={metrics.jaw_angle}
                    />

                    <Metric
                        title="Jawline Shape"
                        value={metrics.jawline_shape}
                    />

                    <Metric
                        title="Symmetry"
                        value={metrics.face_symmetry}
                    />
                </View>
            </View>

            <View style={styles.tryOnCard}>
                <Text style={styles.tryOnEyebrow}>
                    PERSONALIZED FOR YOU
                </Text>

                <Text style={styles.tryOnTitle}>
                    Recommended Hairstyles
                </Text>

                <Text style={styles.tryOnDescription}>
                    Discover hairstyles selected for your{" "}
                    {scan.face_shape || "face"} shape and facial geometry.
                </Text>

                <TouchableOpacity
                    style={styles.tryOnButton}
                    onPress={openRecommendedTryOn}
                    activeOpacity={0.85}
                >
                    <Text style={styles.tryOnButtonText}>
                        TRY ON RECOMMENDED HAIRSTYLES
                    </Text>

                    <Text style={styles.arrow}>
                        ›
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.downloadButton}
                onPress={downloadReport}
                activeOpacity={0.85}
            >
                <Text style={styles.downloadIcon}>
                    ↓
                </Text>

                <Text style={styles.downloadButtonText}>
                    DOWNLOAD REPORT
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

function Metric({
    title,
    value
}: {
    title: string,
    value: any
}) {
    const displayValue =
        value === null ||
            value === undefined ||
            value === ""
            ? "--"
            : String(value);

    return (
        <View style={styles.metricCard}>
            <Text
                style={styles.metricLabel}
                numberOfLines={1}
            >
                {title}
            </Text>

            <Text
                style={styles.metricValue}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {displayValue}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },

    contentContainer: {
        paddingHorizontal: 18,
        paddingBottom: 40
    },

    loading: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center"
    },

    loadingText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 0.8
    },

    header: {
        marginTop: 44,
        textAlign: "center",
        color: COLORS.primary,
        fontSize: 23,
        lineHeight: 29,
        fontWeight: "900",
        letterSpacing: 1.15
    },

    subtitle: {
        marginTop: 5,
        textAlign: "center",
        color: COLORS.textSecondary,
        fontSize: 10,
        lineHeight: 16,
        fontWeight: "600",
        letterSpacing: 0.3
    },

    imageCard: {
        marginTop: 21,
        backgroundColor: COLORS.surface,
        borderRadius: 21,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 4
    },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12
    },

    sectionTitle: {
        color: COLORS.primary,
        fontSize: 10,
        lineHeight: 15,
        fontWeight: "900",
        letterSpacing: 1
    },

    sectionHint: {
        color: COLORS.textSecondary,
        fontSize: 7,
        fontWeight: "900",
        letterSpacing: 1
    },

    imageRow: {
        flexDirection: "row",
        justifyContent: "space-between"
    },

    imageWrapper: {
        width: "31.5%",
        backgroundColor: COLORS.surfaceDark,
        borderRadius: 13,
        padding: 5,
        borderWidth: 1,
        borderColor: COLORS.border
    },

    faceImage: {
        width: "100%",
        height: 112,
        borderRadius: 9,
        backgroundColor: COLORS.background
    },

    imageLabel: {
        color: COLORS.textSecondary,
        fontSize: 7,
        fontWeight: "900",
        textAlign: "center",
        marginTop: 6,
        marginBottom: 2,
        letterSpacing: 1
    },

    summaryCard: {
        marginTop: 12,
        backgroundColor: COLORS.surface,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 13,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowOpacity: 0.13,
        shadowRadius: 10,
        elevation: 3
    },

    summaryItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },

    summaryDivider: {
        width: 1,
        height: 34,
        backgroundColor: COLORS.border
    },

    summaryLabel: {
        color: COLORS.textSecondary,
        fontSize: 7,
        lineHeight: 11,
        fontWeight: "900",
        letterSpacing: 1
    },

    summaryValue: {
        color: COLORS.primary,
        fontSize: 15,
        lineHeight: 20,
        fontWeight: "900",
        marginTop: 4,
        textTransform: "capitalize"
    },

    card: {
        marginTop: 13,
        backgroundColor: COLORS.surface,
        borderRadius: 21,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 7
        },
        shadowOpacity: 0.15,
        shadowRadius: 14,
        elevation: 3
    },

    metricsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between"
    },

    metricCard: {
        width: "48.5%",
        backgroundColor: COLORS.surfaceDark,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 11,
        paddingVertical: 9,
        marginBottom: 8,
        minHeight: 57,
        justifyContent: "center"
    },

    metricLabel: {
        color: COLORS.textSecondary,
        fontSize: 8,
        lineHeight: 11,
        fontWeight: "700",
        marginBottom: 5,
        letterSpacing: 0.15
    },

    metricValue: {
        color: COLORS.text,
        fontSize: 13,
        lineHeight: 17,
        fontWeight: "900",
        letterSpacing: 0.1
    },

    tryOnCard: {
        marginTop: 13,
        backgroundColor: COLORS.surface,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 7
        },
        shadowOpacity: 0.16,
        shadowRadius: 14,
        elevation: 4
    },

    tryOnEyebrow: {
        color: COLORS.primary,
        fontSize: 7,
        lineHeight: 11,
        fontWeight: "900",
        letterSpacing: 1.3
    },

    tryOnTitle: {
        color: COLORS.text,
        fontSize: 17,
        lineHeight: 22,
        fontWeight: "900",
        marginTop: 5
    },

    tryOnDescription: {
        color: COLORS.textSecondary,
        fontSize: 10,
        lineHeight: 16,
        fontWeight: "600",
        marginTop: 5,
        paddingRight: 5
    },

    tryOnButton: {
        marginTop: 13,
        backgroundColor: COLORS.primary,
        minHeight: 46,
        borderRadius: 13,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4
    },

    tryOnButtonText: {
        color: COLORS.black,
        fontSize: 9,
        lineHeight: 13,
        fontWeight: "900",
        letterSpacing: 0.55
    },

    arrow: {
        color: COLORS.black,
        fontSize: 20,
        lineHeight: 22,
        fontWeight: "700",
        marginLeft: 8,
        marginTop: -1
    },

    downloadButton: {
        alignSelf: "center",
        marginTop: 13,
        marginBottom: 10,
        minHeight: 38,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 11,
        paddingVertical: 8,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.surface
    },

    downloadIcon: {
        color: COLORS.primary,
        fontSize: 13,
        lineHeight: 16,
        fontWeight: "900",
        marginRight: 7
    },

    downloadButtonText: {
        color: COLORS.primary,
        fontSize: 8,
        lineHeight: 12,
        fontWeight: "900",
        letterSpacing: 0.7
    }
});