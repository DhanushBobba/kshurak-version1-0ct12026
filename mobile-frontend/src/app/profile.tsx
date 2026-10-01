import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
export default function Profile() {
    const router = useRouter();
    const { logout } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [children, setChildren] = useState<any[]>([]);
    const [activeProfile, setActiveProfile] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [profileImageError, setProfileImageError] = useState(false);
    useFocusEffect(useCallback(() => { loadProfile(); }, []));
    const resolveProfileImage = (value?: string | null) => {
        if (!value) return null;
        const imageValue = String(value).trim();
        if (!imageValue) return null;
        if (imageValue.startsWith("http://") || imageValue.startsWith("https://")) return imageValue;
        if (imageValue.startsWith("file://") || imageValue.startsWith("content://")) return imageValue;
        let storagePath = imageValue;
        if (storagePath.startsWith("profile-images/")) storagePath = storagePath.replace(/^profile-images\//, "");
        const { data } = supabase.storage.from("profile-images").getPublicUrl(storagePath);
        return data?.publicUrl || null;
    };
    const loadProfile = async () => {
        try {
            setLoading(true);
            setProfileImageError(false);
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;
            if (!user) return;
            const { data: profileData, error: profileError } = await supabase.from("profiles").select("*").eq("auth_user_id", user.id).maybeSingle();
            if (profileError) {
                console.log("Profile error", profileError);
                return;
            }
            if (!profileData) {
                console.log("Profile not found");
                return;
            }
            const rawProfileImage = profileData.profile_image_url || profileData.profile_image || null;
            const resolvedProfileImage = resolveProfileImage(rawProfileImage);
            console.log("PROFILE RAW IMAGE:", rawProfileImage);
            console.log("PROFILE RESOLVED IMAGE:", resolvedProfileImage);
            setProfile({ ...profileData, profile_image_url: resolvedProfileImage, profile_image: resolvedProfileImage });
            const { data: childData, error: childError } = await supabase.from("child_profiles").select("*").eq("parent_profile_id", profileData.id);
            if (childError) console.log("Child error", childError);
            const normalizedChildren = (childData || []).map((child: any) => {
                const rawImage = child.profile_image_url || child.profile_image || null;
                const resolvedImage = resolveProfileImage(rawImage);
                return { ...child, profile_image_url: resolvedImage, profile_image: resolvedImage };
            });
            setChildren(normalizedChildren);
            const { data: activeData, error: activeError } = await supabase.from("user_profiles").select("*").eq("parent_id", profileData.id).eq("is_active", true).maybeSingle();
            if (!activeError && activeData) setActiveProfile(activeData.profile_id);
        } catch (error) {
            console.log("Profile loading error", error);
        } finally {
            setLoading(false);
        }
    };
    const uploadImage = async (uri: string) => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;
            if (!user) throw new Error("User not found");
            const convertedImage = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 1000 } }],
                {
                    compress: 0.85,
                    format: ImageManipulator.SaveFormat.JPEG,
                    base64: true
                }
            );
            if (!convertedImage.base64) throw new Error("Image conversion failed");
            console.log("CONVERTED PROFILE IMAGE:", convertedImage.uri);
            console.log("PROFILE BASE64 LENGTH:", convertedImage.base64.length);
            const base64ToArrayBuffer = (base64: string) => {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                let cleanBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, "");
                let padding = 0;
                if (cleanBase64.endsWith("==")) padding = 2;
                else if (cleanBase64.endsWith("=")) padding = 1;
                const byteLength = Math.floor((cleanBase64.length * 3) / 4) - padding;
                const bytes = new Uint8Array(byteLength);
                let byteIndex = 0;
                for (let i = 0; i < cleanBase64.length; i += 4) {
                    const c1 = chars.indexOf(cleanBase64[i]);
                    const c2 = chars.indexOf(cleanBase64[i + 1]);
                    const c3 = cleanBase64[i + 2] === "=" ? 0 : chars.indexOf(cleanBase64[i + 2]);
                    const c4 = cleanBase64[i + 3] === "=" ? 0 : chars.indexOf(cleanBase64[i + 3]);
                    const combined = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;
                    if (byteIndex < byteLength) bytes[byteIndex++] = (combined >> 16) & 255;
                    if (byteIndex < byteLength) bytes[byteIndex++] = (combined >> 8) & 255;
                    if (byteIndex < byteLength) bytes[byteIndex++] = combined & 255;
                }
                return bytes.buffer;
            };
            const arrayBuffer = base64ToArrayBuffer(convertedImage.base64);
            if (!arrayBuffer.byteLength) throw new Error("Converted image is empty");
            const bytes = new Uint8Array(arrayBuffer);
            console.log("PROFILE IMAGE SIZE:", arrayBuffer.byteLength);
            console.log("JPEG HEADER:", bytes[0], bytes[1], bytes[2]);
            if (bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255) throw new Error("Converted file is not a valid JPEG");
            const filePath = `users/${user.id}/profile_${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from("profile-images")
                .upload(filePath, arrayBuffer, {
                    contentType: "image/jpeg",
                    upsert: true
                });
            if (uploadError) throw uploadError;
            const { data } = supabase.storage
                .from("profile-images")
                .getPublicUrl(filePath);
            if (!data?.publicUrl) throw new Error("Unable to generate image URL");
            const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
            console.log("PROFILE IMAGE PUBLIC URL:", publicUrl);
            return publicUrl;
        } catch (error) {
            console.log("Image upload error", error);
            throw error;
        }
    };
    const pickProfileImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
            if (result.canceled) return;
            setUploading(true);
            setProfileImageError(false);
            const imageUrl = await uploadImage(result.assets[0].uri);
            const { error } = await supabase.from("profiles").update({ profile_image_url: imageUrl, profile_image: imageUrl }).eq("id", profile.id);
            if (error) throw error;
            setProfile((prev: any) => ({ ...prev, profile_image_url: imageUrl, profile_image: imageUrl }));
            Alert.alert("Success", "Profile image updated");
        } catch (error: any) {
            console.log("PROFILE IMAGE UPDATE ERROR:", error);
            Alert.alert("Upload Failed", error.message || "Unable to update profile image");
        } finally {
            setUploading(false);
        }
    };
    const switchProfile = async (profileId: string, type: "PRIMARY" | "CHILD") => {
        try {
            if (!profile) return;
            const { error: disableError } = await supabase.from("user_profiles").update({ is_active: false }).eq("parent_id", profile.id);
            if (disableError) throw disableError;
            const { data: existing, error: findError } = await supabase.from("user_profiles").select("id").eq("parent_id", profile.id).eq("profile_id", profileId).maybeSingle();
            if (findError) throw findError;
            if (existing) {
                const { error: updateError } = await supabase.from("user_profiles").update({ profile_type: type, is_active: true }).eq("id", existing.id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase.from("user_profiles").insert({ parent_id: profile.id, profile_id: profileId, profile_type: type, is_active: true });
                if (insertError) throw insertError;
            }
            setActiveProfile(profileId);
            Alert.alert("Success", "Profile switched successfully");
        } catch (error: any) {
            Alert.alert("Switch Failed", error.message);
        }
    };
    const handleLogout = async () => {
        try {
            await logout();
            router.replace("/auth/login");
        } catch (error: any) {
            Alert.alert("Logout Failed", error.message);
        }
    };
    if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading Profile...</Text></View>;
    const primaryProfile = { id: profile?.id, name: profile?.full_name || "Your Name", email: profile?.email || "your@email.com", image: profile?.profile_image_url || profile?.profile_image || null };
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.headerSection}>
                <Text style={styles.headerEyebrow}>PERSONAL ACCOUNT</Text>
                <Text style={styles.header}>PROFILE</Text>
                <Text style={styles.headerSubtitle}>Manage your personal and family profiles</Text>
            </View>
            <View style={styles.profileCard}>
                <View style={styles.avatarOuter}>
                    <View style={styles.imageWrapper}>
                        {primaryProfile.image && !profileImageError ? <Image key={primaryProfile.image} source={{ uri: primaryProfile.image }} style={styles.profileImage} resizeMode="cover" onError={(event) => { console.log("PROFILE IMAGE LOAD ERROR:", event.nativeEvent?.error); console.log("FAILED PROFILE IMAGE URL:", primaryProfile.image); setProfileImageError(true); }} /> : <Image source={require("../../assets/images/logo.png")} style={styles.fallbackImage} resizeMode="contain" />}
                    </View>
                    <View style={styles.statusDot} />
                </View>
                <Text style={styles.name}>{primaryProfile.name}</Text>
                <Text style={styles.type}>Primary Account</Text>
                <TouchableOpacity style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]} onPress={pickProfileImage} disabled={uploading} activeOpacity={0.82}>
                    {uploading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={styles.uploadText}>CHANGE PROFILE IMAGE</Text>}
                </TouchableOpacity>
            </View>
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEyebrow}>ACCOUNT</Text>
                    <Text style={styles.sectionTitle}>PRIMARY ACCOUNT</Text>
                </View>
                <View style={styles.profileItem}>
                    <View style={styles.accountInfo}>
                        <View style={styles.accountAvatar}><Text style={styles.accountAvatarText}>{primaryProfile.name?.charAt(0)?.toUpperCase() || "P"}</Text></View>
                        <View style={styles.accountTextContainer}><Text style={styles.itemTitle} numberOfLines={1}>{primaryProfile.name}</Text><Text style={styles.itemSub} numberOfLines={1}>{primaryProfile.email}</Text></View>
                    </View>
                    <TouchableOpacity style={[styles.switchButton, activeProfile === primaryProfile.id && styles.activeSwitchButton]} onPress={() => switchProfile(primaryProfile.id, "PRIMARY")} activeOpacity={0.8}>
                        <Text style={[styles.switchText, activeProfile === primaryProfile.id && styles.activeSwitchText]}>{activeProfile === primaryProfile.id ? "ACTIVE" : "SWITCH"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.sectionCard}>
                <View style={styles.headerRow}>
                    <View><Text style={styles.sectionEyebrow}>FAMILY</Text><Text style={styles.sectionTitle}>FAMILY PROFILES</Text></View>
                    <TouchableOpacity style={styles.addButton} onPress={() => router.push("/profile/add-child")} activeOpacity={0.8}><Text style={styles.addText}>+ ADD</Text></TouchableOpacity>
                </View>
                {children.length === 0 ? <View style={styles.emptyFamily}><Text style={styles.emptyText}>No child profiles added</Text></View> : children.map((child) => <View key={child.id} style={styles.profileItem}>
                    <View style={styles.childInfo}>
                        {child.profile_image_url || child.profile_image ? <Image source={{ uri: child.profile_image_url || child.profile_image }} style={styles.childImage} resizeMode="cover" /> : <View style={styles.childPlaceholder}><Text style={styles.childPlaceholderText}>{child.full_name?.charAt(0)?.toUpperCase() || "C"}</Text></View>}
                        <View style={styles.childTextContainer}><Text style={styles.itemTitle} numberOfLines={1}>{child.full_name}</Text><Text style={styles.itemSub} numberOfLines={1}>{child.age} Years{" • "}{child.gender}</Text></View>
                    </View>
                    <TouchableOpacity style={[styles.switchButton, activeProfile === child.id && styles.activeSwitchButton]} onPress={() => switchProfile(child.id, "CHILD")} activeOpacity={0.8}><Text style={[styles.switchText, activeProfile === child.id && styles.activeSwitchText]}>{activeProfile === child.id ? "ACTIVE" : "SWITCH"}</Text></TouchableOpacity>
                </View>)}
            </View>
            <TouchableOpacity style={styles.menuCard} onPress={() => router.push("/profile/history")} activeOpacity={0.82}>
                <View style={styles.menuLeft}><View style={styles.menuIcon}><Text style={styles.menuIconText}>H</Text></View><View><Text style={styles.menuText}>PROFILE HISTORY</Text><Text style={styles.menuSubText}>View your previous activity</Text></View></View><Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuCard} onPress={() => router.push("/profile/edit")} activeOpacity={0.82}>
                <View style={styles.menuLeft}><View style={styles.menuIcon}><Text style={styles.menuIconText}>E</Text></View><View><Text style={styles.menuText}>EDIT PROFILE</Text><Text style={styles.menuSubText}>Update your account details</Text></View></View><Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}><Text style={styles.logoutText}>LOGOUT</Text></TouchableOpacity>
            <Text style={styles.footerText}>KSHURAK • PERSONAL PROFILE</Text>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    contentContainer: { paddingHorizontal: 18, paddingBottom: 38 },
    loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center" },
    loadingText: { color: COLORS.primary, fontSize: 11, fontWeight: "900", letterSpacing: 0.6, marginTop: 12 },
    headerSection: { marginTop: 43, alignItems: "center" },
    headerEyebrow: { color: COLORS.textSecondary, fontSize: 7, fontWeight: "900", letterSpacing: 1.5 },
    header: { marginTop: 4, fontSize: 24, lineHeight: 30, fontWeight: "900", color: COLORS.primary, textAlign: "center", letterSpacing: 1 },
    headerSubtitle: { marginTop: 4, color: COLORS.textSecondary, fontSize: 10, lineHeight: 15, fontWeight: "600", textAlign: "center" },
    profileCard: { marginTop: 20, backgroundColor: COLORS.surface, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 20, paddingHorizontal: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 17, elevation: 4 },
    avatarOuter: { position: "relative", padding: 4, borderRadius: 58, borderWidth: 1, borderColor: COLORS.primary, backgroundColor: COLORS.surfaceDark },
    imageWrapper: { width: 96, height: 96, borderRadius: 48, overflow: "hidden", backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center" },
    profileImage: { width: "100%", height: "100%" },
    fallbackImage: { width: 58, height: 58, opacity: 0.9 },
    statusDot: { position: "absolute", width: 16, height: 16, borderRadius: 8, right: 3, bottom: 8, backgroundColor: COLORS.primary, borderWidth: 3, borderColor: COLORS.surface },
    name: { marginTop: 13, fontSize: 19, lineHeight: 24, fontWeight: "900", color: COLORS.text, textAlign: "center" },
    type: { marginTop: 3, fontSize: 9, color: COLORS.textSecondary, fontWeight: "700", letterSpacing: 0.4 },
    uploadButton: { marginTop: 12, minHeight: 35, borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 11, backgroundColor: COLORS.surfaceDark, minWidth: 150, alignItems: "center", justifyContent: "center" },
    uploadButtonDisabled: { opacity: 0.55 },
    uploadText: { color: COLORS.primary, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
    sectionCard: { marginTop: 13, backgroundColor: COLORS.surface, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.13, shadowRadius: 12, elevation: 3 },
    sectionHeader: { marginBottom: 1 },
    sectionEyebrow: { color: COLORS.textSecondary, fontSize: 6.5, fontWeight: "900", letterSpacing: 1.2, marginBottom: 3 },
    sectionTitle: { fontSize: 10, fontWeight: "900", color: COLORS.primary, letterSpacing: 0.8 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    addButton: { minHeight: 30, paddingHorizontal: 11, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.surfaceDark },
    addText: { color: COLORS.primary, fontSize: 8, fontWeight: "900", letterSpacing: 0.6 },
    profileItem: { marginTop: 11, minHeight: 65, backgroundColor: COLORS.surfaceDark, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
    accountInfo: { flex: 1, flexDirection: "row", alignItems: "center", marginRight: 8 },
    accountAvatar: { width: 39, height: 39, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, justifyContent: "center", alignItems: "center", marginRight: 10 },
    accountAvatarText: { color: COLORS.primary, fontSize: 14, fontWeight: "900" },
    accountTextContainer: { flex: 1 },
    childInfo: { flex: 1, flexDirection: "row", alignItems: "center", marginRight: 8 },
    childTextContainer: { flex: 1 },
    childImage: { width: 40, height: 40, borderRadius: 12, marginRight: 10, backgroundColor: COLORS.background },
    childPlaceholder: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, marginRight: 10, alignItems: "center", justifyContent: "center" },
    childPlaceholderText: { color: COLORS.primary, fontSize: 13, fontWeight: "900" },
    itemTitle: { fontSize: 11, lineHeight: 15, fontWeight: "900", color: COLORS.text },
    itemSub: { fontSize: 8, lineHeight: 12, marginTop: 3, color: COLORS.textSecondary, fontWeight: "600" },
    switchButton: { minWidth: 60, height: 30, borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: 9, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    activeSwitchButton: { backgroundColor: COLORS.primary },
    switchText: { fontSize: 7, fontWeight: "900", color: COLORS.primary, letterSpacing: 0.5 },
    activeSwitchText: { color: COLORS.black },
    emptyFamily: { marginTop: 11, paddingVertical: 18, borderRadius: 13, backgroundColor: COLORS.surfaceDark, borderWidth: 1, borderColor: COLORS.border },
    emptyText: { textAlign: "center", color: COLORS.textSecondary, fontSize: 9, fontWeight: "600" },
    menuCard: { marginTop: 11, minHeight: 62, backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.11, shadowRadius: 10, elevation: 2 },
    menuLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    menuIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: COLORS.surfaceDark, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", marginRight: 11 },
    menuIconText: { color: COLORS.primary, fontSize: 11, fontWeight: "900" },
    menuText: { fontSize: 10, lineHeight: 14, fontWeight: "900", color: COLORS.text, letterSpacing: 0.35 },
    menuSubText: { fontSize: 7.5, lineHeight: 11, fontWeight: "600", color: COLORS.textSecondary, marginTop: 2 },
    arrow: { fontSize: 22, lineHeight: 24, color: COLORS.primary, marginLeft: 8 },
    logoutButton: { marginTop: 16, minHeight: 45, marginBottom: 17, backgroundColor: COLORS.error, borderRadius: 13, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.16, shadowRadius: 10, elevation: 3 },
    logoutText: { fontSize: 9, fontWeight: "900", letterSpacing: 1, color: COLORS.text },
    footerText: { color: COLORS.textSecondary, fontSize: 6.5, fontWeight: "800", letterSpacing: 1.2, textAlign: "center" }
});