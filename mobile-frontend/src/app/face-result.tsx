import React, { useEffect, useState } from "react";

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity
} from "react-native";

import {
    useLocalSearchParams,
    useRouter
} from "expo-router";

import { COLORS } from "@/constants/colors";
import { supabase } from "@/lib/supabase";


export default function FaceResult() {

    const router = useRouter();

    const params = useLocalSearchParams();

    const [result, setResult] = useState<any>({});
    const [images, setImages] = useState<any>({});
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        if (params.scanId) {

            loadScan();

        }

    }, [params.scanId]);


    const loadScan = async () => {

        try {

            const scanId =
                String(params.scanId || "");


            console.log(
                "FACE RESULT RECEIVED SCAN ID:",
                scanId
            );


            if (!scanId) {

                throw new Error(
                    "Scan ID missing"
                );

            }


            const {
                data: scan,
                error: scanError
            }
                =
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


            if (!scan) {

                throw new Error(
                    "Face scan not found: " + scanId
                );

            }


            const {
                data: metrics,
                error: metricError
            }
                =
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


            if (!metrics) {

                throw new Error(
                    "Face metrics not found"
                );

            }


            const formatted = {

                faceShape:
                    scan.face_shape || "Analyzed",

                aiAccuracy:
                    scan.ai_accuracy || 0,

                faceLength:
                    metrics.face_length ?? "--",

                faceWidth:
                    metrics.face_width ?? "--",

                faceRatio:
                    metrics.face_ratio ?? "--",

                foreheadWidth:
                    metrics.forehead_width ?? "--",

                foreheadHeight:
                    metrics.forehead_height ?? "--",

                cheekboneWidth:
                    metrics.cheekbone_width ?? "--",

                jawWidth:
                    metrics.jaw_width ?? "--",

                jawAngle:
                    metrics.jaw_angle ?? "--",

                jawlineShape:
                    metrics.jawline_shape ?? "--",

                faceSymmetry:
                    metrics.face_symmetry ?? "--",

                scanId:
                    scan.id

            };


            const scanImages = {

                front:
                    scan.front_image_url,

                left:
                    scan.left_image_url,

                right:
                    scan.right_image_url

            };


            console.log(
                "FACE RESULT DATA:",
                formatted
            );


            setResult(formatted);

            setImages(scanImages);

        }
        catch (error: any) {

            console.log(
                "FACE RESULT LOAD ERROR:",
                error.message || error
            );

        }
        finally {

            setLoading(false);

        }

    };


    const openGeometry = () => {

        const scanId =
            String(
                result.scanId ||
                params.scanId ||
                ""
            );


        console.log(
            "OPEN GEOMETRY SCAN ID:",
            scanId
        );


        if (!scanId) {

            console.log(
                "Missing scan ID for geometry"
            );

            return;

        }


        router.push({

            pathname: "/geometry",

            params: {
                scanId
            }

        });

    };


    if (loading) {

        return (

            <View style={styles.loadingContainer}>

                <View style={styles.loadingBadge}>
                    <Text style={styles.loadingBadgeText}>
                        AI
                    </Text>
                </View>

                <Text style={styles.loadingText}>
                    Analysing Face Data...
                </Text>

                <Text style={styles.loadingSubText}>
                    Processing facial geometry and proportions
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

            <View style={styles.headerSection}>

                <View style={styles.headerBadge}>

                    <View style={styles.headerBadgeDot} />

                    <Text style={styles.headerBadgeText}>
                        AI ANALYSIS COMPLETE
                    </Text>

                </View>


                <Text style={styles.header}>
                    FACE ANALYSIS RESULT
                </Text>


                <Text style={styles.subtitle}>
                    AI Powered Facial Geometry Analysis
                </Text>

            </View>


            <View style={styles.mainCard}>

                <View style={styles.cardTopRow}>

                    <Text style={styles.label}>
                        DETECTED FACE SHAPE
                    </Text>

                    <View style={styles.analysisBadge}>
                        <Text style={styles.analysisBadgeText}>
                            ANALYZED
                        </Text>
                    </View>

                </View>


                <Text style={styles.shape}>
                    {result.faceShape}
                </Text>


                <Text style={styles.shapeDescription}>
                    Facial geometry profile
                </Text>


                <View style={styles.divider} />


                <View style={styles.accuracyCard}>

                    <View>

                        <Text style={styles.accuracyLabel}>
                            AI ACCURACY
                        </Text>

                        <Text style={styles.accuracyDescription}>
                            Analysis confidence
                        </Text>

                    </View>


                    <View style={styles.accuracyValueContainer}>

                        <Text style={styles.accuracyValue}>
                            {result.aiAccuracy}%
                        </Text>

                    </View>

                </View>

            </View>


            <View style={styles.metricsCard}>

                <View style={styles.sectionHeader}>

                    <View>

                        <Text style={styles.sectionEyebrow}>
                            FACIAL PROFILE
                        </Text>

                        <Text style={styles.sectionTitle}>
                            QUICK ANALYSIS
                        </Text>

                    </View>


                    <View style={styles.metricCountBadge}>

                        <Text style={styles.metricCountText}>
                            5 METRICS
                        </Text>

                    </View>

                </View>


                <View style={styles.metricsContainer}>

                    <Metric
                        title="Face Ratio"
                        value={result.faceRatio}
                    />


                    <Metric
                        title="Face Length"
                        value={result.faceLength}
                    />


                    <Metric
                        title="Face Width"
                        value={result.faceWidth}
                    />


                    <Metric
                        title="Jaw Shape"
                        value={result.jawlineShape}
                    />


                    <Metric
                        title="Symmetry"
                        value={result.faceSymmetry}
                    />

                </View>

            </View>


            <View style={styles.geometryInfo}>

                <View style={styles.geometryIcon}>

                    <Text style={styles.geometryIconText}>
                        G
                    </Text>

                </View>


                <View style={styles.geometryTextContainer}>

                    <Text style={styles.geometryTitle}>
                        Complete Geometry Report
                    </Text>

                    <Text style={styles.geometryDescription}>
                        Explore detailed facial measurements and proportions
                    </Text>

                </View>

            </View>


            <TouchableOpacity
                style={styles.button}
                onPress={openGeometry}
                activeOpacity={0.86}
            >

                <Text style={styles.buttonText}>
                    VIEW COMPLETE GEOMETRY
                </Text>

                <Text style={styles.buttonArrow}>
                    ›
                </Text>

            </TouchableOpacity>


            <Text style={styles.footerText}>
                KSHURAK • AI FACIAL INTELLIGENCE
            </Text>

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

    return (

        <View style={styles.metricRow}>

            <View style={styles.metricLeft}>

                <View style={styles.metricDot} />

                <Text style={styles.metricTitle}>
                    {title}
                </Text>

            </View>


            <Text style={styles.metricValue}>
                {value || "--"}
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

        paddingBottom: 34

    },


    loadingContainer: {

        flex: 1,

        backgroundColor: COLORS.background,

        justifyContent: "center",

        alignItems: "center",

        paddingHorizontal: 30

    },


    loadingBadge: {

        width: 52,

        height: 52,

        borderRadius: 26,

        borderWidth: 1,

        borderColor: COLORS.primary,

        backgroundColor: COLORS.surface,

        justifyContent: "center",

        alignItems: "center",

        marginBottom: 16

    },


    loadingBadgeText: {

        color: COLORS.primary,

        fontSize: 15,

        fontWeight: "900",

        letterSpacing: 1

    },


    loadingText: {

        color: COLORS.primary,

        fontSize: 15,

        fontWeight: "900",

        letterSpacing: 0.4

    },


    loadingSubText: {

        color: COLORS.textSecondary,

        fontSize: 10,

        marginTop: 7,

        textAlign: "center"

    },


    headerSection: {

        marginTop: 43,

        alignItems: "center"

    },


    headerBadge: {

        flexDirection: "row",

        alignItems: "center",

        paddingHorizontal: 10,

        paddingVertical: 6,

        borderRadius: 20,

        backgroundColor: COLORS.surface,

        borderWidth: 1,

        borderColor: COLORS.border,

        marginBottom: 11

    },


    headerBadgeDot: {

        width: 5,

        height: 5,

        borderRadius: 3,

        backgroundColor: COLORS.primary,

        marginRight: 7

    },


    headerBadgeText: {

        color: COLORS.textSecondary,

        fontSize: 8,

        fontWeight: "900",

        letterSpacing: 1

    },


    header: {

        textAlign: "center",

        color: COLORS.primary,

        fontSize: 23,

        lineHeight: 29,

        fontWeight: "900",

        letterSpacing: 0.9

    },


    subtitle: {

        marginTop: 5,

        textAlign: "center",

        color: COLORS.textSecondary,

        fontSize: 11,

        lineHeight: 17,

        fontWeight: "600"

    },


    mainCard: {

        marginTop: 22,

        backgroundColor: COLORS.surface,

        borderRadius: 21,

        padding: 18,

        borderWidth: 1,

        borderColor: COLORS.border,

        shadowColor: "#000",

        shadowOffset: {

            width: 0,

            height: 8

        },

        shadowOpacity: 0.18,

        shadowRadius: 18,

        elevation: 4

    },


    cardTopRow: {

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-between"

    },


    label: {

        color: COLORS.primary,

        fontSize: 9,

        fontWeight: "900",

        letterSpacing: 1

    },


    analysisBadge: {

        backgroundColor: COLORS.surfaceDark,

        paddingHorizontal: 8,

        paddingVertical: 5,

        borderRadius: 20,

        borderWidth: 1,

        borderColor: COLORS.border

    },


    analysisBadgeText: {

        color: COLORS.textSecondary,

        fontSize: 7,

        fontWeight: "900",

        letterSpacing: 0.8

    },


    shape: {

        marginTop: 11,

        color: COLORS.text,

        fontSize: 30,

        lineHeight: 36,

        fontWeight: "900",

        textTransform: "capitalize",

        letterSpacing: 0.2

    },


    shapeDescription: {

        color: COLORS.textSecondary,

        fontSize: 10,

        marginTop: 3,

        fontWeight: "600"

    },


    divider: {

        height: 1,

        backgroundColor: COLORS.border,

        marginTop: 17,

        marginBottom: 14

    },


    accuracyCard: {

        backgroundColor: COLORS.surfaceDark,

        borderRadius: 14,

        paddingVertical: 12,

        paddingHorizontal: 13,

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-between",

        borderWidth: 1,

        borderColor: COLORS.border

    },


    accuracyLabel: {

        color: COLORS.text,

        fontSize: 10,

        fontWeight: "900",

        letterSpacing: 0.6

    },


    accuracyDescription: {

        color: COLORS.textSecondary,

        fontSize: 8,

        marginTop: 3,

        fontWeight: "600"

    },


    accuracyValueContainer: {

        minWidth: 62,

        paddingVertical: 8,

        paddingHorizontal: 10,

        borderRadius: 10,

        backgroundColor: COLORS.surface,

        alignItems: "center",

        justifyContent: "center"

    },


    accuracyValue: {

        color: COLORS.primary,

        fontSize: 15,

        fontWeight: "900"

    },


    metricsCard: {

        marginTop: 14,

        backgroundColor: COLORS.surface,

        borderRadius: 21,

        padding: 15,

        borderWidth: 1,

        borderColor: COLORS.border,

        shadowColor: "#000",

        shadowOffset: {

            width: 0,

            height: 7

        },

        shadowOpacity: 0.14,

        shadowRadius: 14,

        elevation: 3

    },


    sectionHeader: {

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-between",

        marginBottom: 13

    },


    sectionEyebrow: {

        color: COLORS.textSecondary,

        fontSize: 7,

        fontWeight: "900",

        letterSpacing: 1

    },


    sectionTitle: {

        color: COLORS.primary,

        fontSize: 12,

        fontWeight: "900",

        letterSpacing: 0.7,

        marginTop: 3

    },


    metricCountBadge: {

        backgroundColor: COLORS.surfaceDark,

        borderRadius: 20,

        paddingVertical: 5,

        paddingHorizontal: 8,

        borderWidth: 1,

        borderColor: COLORS.border

    },


    metricCountText: {

        color: COLORS.textSecondary,

        fontSize: 7,

        fontWeight: "900",

        letterSpacing: 0.6

    },


    metricsContainer: {

        gap: 7

    },


    metricRow: {

        minHeight: 48,

        backgroundColor: COLORS.surfaceDark,

        borderRadius: 12,

        paddingVertical: 10,

        paddingHorizontal: 12,

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-between",

        borderWidth: 1,

        borderColor: COLORS.border

    },


    metricLeft: {

        flexDirection: "row",

        alignItems: "center",

        flex: 1

    },


    metricDot: {

        width: 5,

        height: 5,

        borderRadius: 3,

        backgroundColor: COLORS.primary,

        marginRight: 9

    },


    metricTitle: {

        color: COLORS.textSecondary,

        fontSize: 10,

        fontWeight: "700"

    },


    metricValue: {

        color: COLORS.text,

        fontSize: 12,

        fontWeight: "900",

        marginLeft: 10,

        textAlign: "right"

    },


    geometryInfo: {

        marginTop: 14,

        flexDirection: "row",

        alignItems: "center",

        backgroundColor: COLORS.surface,

        borderRadius: 17,

        paddingVertical: 13,

        paddingHorizontal: 13,

        borderWidth: 1,

        borderColor: COLORS.border

    },


    geometryIcon: {

        width: 36,

        height: 36,

        borderRadius: 11,

        backgroundColor: COLORS.surfaceDark,

        borderWidth: 1,

        borderColor: COLORS.primary,

        alignItems: "center",

        justifyContent: "center",

        marginRight: 11

    },


    geometryIconText: {

        color: COLORS.primary,

        fontSize: 13,

        fontWeight: "900"

    },


    geometryTextContainer: {

        flex: 1

    },


    geometryTitle: {

        color: COLORS.text,

        fontSize: 11,

        fontWeight: "900"

    },


    geometryDescription: {

        color: COLORS.textSecondary,

        fontSize: 8,

        lineHeight: 13,

        marginTop: 3,

        paddingRight: 5

    },


    button: {

        marginTop: 11,

        minHeight: 50,

        marginBottom: 18,

        backgroundColor: COLORS.primary,

        borderRadius: 14,

        alignItems: "center",

        justifyContent: "center",

        flexDirection: "row",

        paddingHorizontal: 16,

        shadowColor: COLORS.primary,

        shadowOffset: {

            width: 0,

            height: 6

        },

        shadowOpacity: 0.22,

        shadowRadius: 12,

        elevation: 5

    },


    buttonText: {

        color: COLORS.black,

        fontWeight: "900",

        fontSize: 10,

        letterSpacing: 0.7

    },


    buttonArrow: {

        color: COLORS.black,

        fontWeight: "700",

        fontSize: 21,

        marginLeft: 9,

        marginTop: -2

    },


    footerText: {

        textAlign: "center",

        color: COLORS.textMuted,

        fontSize: 7,

        fontWeight: "800",

        letterSpacing: 1.2,

        marginBottom: 10

    }

});