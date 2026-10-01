import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/colors";
export default function Signup() {
    const router = useRouter();
    const { signup } = useAuth();
    const [showGender, setShowGender] = useState(false);
    const [form, setForm] = useState({
        username: "",
        age: "",
        gender: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const update = (key: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };
    const handleSignup = async () => {
        if (!form.username || !form.age || !form.gender || !form.email || !form.password || !form.confirmPassword) {
            Alert.alert("Missing Details", "Please fill all fields");
            return;
        }
        if (form.password !== form.confirmPassword) {
            Alert.alert("Password Error", "Passwords do not match");
            return;
        }
        try {
            await signup({
                username: form.username,
                age: form.age,
                gender: form.gender,
                email: form.email,
                password: form.password
            });
            router.replace("/");
        } catch (error: any) {
            Alert.alert("Signup Failed", error.message);
        }
    };
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.logoContainer}>
                <View style={styles.logoBox}>
                    <Image source={require("../../../assets/images/logo.png")} style={styles.logo} />
                </View>
                
                <Text style={styles.subtitle}>Build your personalized grooming profile</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.cardTitle}>ACCOUNT DETAILS</Text>
                    </View>
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepText}>01</Text>
                    </View>
                </View>
                <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>USERNAME</Text>
                    <View style={styles.inputBox}>
                        <View style={styles.inputIconBox}>
                            <Text style={styles.inputIcon}>U</Text>
                        </View>
                        <TextInput placeholder="Enter your username" placeholderTextColor={COLORS.textMuted} value={form.username} onChangeText={v => update("username", v)} style={styles.input} />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>AGE</Text>
                        <View style={styles.smallInput}>
                            <View style={styles.smallIconBox}>
                                <Text style={styles.inputIcon}>#</Text>
                            </View>
                            <TextInput placeholder="Age" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={form.age} onChangeText={v => update("age", v)} style={styles.smallTextInput} />
                        </View>
                    </View>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>GENDER</Text>
                        <TouchableOpacity style={[styles.smallInput, showGender && styles.focusedInput]} onPress={() => setShowGender(!showGender)} activeOpacity={0.85}>
                            <View style={styles.smallIconBox}>
                                <Text style={styles.inputIcon}>G</Text>
                            </View>
                            <Text style={[styles.genderText, form.gender ? styles.value : styles.placeholder]} numberOfLines={1}>{form.gender || "Select"}</Text>
                            <Text style={styles.dropdownArrow}>{showGender ? "⌃" : "⌄"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {showGender && (
                    <View style={styles.genderMenu}>
                        <Text style={styles.genderMenuLabel}>SELECT GENDER</Text>
                        {["Male", "Female", "Others"].map((item, index) => (
                            <TouchableOpacity key={item} style={[styles.genderOption, index < 2 && styles.genderOptionBorder]} onPress={() => { update("gender", item); setShowGender(false); }} activeOpacity={0.75}>
                                <View style={[styles.genderRadio, form.gender === item && styles.genderRadioSelected]}>{form.gender === item && <View style={styles.genderRadioDot} />}</View>
                                <Text style={[styles.option, form.gender === item && styles.optionSelected]}>{item}</Text>
                                {form.gender === item && <Text style={styles.selectedLabel}>SELECTED</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                    <View style={styles.inputBox}>
                        <View style={styles.inputIconBox}>
                            <Text style={styles.inputIcon}>@</Text>
                        </View>
                        <TextInput placeholder="Enter your email address" placeholderTextColor={COLORS.textMuted} keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={v => update("email", v)} style={styles.input} />
                    </View>
                </View>
                <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>PASSWORD</Text>
                    <View style={styles.inputBox}>
                        <View style={styles.inputIconBox}>
                            <Text style={styles.lockIcon}>◆</Text>
                        </View>
                        <TextInput placeholder="Create password" placeholderTextColor={COLORS.textMuted} secureTextEntry value={form.password} onChangeText={v => update("password", v)} style={styles.input} />
                    </View>
                </View>
                <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>CONFIRM PASSWORD</Text>
                    <View style={styles.inputBox}>
                        <View style={styles.inputIconBox}>
                            <Text style={styles.lockIcon}>◆</Text>
                        </View>
                        <TextInput placeholder="Confirm your password" placeholderTextColor={COLORS.textMuted} secureTextEntry value={form.confirmPassword} onChangeText={v => update("confirmPassword", v)} style={styles.input} />
                    </View>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleSignup} activeOpacity={0.85}>
                    <Text style={styles.buttonText}>COMPLETE REGISTRATION</Text>
                    <Text style={styles.buttonArrow}>›</Text>
                </TouchableOpacity>
                <View style={styles.securityRow}>
                    <View style={styles.securityIconBox}>
                        <Text style={styles.securityIcon}>✓</Text>
                    </View>
                    <View style={styles.securityContent}>
                        <Text style={styles.securityTitle}>SECURE REGISTRATION</Text>
                        <Text style={styles.securityText}>Your personal information is securely protected.</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/auth/login")} activeOpacity={0.8}>
                <Text style={styles.bottomText}>Already have an account?<Text style={styles.gold}> Login</Text></Text>
            </TouchableOpacity>
            <Text style={styles.footer}>KSHURAK • AI GROOMING PLATFORM</Text>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30, flexGrow: 1, justifyContent: "center" },
    logoContainer: { alignItems: "center", marginBottom: 19 },
    logoBox: { width: 112, height: 80, alignItems: "center", justifyContent: "center" },
    logo: { width: 112, height: 80, resizeMode: "contain" },
    eyebrow: { marginTop: 3, color: COLORS.primary, fontSize: 6.5, fontWeight: "900", letterSpacing: 1.4, textAlign: "center" },
    heading: { marginTop: 5, color: COLORS.text, fontSize: 20, fontWeight: "900", letterSpacing: 0.7, textAlign: "center" },
    subtitle: { marginTop: 4, color: COLORS.textMuted, fontSize: 9, lineHeight: 14, fontWeight: "600", textAlign: "center" },
    card: { backgroundColor: COLORS.surface, borderRadius: 22, paddingHorizontal: 15, paddingTop: 15, paddingBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.2, shadowRadius: 18, elevation: 5 },
    cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5 },
    cardEyebrow: { color: COLORS.textMuted, fontSize: 6.5, fontWeight: "900", letterSpacing: 1.2 },
    cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: "900", letterSpacing: 0.4, marginTop: 3 },
    stepBadge: { width: 31, height: 31, borderRadius: 10, backgroundColor: COLORS.surfaceDark, borderWidth: 1, borderColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
    stepText: { color: COLORS.primary, fontSize: 8, fontWeight: "900" },
    fieldSection: { marginTop: 12 },
    fieldLabel: { color: COLORS.textMuted, fontSize: 6.5, fontWeight: "900", letterSpacing: 0.9, marginLeft: 2, marginBottom: 5 },
    inputBox: { height: 49, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surfaceDark, flexDirection: "row", alignItems: "center", paddingHorizontal: 8 },
    inputIconBox: { width: 32, height: 32, borderRadius: 9, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
    inputIcon: { fontSize: 10, color: COLORS.primary, fontWeight: "900" },
    lockIcon: { fontSize: 9, color: COLORS.primary },
    input: { flex: 1, marginLeft: 9, fontSize: 10.5, color: COLORS.text, fontWeight: "600", paddingVertical: 0 },
    row: { flexDirection: "row", gap: 9, marginTop: 12 },
    halfField: { flex: 1 },
    smallInput: { height: 49, backgroundColor: COLORS.surfaceDark, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 7 },
    focusedInput: { borderColor: COLORS.primary },
    smallIconBox: { width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
    smallTextInput: { flex: 1, marginLeft: 7, fontSize: 10.5, color: COLORS.text, fontWeight: "600", paddingVertical: 0 },
    genderText: { flex: 1, marginLeft: 7, fontSize: 10.5, fontWeight: "600" },
    placeholder: { color: COLORS.textMuted },
    value: { color: COLORS.text },
    dropdownArrow: { color: COLORS.primary, fontSize: 13, fontWeight: "900", marginLeft: 3 },
    genderMenu: { backgroundColor: COLORS.surfaceDark, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginTop: 8, paddingHorizontal: 10, paddingTop: 9, paddingBottom: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.16, shadowRadius: 10, elevation: 4 },
    genderMenuLabel: { color: COLORS.textMuted, fontSize: 6, fontWeight: "900", letterSpacing: 1, marginBottom: 3 },
    genderOption: { minHeight: 39, flexDirection: "row", alignItems: "center" },
    genderOptionBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
    genderRadio: { width: 15, height: 15, borderRadius: 8, borderWidth: 1, borderColor: COLORS.textMuted, alignItems: "center", justifyContent: "center" },
    genderRadioSelected: { borderColor: COLORS.primary },
    genderRadioDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.primary },
    option: { color: COLORS.text, fontSize: 9.5, fontWeight: "700", marginLeft: 9, flex: 1 },
    optionSelected: { color: COLORS.primary, fontWeight: "900" },
    selectedLabel: { color: COLORS.primary, fontSize: 5.5, fontWeight: "900", letterSpacing: 0.7 },
    button: { height: 49, backgroundColor: COLORS.primary, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 17, flexDirection: "row", shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.22, shadowRadius: 10, elevation: 4 },
    buttonText: { fontSize: 9.5, fontWeight: "900", color: COLORS.black, letterSpacing: 0.8 },
    buttonArrow: { position: "absolute", right: 16, fontSize: 22, lineHeight: 24, color: COLORS.black },
    securityRow: { marginTop: 13, backgroundColor: COLORS.surfaceDark, borderRadius: 11, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 9, flexDirection: "row", alignItems: "center" },
    securityIconBox: { width: 29, height: 29, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center", marginRight: 9 },
    securityIcon: { color: COLORS.primary, fontSize: 11, fontWeight: "900" },
    securityContent: { flex: 1 },
    securityTitle: { color: COLORS.primary, fontSize: 6, fontWeight: "900", letterSpacing: 0.8 },
    securityText: { color: COLORS.textMuted, fontSize: 7.5, lineHeight: 11, marginTop: 2, fontWeight: "600" },
    loginLink: { paddingVertical: 13 },
    bottomText: { textAlign: "center", color: COLORS.textMuted, fontSize: 9.5, fontWeight: "600" },
    gold: { color: COLORS.primary, fontWeight: "900" },
    footer: { color: COLORS.textMuted, fontSize: 6, textAlign: "center", fontWeight: "800", letterSpacing: 1.1 }
});