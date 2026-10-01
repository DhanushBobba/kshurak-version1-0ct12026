import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/constants/colors";
import {
    getRecommendedHairstyles,
    HairstyleRecommendation
} from "@/constants/hairstyleRecommendations";

export default function TryOn() {
    const params = useLocalSearchParams();

    const scanId = useMemo(() => {
        const value = params.scanId;

        if (Array.isArray(value)) {
            return value[0] || "";
        }

        return String(value || "");
    }, [params.scanId]);

    const [scan, setScan] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedHairstyle, setSelectedHairstyle] =
        useState<HairstyleRecommendation | null>(null);

    useEffect(() => {
        if (scanId) {
            loadTryOnData();
        }
        else {
            setLoading(false);
        }
    }, [scanId]);

    const loadTryOnData = async () => {
        try {
            setLoading(true);

            console.log(
                "TRYON RECEIVED SCAN ID:",
                scanId
            );

            if (!scanId) {
                throw new Error(
                    "Try-On scan ID missing"
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
                "TRYON SCAN DATA:",
                scanData
            );

            console.log(
                "TRYON METRICS DATA:",
                metricData
            );

            setScan(scanData);
            setMetrics(metricData);
        }
        catch (error: any) {
            console.log(
                "TRYON LOAD ERROR:",
                error?.message || error
            );

            Alert.alert(
                "Error",
                error?.message ||
                "Unable to load Try-On data"
            );
        }
        finally {
            setLoading(false);
        }
    };

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
        setSelectedHairstyle(hairstyle);

        console.log(
            "SELECTED HAIRSTYLE:",
            hairstyle.id
        );
    };

    const formatValue = (
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

        return `${value}${suffix}`;
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                />

                <Text style={styles.loadingText}>
                    Loading Recommendations...
                </Text>
            </View>
        );
    }

    if (!scanId) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                    FACE SCAN REQUIRED
                </Text>

                <Text style={styles.emptyText}>
                    Complete a face scan first to view
                    personalized hairstyle recommendations.
                </Text>
            </View>
        );
    }

    if (!scan || !metrics) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                    REPORT NOT AVAILABLE
                </Text>

                <Text style={styles.emptyText}>
                    We could not load the facial geometry
                    information for this scan.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={
                styles.contentContainer
            }
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.header}>
                AI HAIRSTYLE TRY-ON
            </Text>

            <Text style={styles.subtitle}>
                Personalized using your facial geometry
            </Text>

            <View style={styles.scanCard}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        YOUR FACE SCAN
                    </Text>

                    <Text style={styles.sectionTag}>
                        3 ANGLES
                    </Text>
                </View>

                <View style={styles.imageRow}>
                    <ScanImage
                        uri={scan.front_image_url}
                        label="FRONT"
                    />

                    <ScanImage
                        uri={scan.left_image_url}
                        label="LEFT"
                    />

                    <ScanImage
                        uri={scan.right_image_url}
                        label="RIGHT"
                    />
                </View>
            </View>

            <View style={styles.analysisCard}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        FACE PROFILE
                    </Text>

                    <Text style={styles.sectionTag}>
                        AI ANALYSIS
                    </Text>
                </View>

                <View style={styles.metricsGrid}>
                    <ProfileMetric
                        title="Face Shape"
                        value={formatValue(
                            scan.face_shape
                        )}
                    />

                    <ProfileMetric
                        title="Symmetry"
                        value={formatValue(
                            metrics.face_symmetry
                        )}
                    />

                    <ProfileMetric
                        title="Face Ratio"
                        value={formatValue(
                            metrics.face_ratio
                        )}
                    />

                    <ProfileMetric
                        title="Jaw Shape"
                        value={formatValue(
                            metrics.jawline_shape
                        )}
                    />
                </View>
            </View>

            <View style={styles.recommendationHeader}>
                <Text style={styles.eyebrow}>
                    PERSONALIZED SELECTION
                </Text>

                <Text style={styles.recommendationTitle}>
                    TRY ON RECOMMENDED HAIRSTYLES
                </Text>

                <Text style={styles.recommendationText}>
                    These hairstyles are selected for your{" "}
                    <Text
                        style={
                            styles.highlightText
                        }
                    >
                        {scan.face_shape}
                    </Text>{" "}
                    face shape and facial geometry.
                </Text>
            </View>

            {recommendedHairstyles.length > 0 ? (
                <View style={styles.hairstyleGrid}>
                    {recommendedHairstyles.map(
                        (
                            hairstyle,
                            index
                        ) => {
                            const selected =
                                selectedHairstyle?.id ===
                                hairstyle.id;

                            return (
                                <View
                                    key={
                                        hairstyle.id
                                    }
                                    style={[
                                        styles.hairstyleCard,
                                        selected &&
                                        styles.hairstyleCardSelected
                                    ]}
                                >
                                    <View
                                        style={
                                            styles.hairstyleImageContainer
                                        }
                                    >
                                        <Image
                                            source={
                                                hairstyle.image
                                            }
                                            style={
                                                styles.hairstyleImage
                                            }
                                            resizeMode="cover"
                                        />

                                        <View
                                            style={
                                                styles.numberBadge
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.numberText
                                                }
                                            >
                                                {String(
                                                    index +
                                                    1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </Text>
                                        </View>

                                        {selected && (
                                            <View
                                                style={
                                                    styles.selectedBadge
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.selectedBadgeText
                                                    }
                                                >
                                                    SELECTED
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <View
                                        style={
                                            styles.hairstyleInfo
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.hairstyleName
                                            }
                                            numberOfLines={
                                                2
                                            }
                                        >
                                            {
                                                hairstyle.name
                                            }
                                        </Text>

                                        <TouchableOpacity
                                            style={[
                                                styles.tryButton,
                                                selected &&
                                                styles.tryButtonSelected
                                            ]}
                                            activeOpacity={
                                                0.85
                                            }
                                            onPress={() =>
                                                handleTryOn(
                                                    hairstyle
                                                )
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.tryButtonText,
                                                    selected &&
                                                    styles.tryButtonTextSelected
                                                ]}
                                            >
                                                {selected
                                                    ? "SELECTED"
                                                    : "TRY ON"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        }
                    )}
                </View>
            ) : (
                <View style={styles.noRecommendationCard}>
                    <Text
                        style={
                            styles.noRecommendationTitle
                        }
                    >
                        Recommendations unavailable
                    </Text>

                    <Text
                        style={
                            styles.noRecommendationText
                        }
                    >
                        No hairstyle collection was found
                        for "{scan.face_shape}".
                    </Text>
                </View>
            )}

            <View style={styles.footerInfo}>
                <View style={styles.footerLine} />

                <Text style={styles.footerText}>
                    Recommendations based on your stored
                    face analysis
                </Text>

                <View style={styles.footerLine} />
            </View>
        </ScrollView>
    );
}

function ScanImage({
    uri,
    label
}: {
    uri: string;
    label: string;
}) {
    return (
        <View style={styles.scanImageWrapper}>
            <Image
                source={{
                    uri
                }}
                style={styles.scanImage}
            />

            <Text style={styles.scanImageLabel}>
                {label}
            </Text>
        </View>
    );
}

function ProfileMetric({
    title,
    value
}: {
    title: string;
    value: string;
}) {
    return (
        <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>
                {title}
            </Text>

            <Text
                style={styles.metricValue}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {value}
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
        paddingBottom: 48
    },

    loading: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: "center",
        justifyContent: "center"
    },

    loadingText: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: "900",
        marginTop: 14,
        letterSpacing: 0.7
    },

    emptyContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 38
    },

    emptyTitle: {
        color: COLORS.primary,
        fontSize: 17,
        fontWeight: "900",
        textAlign: "center",
        letterSpacing: 0.8
    },

    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 11,
        lineHeight: 18,
        textAlign: "center",
        marginTop: 9
    },

    header: {
        marginTop: 44,
        color: COLORS.primary,
        fontSize: 22,
        lineHeight: 28,
        fontWeight: "900",
        textAlign: "center",
        letterSpacing: 1.1
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 10,
        lineHeight: 16,
        textAlign: "center",
        marginTop: 5,
        fontWeight: "600",
        letterSpacing: 0.2
    },

    scanCard: {
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
        fontWeight: "900",
        letterSpacing: 1
    },

    sectionTag: {
        color: COLORS.textSecondary,
        fontSize: 7,
        fontWeight: "900",
        letterSpacing: 0.9
    },

    imageRow: {
        flexDirection: "row",
        justifyContent: "space-between"
    },

    scanImageWrapper: {
        width: "31.5%",
        padding: 5,
        paddingBottom: 6,
        backgroundColor: COLORS.surfaceDark,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: COLORS.border
    },

    scanImage: {
        width: "100%",
        height: 110,
        borderRadius: 9,
        backgroundColor: COLORS.background
    },

    scanImageLabel: {
        color: COLORS.textSecondary,
        fontSize: 7,
        fontWeight: "900",
        textAlign: "center",
        letterSpacing: 1,
        marginTop: 6
    },

    analysisCard: {
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
        minHeight: 58,
        backgroundColor: COLORS.surfaceDark,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 11,
        paddingVertical: 9,
        marginBottom: 8,
        justifyContent: "center"
    },

    metricLabel: {
        color: COLORS.textSecondary,
        fontSize: 8,
        lineHeight: 11,
        fontWeight: "700",
        letterSpacing: 0.15
    },

    metricValue: {
        color: COLORS.text,
        fontSize: 13,
        lineHeight: 17,
        fontWeight: "900",
        marginTop: 5,
        textTransform: "capitalize"
    },

    recommendationHeader: {
        marginTop: 24,
        marginBottom: 14
    },

    eyebrow: {
        color: COLORS.primary,
        fontSize: 7,
        lineHeight: 11,
        fontWeight: "900",
        letterSpacing: 1.4
    },

    recommendationTitle: {
        color: COLORS.text,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: "900",
        marginTop: 5,
        letterSpacing: 0.15
    },

    recommendationText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        lineHeight: 16,
        marginTop: 6,
        fontWeight: "600",
        paddingRight: 6
    },

    highlightText: {
        color: COLORS.primary,
        fontWeight: "900"
    },

    hairstyleGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between"
    },

    hairstyleCard: {
        width: "48.5%",
        backgroundColor: COLORS.surface,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
        marginBottom: 12,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 7
        },
        shadowOpacity: 0.16,
        shadowRadius: 13,
        elevation: 3
    },

    hairstyleCardSelected: {
        borderColor: COLORS.primary,
        borderWidth: 1.5,

        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.16,
        shadowRadius: 10,
        elevation: 4
    },

    hairstyleImageContainer: {
        position: "relative",
        width: "100%",
        aspectRatio: 0.9,
        backgroundColor: COLORS.surfaceDark
    },

    hairstyleImage: {
        width: "100%",
        height: "100%"
    },

    numberBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        minWidth: 27,
        height: 24,
        backgroundColor: "rgba(0,0,0,0.78)",
        borderRadius: 7,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6
    },

    numberText: {
        color: COLORS.primary,
        fontSize: 7,
        fontWeight: "900",
        letterSpacing: 0.6
    },

    selectedBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 7,
        paddingHorizontal: 7,
        paddingVertical: 5,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3
    },

    selectedBadgeText: {
        color: COLORS.black,
        fontSize: 6,
        fontWeight: "900",
        letterSpacing: 0.5
    },

    hairstyleInfo: {
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 11
    },

    hairstyleName: {
        color: COLORS.text,
        fontSize: 11,
        fontWeight: "900",
        minHeight: 32,
        lineHeight: 16
    },

    tryButton: {
        marginTop: 8,
        minHeight: 35,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.surfaceDark
    },

    tryButtonSelected: {
        backgroundColor: COLORS.primary,

        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.18,
        shadowRadius: 7,
        elevation: 3
    },

    tryButtonText: {
        color: COLORS.primary,
        fontSize: 8,
        fontWeight: "900",
        letterSpacing: 0.7
    },

    tryButtonTextSelected: {
        color: COLORS.black
    },

    noRecommendationCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 22,
        paddingHorizontal: 18,
        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6
        },
        shadowOpacity: 0.14,
        shadowRadius: 12,
        elevation: 3
    },

    noRecommendationTitle: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 0.2
    },

    noRecommendationText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        lineHeight: 16,
        textAlign: "center",
        marginTop: 7
    },

    footerInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15
    },

    footerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border
    },

    footerText: {
        color: COLORS.textSecondary,
        fontSize: 7,
        lineHeight: 11,
        fontWeight: "600",
        textAlign: "center",
        marginHorizontal: 10,
        maxWidth: 150,
        letterSpacing: 0.25
    }

});