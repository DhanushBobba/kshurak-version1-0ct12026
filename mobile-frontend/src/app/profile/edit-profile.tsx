import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/lib/supabase";

export default function EditProfileDetails() {

    const router = useRouter();
    const params = useLocalSearchParams();

    const id = params.id as string;
    const type = params.type as string;

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [image, setImage] = useState<string | null>(null);


    useEffect(() => {
        loadProfile();
    }, []);


    const loadProfile = async () => {

        try {

            let data: any = null;

            if (type === "PRIMARY") {

                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) {
                    throw error;
                }

                data = profile;

            } else {

                const { data: child, error } = await supabase
                    .from("child_profiles")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) {
                    throw error;
                }

                data = child;

            }


            if (!data) {
                return;
            }


            setName(data.full_name || "");
            setEmail(data.email || "");
            setPhone(data.phone || "");
            setAge(
                data.age ?
                    String(data.age) :
                    ""
            );
            setGender(data.gender || "");

            setImage(
                data.profile_image_url ||
                data.profile_image ||
                null
            );


        } catch (error) {

            console.log(
                "LOAD PROFILE ERROR",
                error
            );

            Alert.alert(
                "Error",
                "Unable to load profile"
            );

        } finally {

            setLoading(false);

        }

    };


    const pickImage = async () => {

        try {

            const result =
                await ImagePicker.launchImageLibraryAsync({

                    mediaTypes:
                        ImagePicker.MediaTypeOptions.Images,

                    quality: 0.8

                });


            if (result.canceled) {
                return;
            }


            setImage(
                result.assets[0].uri
            );


        } catch (error: any) {

            Alert.alert(
                "Image Error",
                error.message
            );

        }

    }; const uploadImage = async (uri: string) => {

        try {

            const { data: userData } = await supabase.auth.getUser();

            const user = userData.user;

            if (!user) {
                throw new Error(
                    "User not found"
                );
            }


            const response = await fetch(uri);

            const blob = await response.blob();


            const path =
                `${type.toLowerCase()}/${id}/${Date.now()}.jpg`;


            const { error } = await supabase.storage
                .from("profile-images")
                .upload(
                    path,
                    blob,
                    {
                        contentType: "image/jpeg",
                        upsert: true
                    }
                );


            if (error) {
                throw error;
            }


            const publicUrl =
                supabase.storage
                    .from("profile-images")
                    .getPublicUrl(path)
                    .data
                    .publicUrl;


            return `${publicUrl}?t=${Date.now()}`;


        } catch (error) {

            console.log(
                "UPLOAD IMAGE ERROR",
                error
            );

            throw error;

        }

    };



    const saveProfile = async () => {

        try {

            setUploading(true);


            let imageUrl = image;


            if (
                image &&
                image.startsWith("file")
            ) {

                imageUrl =
                    await uploadImage(image);

            }



            if (type === "PRIMARY") {


                const { error } = await supabase
                    .from("profiles")
                    .update({

                        full_name: name,

                        email: email,

                        phone: phone,

                        age:
                            age ?
                                Number(age) :
                                null,

                        gender: gender,

                        profile_image: imageUrl,

                        profile_image_url: imageUrl,

                        updated_at:
                            new Date()

                    })
                    .eq(
                        "id",
                        id
                    );



                if (error) {
                    throw error;
                }



            } else {


                const { error } = await supabase
                    .from("child_profiles")
                    .update({

                        full_name: name,

                        email: email,

                        phone: phone,

                        age:
                            age ?
                                Number(age) :
                                null,

                        gender: gender,

                        profile_image: imageUrl,

                        profile_image_url: imageUrl,

                        updated_at:
                            new Date()

                    })
                    .eq(
                        "id",
                        id
                    );



                if (error) {
                    throw error;
                }


            }



            Alert.alert(
                "Success",
                "Profile updated successfully",
                [
                    {
                        text: "OK",
                        onPress: () => router.back()
                    }
                ]
            );



        } catch (error: any) {

            console.log(
                "SAVE PROFILE ERROR",
                error
            );


            Alert.alert(
                "Update Failed",
                error.message ||
                "Unable to update profile"
            );


        } finally {

            setUploading(false);

        }

    };


    if (loading) {

        return (

            <View style={styles.loading}>

                <Text style={styles.loadingText}>
                    Loading Profile...
                </Text>

            </View>

        );

    } return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.header}>
                EDIT PROFILE
            </Text>
            <Text style={styles.subtitle}>
                Update your personal information
            </Text>
            <View style={styles.card}>
                <View style={styles.imageBox}>
                    {
                        image ?
                            <Image
                                key={image}
                                source={{
                                    uri: image.includes("?")
                                        ?
                                        image
                                        :
                                        `${image}?t=${Date.now()}`
                                }}
                                style={styles.profileImage}
                            />
                            :
                            <Text style={styles.noImage}>
                                NO IMAGE
                            </Text>
                    }
                </View>
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickImage}
                    disabled={uploading}
                >
                    <Text style={styles.uploadText}>
                        {
                            uploading ?
                                "UPLOADING..."
                                :
                                "CHANGE IMAGE"
                        }
                    </Text>
                </TouchableOpacity>
                <Text style={styles.label}>
                    FULL NAME
                </Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter name"
                    placeholderTextColor={COLORS.textSecondary}
                />
                <Text style={styles.label}>
                    EMAIL
                </Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email"
                    placeholderTextColor={COLORS.textSecondary}
                />
                <Text style={styles.label}>
                    PHONE
                </Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="Enter phone"
                    placeholderTextColor={COLORS.textSecondary}
                />
                <Text style={styles.label}>
                    AGE
                </Text>
                <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    placeholder="Enter age"
                    placeholderTextColor={COLORS.textSecondary}
                />
                <Text style={styles.label}>
                    GENDER
                </Text>
                <TextInput
                    style={styles.input}
                    value={gender}
                    onChangeText={setGender}
                    placeholder="Enter gender"
                    placeholderTextColor={COLORS.textSecondary}
                />
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveProfile}
                    disabled={uploading}
                >
                    <Text style={styles.saveText}>
                        {
                            uploading ?
                                "SAVING..."
                                :
                                "SAVE PROFILE"
                        }
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
} const styles = StyleSheet.create({
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
        textAlign: "center",
        fontSize: 24,
        fontWeight: "900",
        color: COLORS.primary
    },
    subtitle: {
        marginTop: 6,
        textAlign: "center",
        fontSize: 12,
        color: COLORS.textSecondary
    },
    card: {
        marginTop: 18,
        backgroundColor: COLORS.surface,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16
    },
    imageBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.surfaceDark,
        alignSelf: "center",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center"
    },
    profileImage: {
        width: 100,
        height: 100,
        resizeMode: "cover"
    },
    noImage: {
        fontSize: 11,
        fontWeight: "900",
        color: COLORS.textSecondary
    },
    uploadButton: {
        marginTop: 12,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 18
    },
    uploadText: {
        fontSize: 11,
        fontWeight: "900",
        color: COLORS.primary
    },
    label: {
        marginTop: 14,
        marginBottom: 6,
        fontSize: 11,
        fontWeight: "900",
        color: COLORS.primary
    },
    input: {
        height: 45,
        borderRadius: 14,
        backgroundColor: COLORS.surfaceDark,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 14,
        fontSize: 13,
        color: COLORS.text
    },
    saveButton: {
        marginTop: 25,
        height: 45,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center"
    },
    saveText: {
        fontSize: 13,
        fontWeight: "900",
        color: COLORS.black
    }
});