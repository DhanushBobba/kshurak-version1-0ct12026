import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    Animated,
    Linking
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useRouter } from "expo-router";

import { COLORS } from "@/constants/colors";
import { supabase } from "@/lib/supabase";

import { analyzeMultiAngleFace } from "@/services/faceAnalysis";
import { uploadFaceImage } from "@/services/storage";

export default function Scanner() {
    const router = useRouter();

    const cameraRef = useRef<any>(null);

    const scanAnimation = useRef(
        new Animated.Value(0)
    ).current;

    const [permission, requestPermission] = useCameraPermissions();

    const [cameraOpen, setCameraOpen] = useState(true);
    const [cameraReady, setCameraReady] = useState(false);

    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);

    const [step, setStep] = useState<
        "front" | "left" | "right" | "complete"
    >("front");

    const [images, setImages] = useState<{
        front: string | null;
        left: string | null;
        right: string | null;
    }>({
        front: null,
        left: null,
        right: null
    });

    // =====================================================
    // CAMERA PERMISSION
    // =====================================================

    useEffect(() => {
        const initializeCameraPermission = async () => {
            try {
                // Permission object may initially be null while Expo
                // checks the current native permission state.
                if (!permission) {
                    return;
                }

                console.log("CAMERA PERMISSION STATUS:", {
                    granted: permission.granted,
                    canAskAgain: permission.canAskAgain,
                    status: permission.status
                });

                if (
                    !permission.granted &&
                    permission.canAskAgain
                ) {
                    const result =
                        await requestPermission();

                    console.log(
                        "CAMERA PERMISSION RESULT:",
                        {
                            granted: result.granted,
                            canAskAgain: result.canAskAgain,
                            status: result.status
                        }
                    );
                }
            } catch (error) {
                console.log(
                    "CAMERA PERMISSION ERROR:",
                    error
                );
            }
        };

        initializeCameraPermission();
    }, [
        permission?.granted,
        permission?.canAskAgain
    ]);

    // =====================================================
    // MANUAL CAMERA PERMISSION
    // =====================================================

    const handleCameraPermission = async () => {
        try {
            if (permission?.canAskAgain !== false) {
                const result =
                    await requestPermission();

                console.log(
                    "MANUAL CAMERA PERMISSION RESULT:",
                    {
                        granted: result.granted,
                        canAskAgain: result.canAskAgain,
                        status: result.status
                    }
                );

                if (!result.granted) {
                    Alert.alert(
                        "Camera Permission Required",
                        "Camera access is required to scan your face."
                    );
                }

                return;
            }

            Alert.alert(
                "Camera Permission Required",
                "Camera permission has been disabled for Kshurak. Please enable Camera permission from Android Settings.",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Open Settings",
                        onPress: () =>
                            Linking.openSettings()
                    }
                ]
            );
        } catch (error) {
            console.log(
                "CAMERA PERMISSION REQUEST ERROR:",
                error
            );

            Alert.alert(
                "Camera Error",
                "Unable to request camera permission."
            );
        }
    };

    // =====================================================
    // SCANNER ANIMATION
    // =====================================================

    useEffect(() => {
        if (cameraOpen) {
            startScannerAnimation();
        }
    }, [cameraOpen]);

    const startScannerAnimation = () => {
        scanAnimation.setValue(0);

        Animated.loop(
            Animated.sequence([
                Animated.timing(
                    scanAnimation,
                    {
                        toValue: 1,
                        duration: 1800,
                        useNativeDriver: true
                    }
                ),

                Animated.timing(
                    scanAnimation,
                    {
                        toValue: 0,
                        duration: 1800,
                        useNativeDriver: true
                    }
                )
            ])
        ).start();
    };

    const scanLinePosition =
        scanAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 300]
        });

    // =====================================================
    // STEP INFORMATION
    // =====================================================

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

    // =====================================================
    // VALIDATE IMAGES
    // =====================================================

    const validateImages = () => {
        if (
            !images.front ||
            !images.left ||
            !images.right
        ) {
            Alert.alert(
                "Images Missing",
                "Please capture all three face angles"
            );

            return false;
        }

        return true;
    };

    // =====================================================
    // RESET SCANNER
    // =====================================================

    const resetScanner = () => {
        setImages({
            front: null,
            left: null,
            right: null
        });

        setStep("front");
        setCameraReady(false);
        setCameraOpen(true);
        setScanning(false);
    };

    // =====================================================
    // RETAKE IMAGE
    // =====================================================

    const retakeImage = (
        type: "front" | "left" | "right"
    ) => {
        setImages(prev => ({
            ...prev,
            [type]: null
        }));

        setStep(type);
        setCameraReady(false);
        setCameraOpen(true);
    };

    // =====================================================
    // CAPTURE IMAGE
    // =====================================================

    const captureImage = async () => {
        try {
            if (!permission?.granted) {
                Alert.alert(
                    "Camera Permission Required",
                    "Please allow camera access before capturing your face.",
                    [
                        {
                            text: "Cancel",
                            style: "cancel"
                        },
                        {
                            text: "Allow Camera",
                            onPress:
                                handleCameraPermission
                        }
                    ]
                );

                return;
            }

            if (!cameraReady) {
                Alert.alert(
                    "Camera Not Ready",
                    "Please wait a moment for the camera to initialize."
                );

                return;
            }

            if (!cameraRef.current) {
                Alert.alert(
                    "Camera Error",
                    "Camera is not ready"
                );

                return;
            }

            const photo =
                await cameraRef.current.takePictureAsync({
                    quality: 1,
                    skipProcessing: false
                });

            if (!photo?.uri) {
                throw new Error(
                    "Image capture failed"
                );
            }

            if (step === "front") {
                setImages(prev => ({
                    ...prev,
                    front: photo.uri
                }));

                setStep("left");

                Alert.alert(
                    "Front Image Captured",
                    "Turn your face to left side"
                );
            }

            else if (step === "left") {
                setImages(prev => ({
                    ...prev,
                    left: photo.uri
                }));

                setStep("right");

                Alert.alert(
                    "Left Image Captured",
                    "Turn your face to right side"
                );
            }

            else if (step === "right") {
                setImages(prev => ({
                    ...prev,
                    right: photo.uri
                }));

                setStep("complete");
                setCameraReady(false);
                setCameraOpen(false);

                Alert.alert(
                    "All Images Captured",
                    "Ready for AI analysis"
                );
            }
        }

        catch (error: any) {
            console.log(
                "CAMERA CAPTURE ERROR:",
                error
            );

            Alert.alert(
                "Capture Failed",
                error?.message ||
                "Unable to capture image"
            );
        }
    };

    // =====================================================
    // PICK IMAGE
    // =====================================================

    const pickImage = async () => {
        try {
            const result =
                await ImagePicker.launchImageLibraryAsync({
                    mediaTypes:
                        ImagePicker.MediaTypeOptions.Images,
                    quality: 1
                });

            if (result.canceled) {
                return;
            }

            const uri =
                result.assets[0].uri;

            if (step === "front") {
                setImages(prev => ({
                    ...prev,
                    front: uri
                }));

                setStep("left");
            }

            else if (step === "left") {
                setImages(prev => ({
                    ...prev,
                    left: uri
                }));

                setStep("right");
            }

            else if (step === "right") {
                setImages(prev => ({
                    ...prev,
                    right: uri
                }));

                setStep("complete");
                setCameraReady(false);
                setCameraOpen(false);
            }
        }

        catch (error: any) {
            Alert.alert(
                "Upload Failed",
                error.message
            );
        }
    };

    // =====================================================
    // CONVERT IMAGE TO BASE64
    // =====================================================

    const convertToBase64 = async (
        uri: string
    ) => {
        try {
            const compressed =
                await manipulateAsync(
                    uri,
                    [
                        {
                            resize: {
                                width: 1024
                            }
                        }
                    ],
                    {
                        compress: 0.8,
                        format: SaveFormat.JPEG,
                        base64: true
                    }
                );

            if (!compressed.base64) {
                throw new Error(
                    "Base64 conversion failed"
                );
            }

            return compressed.base64;
        }

        catch (error) {
            console.log(
                "IMAGE BASE64 ERROR",
                error
            );

            throw new Error(
                "Unable to convert image"
            );
        }
    };

    // =====================================================
    // IMAGE COUNT
    // =====================================================

    const getImageCount = () => {
        let count = 0;

        if (images.front) {
            count++;
        }

        if (images.left) {
            count++;
        }

        if (images.right) {
            count++;
        }

        return count;
    };

    // =====================================================
    // CAPTURED IMAGE PREVIEW
    // =====================================================

    const renderCapturedImage = (
        type: "front" | "left" | "right",
        title: string
    ) => {
        const image =
            images[type];

        return (
            <View style={styles.previewCard}>

                <Text style={styles.previewTitle}>
                    {title}
                </Text>

                {
                    image ?

                        <>
                            <Image
                                source={{
                                    uri: image
                                }}
                                style={
                                    styles.previewImage
                                }
                            />

                            <TouchableOpacity
                                style={
                                    styles.retakeSmall
                                }
                                onPress={() =>
                                    retakeImage(type)
                                }
                            >
                                <Text
                                    style={
                                        styles.retakeSmallText
                                    }
                                >
                                    RETAKE
                                </Text>
                            </TouchableOpacity>
                        </>

                        :

                        <Text style={styles.emptyText}>
                            Not Captured
                        </Text>
                }

            </View>
        );
    };

    // =====================================================
    // AI ANALYSIS
    // =====================================================

    const startAIAnalysis = async () => {
        try {
            setLoading(true);
            setScanning(true);

            const frontImage = images.front;
            const leftImage = images.left;
            const rightImage = images.right;

            if (
                !frontImage ||
                !leftImage ||
                !rightImage
            ) {
                Alert.alert(
                    "Missing Images",
                    "Please capture all three face angles"
                );

                return;
            }

            const userData =
                await supabase.auth.getUser();

            const authUser =
                userData.data.user;

            if (!authUser) {
                Alert.alert(
                    "Login Required",
                    "Please login before scanning"
                );

                return;
            }

            const profileResponse =
                await supabase
                    .from("profiles")
                    .select("id")
                    .eq(
                        "auth_user_id",
                        authUser.id
                    )
                    .single();

            if (
                profileResponse.error ||
                !profileResponse.data
            ) {
                throw new Error(
                    "Profile not found"
                );
            }

            const profileId =
                profileResponse.data.id;

            console.log(
                "PROFILE ID",
                profileId
            );

            // ==========================
            // UPLOAD IMAGES
            // ==========================

            const frontUrl =
                await uploadFaceImage(
                    frontImage,
                    profileId,
                    "front"
                );

            const leftUrl =
                await uploadFaceImage(
                    leftImage,
                    profileId,
                    "left"
                );

            const rightUrl =
                await uploadFaceImage(
                    rightImage,
                    profileId,
                    "right"
                );

            console.log(
                "FINAL IMAGE URLS",
                {
                    frontUrl,
                    leftUrl,
                    rightUrl
                }
            );

            // ==========================
            // GEMINI ANALYSIS
            // ==========================

            const frontBase64 =
                await convertToBase64(
                    frontImage
                );

            const leftBase64 =
                await convertToBase64(
                    leftImage
                );

            const rightBase64 =
                await convertToBase64(
                    rightImage
                );

            const result =
                await analyzeMultiAngleFace({
                    front: frontBase64,
                    left: leftBase64,
                    right: rightBase64
                });

            console.log(
                "GEMINI RESULT",
                result
            );

            // ==========================
            // SAVE FACE SCAN
            // ==========================

            const {
                data: scanData,
                error: scanError
            } =
                await supabase
                    .from("face_scans")
                    .insert({
                        profile_id: profileId,
                        front_image_url: frontUrl,
                        left_image_url: leftUrl,
                        right_image_url: rightUrl,
                        face_shape:
                            result.faceShape,
                        ai_accuracy:
                            result.confidence,
                        scan_version: "3-angle"
                    })
                    .select()
                    .single();

            if (scanError) {
                console.log(
                    "SCAN INSERT ERROR",
                    scanError
                );

                throw scanError;
            }

            const scanId =
                scanData.id;

            console.log(
                "SCAN ID",
                scanId
            );

            // ==========================
            // SAVE METRICS
            // ==========================

            const metrics =
                result.metrics || {};

            const {
                data: metricData,
                error: metricError
            } =
                await supabase
                    .from("face_metrics")
                    .insert({
                        scan_id: scanId,
                        profile_id: profileId,
                        face_length:
                            metrics.faceLength,
                        face_width:
                            metrics.faceWidth,
                        face_ratio:
                            metrics.faceRatio,
                        forehead_width:
                            metrics.foreheadWidth,
                        forehead_height:
                            metrics.foreheadHeight,
                        cheekbone_width:
                            metrics.cheekboneWidth,
                        jaw_width:
                            metrics.jawWidth,
                        jaw_angle:
                            metrics.jawAngle,
                        jawline_shape:
                            metrics.jawlineShape,
                        face_symmetry:
                            metrics.faceSymmetry
                    })
                    .select()
                    .single();

            console.log(
                "INSERTED METRICS:",
                metricData
            );

            console.log(
                "METRICS ERROR:",
                metricError
            );

            if (metricError) {
                console.log(
                    "METRIC INSERT ERROR",
                    metricError
                );

                throw metricError;
            }

            try {
                await supabase
                    .from("profile_history")
                    .insert({
                        profile_id: profileId,
                        activity_type: "FACE_SCAN",
                        title:
                            "AI Face Scan Completed",
                        description:
                            `Face Shape: ${result.faceShape || "Detected"} | Accuracy: ${result.confidence || result.aiAccuracy || "AI"}`,
                        activity_date:
                            new Date().toISOString()
                    });
            }

            catch (historyErr) {
                console.log(
                    "HISTORY INSERT ERROR",
                    historyErr
                );
            }

            // ==========================
            // OPEN RESULT
            // ==========================

            router.push({
                pathname: "/face-result",
                params: {
                    scanId: scanId,
                    data:
                        JSON.stringify(result),
                    images:
                        JSON.stringify({
                            front: frontUrl,
                            left: leftUrl,
                            right: rightUrl
                        })
                }
            });
        }

        catch (error: any) {
            console.log(
                "SCAN PROCESS ERROR",
                error
            );

            Alert.alert(
                "Scan Failed",
                error.message ||
                "Unable to analyse face"
            );
        }

        finally {
            setLoading(false);
            setScanning(false);
        }
    };

    const startScan =
        startAIAnalysis;

    // =====================================================
    // UI
    // =====================================================

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >

            <Text style={styles.header}>
                AI FACE SCANNER
            </Text>

            <Text style={styles.subHeader}>
                Advanced Facial Geometry Analysis
            </Text>

            <View style={styles.stepCard}>

                <Text style={styles.stepNumber}>
                    {getStepNumber()}
                </Text>

                <Text style={styles.stepTitle}>
                    {getStepTitle()}
                </Text>

            </View>

            {
                cameraOpen &&
                step !== "complete" &&

                <View style={styles.cameraBox}>

                    {
                        permission?.granted ? (

                            <>
                                <CameraView
                                    ref={cameraRef}
                                    style={styles.camera}
                                    facing="front"

                                    onCameraReady={() => {
                                        console.log(
                                            "CAMERA READY"
                                        );

                                        setCameraReady(
                                            true
                                        );
                                    }}

                                    onMountError={(
                                        error: any
                                    ) => {
                                        console.log(
                                            "CAMERA MOUNT ERROR:",
                                            error?.message ||
                                            error
                                        );

                                        setCameraReady(
                                            false
                                        );

                                        Alert.alert(
                                            "Camera Error",
                                            error?.message ||
                                            "Unable to initialize the camera."
                                        );
                                    }}
                                />

                                <View
                                    style={
                                        styles.faceFrame
                                    }
                                    pointerEvents="none"
                                >
                                    <View
                                        style={
                                            styles.cornerTL
                                        }
                                    />

                                    <View
                                        style={
                                            styles.cornerTR
                                        }
                                    />

                                    <View
                                        style={
                                            styles.cornerBL
                                        }
                                    />

                                    <View
                                        style={
                                            styles.cornerBR
                                        }
                                    />
                                </View>

                                <Animated.View
                                    pointerEvents="none"
                                    style={[
                                        styles.scanLine,
                                        {
                                            transform: [
                                                {
                                                    translateY:
                                                        scanLinePosition
                                                }
                                            ]
                                        }
                                    ]}
                                />

                                <View
                                    style={
                                        styles.cameraInfo
                                    }
                                    pointerEvents="none"
                                >
                                    <Text
                                        style={
                                            styles.cameraInfoText
                                        }
                                    >
                                        Keep your face inside the frame
                                    </Text>
                                </View>
                            </>

                        ) : (

                            <View
                                style={
                                    styles.permissionContainer
                                }
                            >

                                <Text
                                    style={
                                        styles.permissionTitle
                                    }
                                >
                                    CAMERA ACCESS REQUIRED
                                </Text>

                                <Text
                                    style={
                                        styles.permissionText
                                    }
                                >
                                    Kshurak needs camera access to capture your front, left and right face images for AI facial analysis.
                                </Text>

                                <TouchableOpacity
                                    style={
                                        styles.permissionButton
                                    }
                                    onPress={
                                        handleCameraPermission
                                    }
                                >
                                    <Text
                                        style={
                                            styles.permissionButtonText
                                        }
                                    >
                                        ENABLE CAMERA
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        )
                    }

                </View>
            }

            {
                step === "complete" &&

                <View style={styles.resultCard}>

                    <Text style={styles.completeTitle}>
                        FACE CAPTURE COMPLETE
                    </Text>

                    <Text style={styles.completeSub}>
                        Ready for AI geometry analysis
                    </Text>

                    <View style={styles.previewRow}>

                        {renderCapturedImage(
                            "front",
                            "FRONT"
                        )}

                        {renderCapturedImage(
                            "left",
                            "LEFT"
                        )}

                        {renderCapturedImage(
                            "right",
                            "RIGHT"
                        )}

                    </View>

                </View>
            }

            <View style={styles.buttonRow}>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={captureImage}
                    disabled={loading}
                >
                    <Text style={styles.secondaryText}>
                        CAPTURE
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={pickImage}
                    disabled={loading}
                >
                    <Text style={styles.secondaryText}>
                        UPLOAD
                    </Text>
                </TouchableOpacity>

            </View>

            <TouchableOpacity
                style={styles.retakeButton}
                onPress={resetScanner}
                disabled={loading}
            >
                <Text style={styles.retakeText}>
                    RETAKE ALL
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.scanButton,
                    loading && {
                        opacity: 0.6
                    }
                ]}
                onPress={startAIAnalysis}
                disabled={loading}
            >
                <Text style={styles.scanText}>
                    {
                        loading ?
                            "ANALYZING FACE..." :
                            "START AI ANALYSIS"
                    }
                </Text>
            </TouchableOpacity>

            {
                scanning &&

                <View style={styles.processingCard}>

                    <Text style={styles.processingTitle}>
                        AI PROCESSING
                    </Text>

                    <Text style={styles.processingText}>
                        Calculating facial geometry, symmetry and proportions
                    </Text>

                </View>
            }

        </ScrollView>
    );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 18
    },

    header: {
        marginTop: 46,
        textAlign: "center",
        fontSize: 25,
        lineHeight: 31,
        fontWeight: "900",
        letterSpacing: 1.1,
        color: COLORS.primary
    },

    subHeader: {
        marginTop: 5,
        textAlign: "center",
        color: COLORS.textSecondary,
        fontSize: 11,
        lineHeight: 17,
        fontWeight: "600",
        letterSpacing: 0.3
    },

    stepCard: {
        marginTop: 20,
        paddingVertical: 15,
        paddingHorizontal: 18,
        backgroundColor: COLORS.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 4
    },

    stepNumber: {
        color: COLORS.primary,
        fontSize: 9,
        fontWeight: "900",
        letterSpacing: 1.5
    },

    stepTitle: {
        marginTop: 7,
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "900",
        letterSpacing: 0.35,
        textAlign: "center"
    },

    cameraBox: {
        height: 410,
        marginTop: 16,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceDark,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 6
    },

    camera: {
        flex: 1
    },

    // =====================================================
    // CAMERA PERMISSION UI
    // =====================================================

    permissionContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
        backgroundColor: COLORS.surfaceDark
    },

    permissionTitle: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: "900",
        letterSpacing: 1,
        textAlign: "center"
    },

    permissionText: {
        marginTop: 12,
        color: COLORS.textSecondary,
        fontSize: 11,
        lineHeight: 18,
        fontWeight: "600",
        textAlign: "center"
    },

    permissionButton: {
        marginTop: 22,
        minHeight: 46,
        paddingHorizontal: 28,
        borderRadius: 13,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center"
    },

    permissionButtonText: {
        color: COLORS.black,
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 0.8
    },

    faceFrame: {
        position: "absolute",
        top: 52,
        left: 44,
        right: 44,
        bottom: 52,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 170
    },

    cornerTL: {
        position: "absolute",
        top: -2,
        left: -2,
        width: 31,
        height: 31,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: COLORS.primary,
        borderTopLeftRadius: 8
    },

    cornerTR: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 31,
        height: 31,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: COLORS.primary,
        borderTopRightRadius: 8
    },

    cornerBL: {
        position: "absolute",
        bottom: -2,
        left: -2,
        width: 31,
        height: 31,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: COLORS.primary,
        borderBottomLeftRadius: 8
    },

    cornerBR: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 31,
        height: 31,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: COLORS.primary,
        borderBottomRightRadius: 8
    },

    scanLine: {
        position: "absolute",
        left: 52,
        right: 52,
        height: 2,
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 4
    },

    cameraInfo: {
        position: "absolute",
        bottom: 16,
        left: 24,
        right: 24,
        backgroundColor: "rgba(0,0,0,0.68)",
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)"
    },

    cameraInfoText: {
        color: "#FFFFFF",
        fontSize: 10,
        lineHeight: 15,
        fontWeight: "700",
        letterSpacing: 0.25,
        textAlign: "center"
    },

    resultCard: {
        marginTop: 17,
        backgroundColor: COLORS.surface,
        padding: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 4
    },

    completeTitle: {
        textAlign: "center",
        color: COLORS.primary,
        fontWeight: "900",
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: 0.7
    },

    completeSub: {
        textAlign: "center",
        marginTop: 5,
        color: COLORS.textSecondary,
        fontSize: 10,
        lineHeight: 16,
        fontWeight: "600"
    },

    previewRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 14
    },

    previewCard: {
        flex: 1,
        backgroundColor: COLORS.surfaceDark,
        padding: 7,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: COLORS.border
    },

    previewTitle: {
        color: COLORS.primary,
        fontWeight: "900",
        textAlign: "center",
        fontSize: 8,
        letterSpacing: 0.8
    },

    previewImage: {
        height: 94,
        width: "100%",
        marginTop: 7,
        borderRadius: 9,
        backgroundColor: COLORS.background
    },

    emptyText: {
        color: COLORS.textMuted,
        textAlign: "center",
        marginTop: 30,
        marginBottom: 25,
        fontSize: 9,
        fontWeight: "600"
    },

    retakeSmall: {
        marginTop: 7,
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: "center"
    },

    retakeSmallText: {
        color: COLORS.primary,
        fontWeight: "900",
        fontSize: 8,
        letterSpacing: 0.5
    },

    buttonRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16
    },

    secondaryButton: {
        flex: 1,
        minHeight: 45,
        borderRadius: 13,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 2
    },

    secondaryText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 0.8
    },

    retakeButton: {
        marginTop: 11,
        minHeight: 43,
        borderRadius: 13,
        backgroundColor: COLORS.surface,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: COLORS.border
    },

    retakeText: {
        color: COLORS.text,
        fontSize: 9,
        fontWeight: "900",
        letterSpacing: 0.8
    },

    scanButton: {
        marginTop: 11,
        minHeight: 52,
        borderRadius: 15,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 6
        },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 5
    },

    scanText: {
        color: COLORS.black,
        fontWeight: "900",
        fontSize: 12,
        letterSpacing: 0.8
    },

    processingCard: {
        backgroundColor: COLORS.surface,
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 17,
        alignItems: "center",
        marginBottom: 30,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6
        },
        shadowOpacity: 0.14,
        shadowRadius: 12,
        elevation: 3
    },

    processingTitle: {
        color: COLORS.primary,
        fontWeight: "900",
        fontSize: 11,
        letterSpacing: 1
    },

    processingText: {
        color: COLORS.textSecondary,
        marginTop: 7,
        textAlign: "center",
        fontSize: 10,
        lineHeight: 16,
        fontWeight: "600"
    }
});