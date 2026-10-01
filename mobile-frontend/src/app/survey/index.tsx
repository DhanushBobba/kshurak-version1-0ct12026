import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/colors";


type SurveyData = {
    hair_texture: string;
    density: string;
    growth_length: string;
    silhouette: string;
    maintenance: string;
    scalp_profile: string;
};


type OptionProps = {
    icon: string;
    title: string;
    field: keyof SurveyData;
    value: string;
};


export default function Survey() {

    const router = useRouter();

    const { user } = useAuth();


    const [step, setStep] = useState<number>(1);


    const [data, setData] = useState<SurveyData>({

        hair_texture: "",

        density: "",

        growth_length: "",

        silhouette: "",

        maintenance: "",

        scalp_profile: ""

    });



    const updateValue = (field: keyof SurveyData, value: string) => {

        setData(prev => ({

            ...prev,

            [field]: value

        }));

    };



    const next = () => {

        if (step < 5) {

            setStep(prev => prev + 1);

        }

        else {

            saveSurvey();

        }

    };



    const back = () => {

        if (step > 1) {

            setStep(prev => prev - 1);

        }

    };



    const getProfile = async () => {

        try {

            if (!user?.id) {

                return null;

            }


            const { data: profile } = await supabase

                .from("profiles")

                .select("id")

                .eq("auth_user_id", user.id)

                .maybeSingle();



            if (profile) {

                return profile;

            }



            const { data: emailProfile } = await supabase

                .from("profiles")

                .select("id")

                .eq("email", user.email)

                .maybeSingle();



            return emailProfile;



        } catch (error) {

            console.log(
                "Profile fetch error",
                error
            );

            return null;

        }

    };



    const saveSurveyHistory = async () => {

        try {


            const profile =
                await getProfile();


            if (!profile) {

                return;

            }



            await supabase

                .from("profile_history")

                .insert({

                    profile_id: profile.id,

                    activity_type: "SURVEY",

                    title: "AI Hair Survey Completed",

                    description:
                        `Hair Texture: ${data.hair_texture}, Density: ${data.density}, Length: ${data.growth_length}, Style: ${data.silhouette}, Maintenance: ${data.maintenance}, Scalp: ${data.scalp_profile}`,

                    activity_date: new Date()

                });


        } catch (error) {

            console.log(
                "Survey history error",
                error
            );

        }

    };



    const saveSurvey = async () => {

        try {


            if (!user?.id) {

                Alert.alert(
                    "Login Required",
                    "Please login again."
                );

                return;

            }



            const profile =
                await getProfile();



            if (!profile) {

                Alert.alert(
                    "Error",
                    "Profile not found"
                );

                return;

            }



            const { error } = await supabase

                .from("user_surveys")

                .insert({

                    user_id: user.id,

                    profile_id: profile.id,

                    hair_texture: data.hair_texture,

                    density: data.density,

                    growth_length: data.growth_length,

                    silhouette: data.silhouette,

                    maintenance: data.maintenance,

                    scalp_profile: data.scalp_profile

                });



            if (error) {

                Alert.alert(
                    "Save Failed",
                    error.message
                );

                return;

            }



            await saveSurveyHistory();



            router.replace("/scanner");



        } catch (error: any) {

            Alert.alert(
                "Survey Error",
                error.message ||
                "Unable to save survey"
            );

        }

    };



    const Option = ({
        icon,
        title,
        field,
        value
    }: OptionProps) => {


        const selected =
            data[field] === value;



        return (

            <TouchableOpacity

                style={[
                    styles.option,
                    selected && styles.optionSelected
                ]}

                onPress={() => updateValue(field, value)}

                activeOpacity={0.8}

            >


                <View

                    style={[
                        styles.iconBox,
                        selected && styles.iconBoxSelected
                    ]}

                >

                    <Text

                        style={[
                            styles.optionIcon,
                            selected && styles.optionIconSelected
                        ]}

                    >

                        {icon}

                    </Text>


                </View>



                <View style={styles.optionContent}>


                    <Text

                        style={[
                            styles.optionText,
                            selected && styles.optionTextSelected
                        ]}

                    >

                        {title}

                    </Text>


                    {selected &&

                        <Text style={styles.selectedText}>
                            SELECTED
                        </Text>

                    }


                </View>



                <View

                    style={[
                        styles.radio,
                        selected && styles.radioSelected
                    ]}

                >

                    {selected &&

                        <View style={styles.radioDot} />

                    }


                </View>



            </TouchableOpacity>

        );

    }; return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >

            <Text style={styles.progress}>
                {String(step).padStart(2, "0")}/05
            </Text>


            <Text style={styles.header}>
                AI HAIR PROFILE
            </Text>


            <View style={styles.stepBox}>
                <Text style={styles.stepText}>
                    STEP {step}
                </Text>
            </View>



            <View style={styles.progressLine}>

                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${step * 20}%`
                        }
                    ]}
                />

            </View>



            <View style={styles.card}>


                {step === 1 && (
                    <>

                        <Text style={styles.title}>
                            HAIR TEXTURE
                        </Text>

                        <Text style={styles.description}>
                            Tell us about your natural hair texture.
                        </Text>


                        <Option
                            icon="〰"
                            title="Straight"
                            field="hair_texture"
                            value="Straight"
                        />


                        <Option
                            icon="〰"
                            title="Wavy"
                            field="hair_texture"
                            value="Wavy"
                        />


                        <Option
                            icon="〰"
                            title="Curly"
                            field="hair_texture"
                            value="Curly"
                        />


                        <Option
                            icon="〰"
                            title="Coily"
                            field="hair_texture"
                            value="Coily"
                        />

                    </>

                )}



                {step === 2 && (
                    <>

                        <Text style={styles.title}>
                            HAIR DENSITY
                        </Text>

                        <Text style={styles.description}>
                            How thick is your hair volume?
                        </Text>


                        <Option
                            icon="●"
                            title="Low Density"
                            field="density"
                            value="Low"
                        />


                        <Option
                            icon="●"
                            title="Medium Density"
                            field="density"
                            value="Medium"
                        />


                        <Option
                            icon="●"
                            title="High Density"
                            field="density"
                            value="High"
                        />

                    </>

                )}



                {step === 3 && (
                    <>

                        <Text style={styles.title}>
                            HAIR LENGTH
                        </Text>


                        <Text style={styles.description}>
                            Select your current hair length.
                        </Text>


                        <Option
                            icon="✂"
                            title="Short"
                            field="growth_length"
                            value="Short"
                        />


                        <Option
                            icon="✂"
                            title="Medium"
                            field="growth_length"
                            value="Medium"
                        />


                        <Option
                            icon="✂"
                            title="Long"
                            field="growth_length"
                            value="Long"
                        />


                    </>

                )}



                {step === 4 && (
                    <>

                        <Text style={styles.title}>
                            STYLE PREFERENCE
                        </Text>


                        <Text style={styles.description}>
                            Choose your preferred hairstyle direction.
                        </Text>


                        <Option
                            icon="★"
                            title="Classic"
                            field="silhouette"
                            value="Classic"
                        />


                        <Option
                            icon="★"
                            title="Modern"
                            field="silhouette"
                            value="Modern"
                        />


                        <Option
                            icon="★"
                            title="Trendy"
                            field="silhouette"
                            value="Trendy"
                        />


                    </>

                )}



                {step === 5 && (
                    <>

                        <Text style={styles.title}>
                            SCALP & SENSITIVITY PROFILE
                        </Text>


                        <Text style={styles.description}>
                            Tell us about your scalp condition for better recommendations.
                        </Text>


                        <Option
                            icon="✓"
                            title="Resilient"
                            field="scalp_profile"
                            value="Resilient"
                        />


                        <Option
                            icon="⚠"
                            title="Sensitive"
                            field="scalp_profile"
                            value="Sensitive"
                        />


                        <Option
                            icon="◉"
                            title="Oily"
                            field="scalp_profile"
                            value="Oily"
                        />


                    </>

                )}


            </View>



            <View style={styles.navigation}>


                {step > 1 && (

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={back}
                    >

                        <Text style={styles.backText}>
                            BACK
                        </Text>

                    </TouchableOpacity>

                )}



                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={next}
                >

                    <Text style={styles.nextText}>
                        {
                            step === 5
                                ?
                                "COMPLETE"
                                :
                                "NEXT"
                        }
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
        paddingHorizontal: 18
    },

    progress: {
        marginTop: 38,
        color: COLORS.primary,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "900",
        letterSpacing: 1.4
    },

    header: {
        color: COLORS.text,
        fontSize: 23,
        lineHeight: 29,
        fontWeight: "900",
        marginTop: 5,
        letterSpacing: 0.5
    },

    stepBox: {
        position: "absolute",
        right: 18,
        top: 39,

        minWidth: 66,
        height: 30,

        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 15,

        backgroundColor: COLORS.surface,

        paddingHorizontal: 12,

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.15,
        shadowRadius: 7,
        elevation: 2
    },

    stepText: {
        color: COLORS.primary,
        fontWeight: "900",
        fontSize: 9,
        letterSpacing: 0.9
    },

    progressLine: {
        height: 4,
        backgroundColor: COLORS.surfaceDark,
        borderRadius: 10,
        marginTop: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border
    },

    progressFill: {
        height: "100%",
        backgroundColor: COLORS.primary,
        borderRadius: 10
    },

    card: {
        backgroundColor: COLORS.surface,

        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.border,

        paddingHorizontal: 15,
        paddingTop: 17,
        paddingBottom: 9,

        marginTop: 19,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.18,
        shadowRadius: 17,
        elevation: 4
    },

    title: {
        color: COLORS.text,
        fontSize: 19,
        lineHeight: 25,
        fontWeight: "900",
        letterSpacing: 0.35
    },

    description: {
        color: COLORS.textSecondary,
        fontSize: 10,
        lineHeight: 16,
        fontWeight: "600",
        marginTop: 5,
        marginBottom: 15
    },

    option: {
        minHeight: 59,

        backgroundColor: COLORS.surfaceDark,

        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 11,
        paddingVertical: 9,

        marginBottom: 9,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 1
    },

    optionSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,

        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.16,
        shadowRadius: 9,
        elevation: 3
    },

    iconBox: {
        width: 39,
        height: 39,

        borderRadius: 11,

        backgroundColor: COLORS.background,

        borderWidth: 1,
        borderColor: COLORS.border,

        justifyContent: "center",
        alignItems: "center"
    },

    iconBoxSelected: {
        backgroundColor: "rgba(0,0,0,0.12)",
        borderColor: "rgba(0,0,0,0.18)"
    },

    optionIcon: {
        fontSize: 17,
        color: COLORS.primary,
        fontWeight: "700"
    },

    optionIconSelected: {
        color: COLORS.black
    },

    optionContent: {
        flex: 1,
        marginLeft: 12
    },

    optionText: {
        color: COLORS.text,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "900",
        letterSpacing: 0.15
    },

    optionTextSelected: {
        color: COLORS.black
    },

    selectedText: {
        color: COLORS.black,
        fontSize: 6.5,
        lineHeight: 10,
        fontWeight: "900",
        letterSpacing: 1,
        marginTop: 2,
        opacity: 0.72
    },

    radio: {
        width: 19,
        height: 19,

        borderRadius: 10,

        borderWidth: 1.5,
        borderColor: COLORS.textSecondary,

        justifyContent: "center",
        alignItems: "center",

        marginLeft: 8
    },

    radioSelected: {
        borderColor: COLORS.black
    },

    radioDot: {
        width: 7,
        height: 7,

        borderRadius: 4,

        backgroundColor: COLORS.black
    },

    navigation: {
        flexDirection: "row",
        marginTop: 14,
        gap: 9,
        marginBottom: 32
    },

    backButton: {
        flex: 1,
        height: 46,

        borderRadius: 13,

        borderWidth: 1,
        borderColor: COLORS.primary,

        backgroundColor: COLORS.surface,

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 2
    },

    backText: {
        color: COLORS.primary,
        fontWeight: "900",
        fontSize: 9,
        letterSpacing: 1
    },

    nextButton: {
        flex: 1,
        height: 46,

        borderRadius: 13,

        backgroundColor: COLORS.primary,

        justifyContent: "center",
        alignItems: "center",

        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4
    },

    nextText: {
        color: COLORS.black,
        fontWeight: "900",
        fontSize: 9,
        letterSpacing: 1
    }

});