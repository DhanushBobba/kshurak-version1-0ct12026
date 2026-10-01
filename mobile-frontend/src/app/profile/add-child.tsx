import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/lib/supabase";

export default function AddChild() {
    const router = useRouter();
    const [parentId, setParentId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        getParentProfile();
    }, []);

    const getParentProfile = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;
            if (!user) return;
            const { data, error } = await supabase
                .from("profiles")
                .select("id")
                .eq("auth_user_id", user.id)
                .single();
            if (error) {
                console.log("Parent profile error", error);
                return;
            }
            setParentId(data.id);
        } catch (error) {
            console.log("Parent fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    const uploadChildImage = async (uri: string) => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;
            if (!user) {
                throw new Error("User not found");
            }
            const response = await fetch(uri);
            const arrayBuffer = await response.arrayBuffer();
            const filePath = `children/${user.id}/child_${Date.now()}.jpg`;
            const { error } = await supabase.storage
                .from("profile-images")
                .upload(filePath, arrayBuffer, {
                    contentType: "image/jpeg",
                    upsert: true
                });
            if (error) {
                throw error;
            }
            const { data } = supabase.storage
                .from("profile-images")
                .getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.log("Child image upload error", error);
            throw error;
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8
            });
            if (result.canceled) {
                return;
            }
            setImage(result.assets[0].uri);
        } catch (error: any) {
            Alert.alert("Image Error", error.message);
        }
    };

    const addChild = async () => {
        try {
            if (!parentId) {
                Alert.alert("Error", "Parent profile not found");
                return;
            }
            if (!name || !age || !gender) {
                Alert.alert("Required", "Please enter child basic details");
                return;
            }
            setUploading(true);
            let imageUrl = null;
            if (image) {
                imageUrl = await uploadChildImage(image);
            }
            const { data: childData, error } = await supabase
                .from("child_profiles")
                .insert({
                    parent_profile_id: parentId,
                    full_name: name,
                    email: email,
                    phone: phone,
                    age: Number(age),
                    gender: gender,
                    profile_image_url: imageUrl,
                    profile_image: imageUrl
                })
                .select()
                .single();
            if (error) {
                throw error;
            }
            if (childData) {
                await supabase
                    .from("user_profiles")
                    .insert({
                        parent_id: parentId,
                        profile_id: childData.id,
                        profile_type: "CHILD",
                        is_active: false
                    });
            }
            Alert.alert("Success", "Child profile added successfully");
            router.back();
        } catch (error: any) {
            Alert.alert("Failed", error.message);
        } finally {
            setUploading(false);
        }
    }; if (loading) {
        return (
            <View style={styles.loading}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.header}>ADD CHILD PROFILE</Text>
            <View style={styles.card}>
                <Text style={styles.subtitle}>
                    Create child profile under your account
                </Text>
                <View style={styles.imageBox}>
                    {image ?
                        <Image
                            source={{ uri: image }}
                            style={styles.childPreview}
                        />
                        :
                        <View style={styles.placeholder}>
                            <Text style={styles.placeholderText}>
                                NO IMAGE
                            </Text>
                        </View>
                    }
                </View>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Text style={styles.uploadText}>
                        UPLOAD IMAGE
                    </Text>
                </TouchableOpacity>
                <Text style={styles.label}>
                    FULL NAME
                </Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Child name"
                    placeholderTextColor={COLORS.textMuted}
                />
                <Text style={styles.label}>
                    EMAIL (OPTIONAL)
                </Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor={COLORS.textMuted}
                />
                <Text style={styles.label}>
                    PHONE (OPTIONAL)
                </Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="Phone number"
                    placeholderTextColor={COLORS.textMuted}
                />
                <Text style={styles.label}>
                    AGE
                </Text>
                <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    placeholder="Age"
                    placeholderTextColor={COLORS.textMuted}
                />
                <Text style={styles.label}>
                    GENDER
                </Text>
                <TextInput
                    style={styles.input}
                    value={gender}
                    onChangeText={setGender}
                    placeholder="Male / Female"
                    placeholderTextColor={COLORS.textMuted}
                />
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={addChild}
                    disabled={uploading}
                >
                    <Text style={styles.saveText}>
                        {uploading ? "ADDING..." : "ADD CHILD PROFILE"}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 16
    },
    loading: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center"
    },
    loadingText: {
        color: COLORS.primary,
        fontWeight: "900"
    },
    header: {
        marginTop: 40,
        fontSize: 24,
        fontWeight: "900",
        color: COLORS.primary,
        textAlign: "center"
    },
    card: {
        marginTop: 18,
        backgroundColor: COLORS.surface,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: "center",
        marginBottom: 12
    },
    imageBox: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.surfaceDark,
        alignSelf: "center",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center"
    },
    childPreview: {
        width: 90,
        height: 90,
        resizeMode: "cover"
    },
    placeholder: {
        justifyContent: "center",
        alignItems: "center"
    },
    placeholderText: {
        color: COLORS.textMuted,
        fontSize: 11,
        fontWeight: "800"
    },
    uploadButton: {
        marginTop: 12,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingHorizontal: 18,
        paddingVertical: 7,
        borderRadius: 18
    },
    uploadText: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: "900"
    },
    label: {
        marginTop: 12,
        marginBottom: 5,
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: "900"
    },
    input: {
        height: 48,
        backgroundColor: COLORS.surfaceDark,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 14,
        color: COLORS.text,
        fontSize: 13
    },
    saveButton: {
        marginTop: 22,
        backgroundColor: COLORS.primary,
        paddingVertical: 13,
        borderRadius: 16,
        alignItems: "center"
    },
    saveText: {
        color: COLORS.black,
        fontWeight: "900",
        fontSize: 13
    }
});