import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/colors";
export default function Login() {
    const router = useRouter();
    const { login, googleLogin, facebookLogin } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const handleLogin = async () => {
        try {
            await login(email, password);
            router.replace("/");
        } catch (error: any) {
            Alert.alert("Login Failed", error.message);
        }
    };
    const handleGoogleLogin = async () => {
        try {
            await googleLogin();
            router.replace("/");
        } catch (error: any) {
            Alert.alert(
                "Google Login Failed",
                error?.message || "Unable to sign in with Google"
            );
        }
    };

    const handleFacebookLogin = async () => {
        try {
            await facebookLogin();
            router.replace("/");
        } catch (error: any) {
            Alert.alert(
                "Facebook Login Failed",
                error?.message || "Unable to sign in with Facebook"
            );
        }
    };
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.logoContainer}>
                <View style={styles.logoGlow}>
                    <Image source={require("../../../assets/images/logo.png")} style={styles.logo} />
                </View>

            </View>
            <View style={styles.card}>
                <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>LOGIN TO KSHURAK</Text>
                </View>
                <View style={styles.switchBox}>
                    <TouchableOpacity style={styles.activeTab} activeOpacity={0.85}>
                        <Text style={styles.tabIcon}>●</Text>
                        <Text style={styles.activeText}>USER LOGIN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inactiveTab} activeOpacity={0.85}>
                        <Text style={styles.tabIconInactive}>✂</Text>
                        <Text style={styles.inactiveText}>BARBER LOGIN</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>EMAIL / USERNAME</Text>
                    <View style={styles.inputBox}>
                        <View style={styles.inputIconBox}>
                            <Text style={styles.inputIcon}>@</Text>
                        </View>
                        <TextInput placeholder="Enter email or username" placeholderTextColor={COLORS.textMuted} value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
                    </View>
                </View>
                <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>PASSWORD</Text>
                    <View style={styles.inputBox}>
                        <View style={styles.inputIconBox}>
                            <Text style={styles.lockIcon}>◆</Text>
                        </View>
                        <TextInput placeholder="Enter your password" placeholderTextColor={COLORS.textMuted} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} style={styles.input} />
                        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                            <Text style={styles.eye}>{showPassword ? "◉" : "◎"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
                    <Text style={styles.loginText}>VERIFY & LOGIN</Text>
                    <Text style={styles.loginArrow}>›</Text>
                </TouchableOpacity>
                <View style={styles.dividerRow}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                    <View style={styles.divider} />
                </View>
                <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin} activeOpacity={0.85}>
                        <View style={styles.socialIconBox}>
                            <Text style={styles.googleIcon}>G</Text>
                        </View>
                        <Text style={styles.socialText}>Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin} activeOpacity={0.85}>
                        <View style={styles.socialIconBox}>
                            <Text style={styles.facebookIcon}>f</Text>
                        </View>
                        <Text style={styles.socialText}>Facebook</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.security}>
                <View style={styles.securityIconBox}>
                    <Text style={styles.securityIcon}>✓</Text>
                </View>
                <View style={styles.securityContent}>
                    <Text style={styles.securityTitle}>SECURE & PRIVATE</Text>
                    <Text style={styles.securityText}>Your data is secure and encrypted with enterprise-grade protection.</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.signupButton} onPress={() => router.push("/auth/signup")} activeOpacity={0.8}>
                <Text style={styles.signupText}>Don't have an account?<Text style={styles.gold}> Create Account</Text></Text>
            </TouchableOpacity>
            <Text style={styles.footer}>KSHURAK • AI GROOMING PLATFORM</Text>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { paddingHorizontal: 20, paddingTop: 34, paddingBottom: 30, flexGrow: 1, justifyContent: "center" },
    logoContainer: { alignItems: "center", marginBottom: 22 },
    logoGlow: { width: 126, height: 92, alignItems: "center", justifyContent: "center" },
    logo: { width: 126, height: 92, resizeMode: "contain" },
    eyebrow: { marginTop: 4, color: COLORS.primary, fontSize: 7, fontWeight: "900", letterSpacing: 1.5, textAlign: "center" },
    welcome: { marginTop: 6, color: COLORS.text, fontSize: 21, fontWeight: "900", letterSpacing: 0.7, textAlign: "center" },
    subtitle: { marginTop: 5, maxWidth: 290, color: COLORS.textMuted, fontSize: 9.5, lineHeight: 15, fontWeight: "600", textAlign: "center" },
    card: { backgroundColor: COLORS.surface, borderRadius: 22, paddingHorizontal: 15, paddingTop: 16, paddingBottom: 17, borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.2, shadowRadius: 18, elevation: 5 },
    cardTop: { marginBottom: 13 },
    cardEyebrow: { color: COLORS.textMuted, fontSize: 6.5, fontWeight: "900", letterSpacing: 1.3 },
    cardTitle: { color: COLORS.text, fontSize: 15, fontWeight: "900", letterSpacing: 0.4, marginTop: 3 },
    switchBox: { height: 46, flexDirection: "row", backgroundColor: COLORS.surfaceDark, borderRadius: 12, padding: 3, borderWidth: 1, borderColor: COLORS.border },
    activeTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.surfaceLight, borderRadius: 9, borderWidth: 1, borderColor: COLORS.primary },
    inactiveTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 9 },
    tabIcon: { fontSize: 7, color: COLORS.primary, marginRight: 6 },
    tabIconInactive: { fontSize: 11, color: COLORS.textMuted, marginRight: 6 },
    activeText: { color: COLORS.primary, fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
    inactiveText: { color: COLORS.textMuted, fontSize: 8, fontWeight: "800", letterSpacing: 0.4 },
    fieldSection: { marginTop: 14 },
    fieldLabel: { color: COLORS.textMuted, fontSize: 7, fontWeight: "900", letterSpacing: 1, marginLeft: 2, marginBottom: 6 },
    inputBox: { height: 51, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surfaceDark, flexDirection: "row", alignItems: "center", paddingHorizontal: 8 },
    inputIconBox: { width: 34, height: 34, borderRadius: 9, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
    inputIcon: { fontSize: 13, color: COLORS.primary, fontWeight: "900" },
    lockIcon: { fontSize: 10, color: COLORS.primary },
    input: { flex: 1, marginLeft: 10, fontSize: 11, color: COLORS.text, fontWeight: "600", paddingVertical: 0 },
    eyeButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
    eye: { fontSize: 16, color: COLORS.primary },
    loginButton: { height: 50, backgroundColor: COLORS.primary, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 18, flexDirection: "row", shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.22, shadowRadius: 10, elevation: 4 },
    loginText: { fontSize: 10, fontWeight: "900", color: COLORS.black, letterSpacing: 1 },
    loginArrow: { position: "absolute", right: 17, fontSize: 23, lineHeight: 25, fontWeight: "500", color: COLORS.black },
    dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 13 },
    divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
    dividerText: { marginHorizontal: 10, color: COLORS.textMuted, fontSize: 6.5, fontWeight: "900", letterSpacing: 0.9 },
    socialRow: { flexDirection: "row", gap: 9 },
    socialButton: { flex: 1, height: 45, borderRadius: 11, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: COLORS.surfaceDark },
    socialIconBox: { width: 25, height: 25, borderRadius: 7, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center", marginRight: 7, borderWidth: 1, borderColor: COLORS.border },
    googleIcon: { color: COLORS.primary, fontSize: 10, fontWeight: "900" },
    facebookIcon: { color: COLORS.primary, fontSize: 13, fontWeight: "900" },
    socialText: { color: COLORS.text, fontSize: 9, fontWeight: "800" },
    security: { flexDirection: "row", alignItems: "center", marginTop: 17, backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 11 },
    securityIconBox: { width: 33, height: 33, borderRadius: 10, backgroundColor: COLORS.surfaceDark, borderWidth: 1, borderColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginRight: 10 },
    securityIcon: { color: COLORS.primary, fontSize: 13, fontWeight: "900" },
    securityContent: { flex: 1 },
    securityTitle: { color: COLORS.primary, fontSize: 7, fontWeight: "900", letterSpacing: 0.9 },
    securityText: { color: COLORS.textMuted, fontSize: 8, lineHeight: 12, marginTop: 2, fontWeight: "600" },
    signupButton: { paddingVertical: 13 },
    signupText: { textAlign: "center", color: COLORS.textMuted, fontSize: 9.5, fontWeight: "600" },
    gold: { color: COLORS.primary, fontWeight: "900" },
    footer: { marginTop: 3, color: COLORS.textMuted, fontSize: 6, textAlign: "center", fontWeight: "800", letterSpacing: 1.1 }
});