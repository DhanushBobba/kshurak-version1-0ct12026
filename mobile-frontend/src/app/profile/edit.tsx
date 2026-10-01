import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/lib/supabase";

export default function EditProfile() {

    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<any[]>([]);


    useEffect(() => {
        loadProfiles();
    }, []);


    const loadProfiles = async () => {

        try {

            const { data: userData } = await supabase.auth.getUser();

            const user = userData.user;

            if (!user) {
                return;
            }


            // Primary profile

            const { data: primary, error: primaryError } = await supabase
                .from("profiles")
                .select("*")
                .eq("auth_user_id", user.id)
                .single();


            if (primaryError) {
                console.log(primaryError);
            }


            // Child profiles

            const { data: children, error: childError } = await supabase
                .from("child_profiles")
                .select("*")
                .eq(
                    "parent_profile_id",
                    primary.id
                );


            if (childError) {
                console.log(childError);
            }



            const primaryData = {
                id: primary.id,
                type: "PRIMARY",
                name: primary.full_name,
                email: primary.email,
                age: primary.age,
                gender: primary.gender,
                image:
                    primary.profile_image_url ||
                    primary.profile_image ||
                    null
            };


            const childData = (children || []).map((child: any) => ({

                id: child.id,
                type: "CHILD",
                name: child.full_name,
                email: child.email,
                age: child.age,
                gender: child.gender,
                image:
                    child.profile_image_url ||
                    child.profile_image ||
                    null

            }));


            setProfiles([
                primaryData,
                ...childData
            ]);


        } catch (error) {

            console.log(
                "Load Profiles Error",
                error
            );

            Alert.alert(
                "Error",
                "Unable to load profiles"
            );

        }
        finally {

            setLoading(false);

        }

    };



    const openEdit = (item: any) => {

        router.push({

            pathname: "/profile/edit-profile",

            params: {
                id: item.id,
                type: item.type
            }

        });

    };



    if (loading) {

        return (

            <View style={styles.loading}>

                <Text style={styles.loadingText}>
                    Loading Profiles...
                </Text>

            </View>

        );

    }



    return (

        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >


            <Text style={styles.header}>
                EDIT PROFILE
            </Text>


            <Text style={styles.subtitle}>
                Select profile to edit
            </Text>



            <View style={styles.card}>


                {
                    profiles.map((item, index) => (


                        <TouchableOpacity
                            key={item.id}
                            style={styles.profileCard}
                            onPress={() => openEdit(item)}
                        >


                            <View style={styles.avatar}>

                                {
                                    item.image ?

                                        <Image
                                            source={{
                                                uri: item.image
                                            }}
                                            style={styles.avatarImage}
                                        />

                                        :

                                        <Text style={styles.avatarText}>
                                            {item.name?.charAt(0)}
                                        </Text>

                                }

                            </View>



                            <View style={styles.details}>


                                <Text style={styles.name}>
                                    {item.name}
                                </Text>


                                <Text style={styles.info}>
                                    {
                                        item.type === "PRIMARY"
                                            ?
                                            "Primary Account"
                                            :
                                            `${item.age || "--"} Years • ${item.gender || ""}`
                                    }
                                </Text>


                            </View>



                            <View style={styles.editButton}>

                                <Text style={styles.editText}>
                                    EDIT
                                </Text>

                            </View>


                        </TouchableOpacity>


                    ))

                }



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
        textAlign: "center",
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: "900"
    },


    subtitle: {
        marginTop: 6,
        textAlign: "center",
        color: COLORS.textSecondary,
        fontSize: 12
    },


    card: {
        marginTop: 18,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12
    },


    profileCard: {
        backgroundColor: COLORS.surfaceDark,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center"
    },


    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
    },


    avatarImage: {
        width: 48,
        height: 48,
        resizeMode: "cover"
    },


    avatarText: {
        color: COLORS.primary,
        fontWeight: "900",
        fontSize: 18
    },


    details: {
        flex: 1,
        marginLeft: 12
    },


    name: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "900"
    },


    info: {
        marginTop: 4,
        color: COLORS.textSecondary,
        fontSize: 12
    },


    editButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 14
    },


    editText: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: "900"
    }

});