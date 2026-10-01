import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image
} from "react-native";
import {
    useRouter
} from "expo-router";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/constants/colors";


export default function History() {

    const router = useRouter();

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);



    useEffect(() => {

        loadHistory();

    }, []);



    const loadHistory = async () => {

        try {


            const {
                data: userData
            }
                =
                await supabase.auth.getUser();



            const user =
                userData.user;



            if (!user) {

                return;

            }



            const {
                data: profile,
                error: profileError
            }
                =
                await supabase
                    .from("profiles")
                    .select("id")
                    .eq(
                        "auth_user_id",
                        user.id
                    )
                    .single();



            if (profileError)
                throw profileError;



            const {
                data: scans,
                error: scanError
            }
                =
                await supabase
                    .from("face_scans")
                    .select(`
id,
face_shape,
ai_accuracy,
front_image_url,
left_image_url,
right_image_url,
created_at
`)
                    .eq(
                        "profile_id",
                        profile.id
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );



            if (scanError)
                throw scanError;



            console.log(
                "HISTORY DATA",
                scans
            );



            setHistory(
                scans || []
            );



        }
        catch (error) {

            console.log(
                "HISTORY ERROR",
                error
            );


        }
        finally {

            setLoading(false);

        }

    };





    const openReport = (scanId: string) => {


        router.push({

            pathname: "/geometry",

            params: {

                scanId

            }

        });


    };





    if (loading) {

        return (

            <View style={styles.loading}>

                <Text style={styles.loadingText}>
                    Loading History...
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
                SCAN HISTORY
            </Text>


            <Text style={styles.subtitle}>
                Previous AI Face Analysis Reports
            </Text>



            {
                history.length === 0
                    ?
                    <View style={styles.emptyCard}>

                        <Text style={styles.emptyText}>
                            No Previous Scans Found
                        </Text>

                    </View>


                    :

                    history.map((item) => (
                        <View
                            key={item.id}
                            style={styles.card}
                        >


                            <Text style={styles.date}>
                                {
                                    new Date(
                                        item.created_at
                                    )
                                        .toLocaleDateString()
                                }
                            </Text>



                            <View style={styles.imageRow}>


                                {
                                    item.front_image_url
                                    &&

                                    <Image

                                        source={{
                                            uri: item.front_image_url
                                        }}

                                        style={styles.image}

                                    />

                                }



                                {
                                    item.left_image_url
                                    &&

                                    <Image

                                        source={{
                                            uri: item.left_image_url
                                        }}

                                        style={styles.image}

                                    />

                                }



                                {
                                    item.right_image_url
                                    &&

                                    <Image

                                        source={{
                                            uri: item.right_image_url
                                        }}

                                        style={styles.image}

                                    />

                                }



                            </View>




                            <View style={styles.info}>


                                <Text style={styles.label}>
                                    Face Shape
                                </Text>


                                <Text style={styles.value}>
                                    {
                                        item.face_shape || "--"
                                    }
                                </Text>



                            </View>




                            <View style={styles.info}>


                                <Text style={styles.label}>
                                    AI Accuracy
                                </Text>


                                <Text style={styles.value}>
                                    {
                                        item.ai_accuracy || "--"
                                    }%
                                </Text>


                            </View>




                            <TouchableOpacity

                                style={styles.button}

                                onPress={() => openReport(item.id)}

                            >


                                <Text style={styles.buttonText}>
                                    VIEW REPORT
                                </Text>


                            </TouchableOpacity>



                        </View>

                    ))

            }



        </ScrollView>

    );

}





const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 18
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
        marginTop: 45,
        textAlign: "center",
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: "900"
    },


    subtitle: {
        marginTop: 8,
        textAlign: "center",
        color: COLORS.textSecondary,
        fontSize: 13
    },


    card: {
        marginTop: 20,
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: COLORS.border
    },


    emptyCard: {
        marginTop: 30,
        backgroundColor: COLORS.surface,
        padding: 25,
        borderRadius: 20,
        alignItems: "center"
    },


    emptyText: {
        color: COLORS.textSecondary,
        fontWeight: "700"
    },


    date: {
        color: COLORS.primary,
        fontWeight: "900",
        marginBottom: 15
    },


    imageRow: {
        flexDirection: "row",
        justifyContent: "space-between"
    },


    image: {
        width: "31%",
        height: 110,
        borderRadius: 15
    },


    info: {
        marginTop: 15,
        backgroundColor: COLORS.surfaceDark,
        padding: 14,
        borderRadius: 14,
        flexDirection: "row",
        justifyContent: "space-between"
    },


    label: {
        color: COLORS.textSecondary,
        fontWeight: "700"
    },


    value: {
        color: COLORS.text,
        fontWeight: "900"
    },


    button: {
        marginTop: 18,
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 18,
        alignItems: "center"
    },


    buttonText: {
        color: COLORS.black,
        fontWeight: "900"
    }

});