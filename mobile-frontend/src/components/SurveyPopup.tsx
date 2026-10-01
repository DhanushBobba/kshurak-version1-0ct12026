import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function SurveyPopup({
    visible,
    onClose
}: Props) {
    const router = useRouter();

    const startSurvey = () => {
        onClose();
        router.push("/survey");
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.icon}>✦</Text>
                    </View>

                    <Text style={styles.title}>
                        Discover Your Perfect Style
                    </Text>

                    <Text style={styles.description}>
                        Complete our 5 step hair survey{"\n"}
                        for better hairstyle recommendations.
                    </Text>

                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={startSurvey}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.startText}>
                            START NOW
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.skipText}>
                            SKIP
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.72)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20
    },
    card: {
        width: "88%",
        backgroundColor: COLORS.surface,
        borderRadius: 25,
        padding: 25,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center"
    },
    iconCircle: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: COLORS.surfaceDark,
        borderWidth: 1,
        borderColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 17
    },
    icon: {
        color: COLORS.primary,
        fontSize: 27,
        fontWeight: "900"
    },
    title: {
        fontSize: 24,
        fontWeight: "900",
        color: COLORS.text,
        textAlign: "center"
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: 15,
        textAlign: "center",
        marginTop: 12,
        lineHeight: 23
    },
    startButton: {
        width: "100%",
        backgroundColor: COLORS.primary,
        height: 55,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 25
    },
    startText: {
        color: COLORS.black,
        fontSize: 16,
        fontWeight: "900",
        letterSpacing: 0.5
    },
    skipButton: {
        width: "100%",
        height: 50,
        justifyContent: "center",
        alignItems: "center"
    },
    skipText: {
        color: COLORS.textMuted,
        fontSize: 15,
        fontWeight: "700"
    }
});