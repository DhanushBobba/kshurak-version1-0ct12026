import React, { useEffect, useState } from "react";
import SurveyPopup from "@/components/SurveyPopup";
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
    Sparkles,
    Calendar,
    Camera,
    Gift,
    Crown,
    Heart,
    ChevronRight,
    Home as HomeIcon,
    Compass,
    Bookmark,
    MapPin,
    User as UserIcon,
    ClipboardList,
    AlignCenter,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("Home");
    const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
    const [savedStyles, setSavedStyles] = useState<{ [key: number]: boolean }>({});
    const [showSurvey, setShowSurvey] = useState(false);

    const rawName = user
        ? user?.user_metadata?.full_name?.split(" ")[0] ||
        user?.user_metadata?.username ||
        user?.email?.split("@")[0] ||
        "User"
        : "Guest";
    const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const checkLogin = () => {
        if (!user) {
            Alert.alert("ACCESS DENIED", "Please login to access this feature", [
                { text: "CANCEL", style: "cancel" },
                { text: "LOGIN", onPress: () => router.push("/auth/login") },
            ]);
            return false;
        }
        return true;
    };

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        const checkSurvey = async () => {
            if (!user) {
                return;
            }

            const surveyCompleted =
                await AsyncStorage.getItem("surveyCompleted");

            if (!surveyCompleted) {
                timer = setTimeout(() => {
                    setShowSurvey(true);
                }, 800);
            }
        };

        checkSurvey();

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [user]);

    const navigateService = (route: string) => {
        if (checkLogin()) router.push(route as any);
    };

    const toggleSave = (index: number) => {
        setSavedStyles((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    const trendingThumbnails = [
        require("../../assets/images/style1.png"),
        require("../../assets/images/style2.png"),
        require("../../assets/images/style3.png"),
        require("../../assets/images/style4.png"),
        require("../../assets/images/style5.png"),
        require("../../assets/images/style6.png"),
    ];

    const recommendedList = [
        { image: require("../../assets/images/style1.png"), title: "Textured Crop" },
        { image: require("../../assets/images/style2.png"), title: "Curly Taper" },
        { image: require("../../assets/images/style3.png"), title: "Classic Waves" },
        { image: require("../../assets/images/style4.png"), title: "Buzz Cut" },
        { image: require("../../assets/images/style5.png"), title: "Modern Pompadour" },
    ];

    const quickActions = [
        { title: "5 Step Survey", subtitle: "Complete your hair profile", route: "/survey" },
        { title: "Face Scanner", subtitle: "Analyze your face", route: "/scanner" },
        { title: "AI Try-On", subtitle: "See it on you", route: "/tryon" },
        { title: "Book Appointment", subtitle: "Find a barber", route: "/booking" },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greetingText}>
                            {getGreeting()},{" "}
                            <Text style={styles.userNameText}>{displayName}</Text>
                        </Text>
                        <Text style={styles.subtitleText}>Find your perfect hairstyle with AI</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.profileButtonContainer}
                        onPress={() => (user ? router.push("/profile") : router.push("/auth/login"))}
                        activeOpacity={0.8}
                    >
                        <View style={styles.profileAvatarBorder}>
                            {user?.user_metadata?.avatar_url ? (
                                <Image
                                    source={{ uri: user.user_metadata.avatar_url }}
                                    style={styles.profileAvatarImg}
                                />
                            ) : (
                                <View style={styles.blueUserAvatar}>
                                    <UserIcon size={24} color="#F59E0B" fill="#F59E0B" />
                                </View>
                            )}
                        </View>
                        <View style={styles.crownBadge}>
                            <Crown size={9} color="#F59E0B" fill="#F59E0B" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Hero Card */}
                <View style={styles.heroCard}>
                    {/* Top Content Row */}
                    <View style={styles.heroTopSection}>
                        {/* Text and Action Buttons Column */}
                        <View style={styles.heroContent}>
                            <View style={styles.trendingLabel}>
                                <Text style={styles.trendingEmoji}>🔥</Text>
                                <Text style={styles.trendingText}>TRENDING</Text>
                            </View>

                            <Text
                                style={styles.heroTitle}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                Perfect hairstyles
                            </Text>

                            <Text style={styles.heroDescription}>
                                Trending styles for you.{"\n"}Find your next signature look..
                            </Text>

                            <View style={styles.heroButtonRow}>
                                <TouchableOpacity
                                    style={styles.heroPrimaryBtn}
                                    onPress={() => navigateService("/scanner")}
                                    activeOpacity={0.85}
                                >
                                    <Sparkles size={14} color="#000000" fill="#000000" />
                                    <Text style={styles.heroPrimaryBtnText}>Face Scan</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.heroOutlineBtn}
                                    onPress={() => navigateService("/services/book")}
                                    activeOpacity={0.85}
                                >
                                    <Calendar size={14} color="#F59E0B" strokeWidth={2.2} />
                                    <Text style={styles.heroOutlineBtnText}>Book Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Hero Image Container on the Right */}
                        <View style={styles.heroImageContainer}>
                            <Image
                                source={
                                    trendingThumbnails[selectedStyleIndex] ||
                                    require("../../assets/images/hero.png")
                                }
                                style={styles.heroImage}
                            />
                            <LinearGradient
                                colors={["#17181A", "rgba(23, 24, 26, 0.4)", "transparent"]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 0.45, y: 0.5 }}
                                style={StyleSheet.absoluteFill}
                                pointerEvents="none"
                            />
                            <LinearGradient
                                colors={["transparent", "#17181A"]}
                                start={{ x: 0.5, y: 0.7 }}
                                end={{ x: 0.5, y: 1 }}
                                style={StyleSheet.absoluteFill}
                                pointerEvents="none"
                            />
                        </View>
                    </View>

                    {/* Thumbnail Selector */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.thumbnailScroll}
                    >
                        {trendingThumbnails.map((img, idx) => {
                            const isSelected = selectedStyleIndex === idx;
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.thumbnailWrapper}
                                    onPress={() => setSelectedStyleIndex(idx)}
                                    activeOpacity={0.85}
                                >
                                    <View
                                        style={[
                                            styles.thumbnailItem,
                                            isSelected && styles.activeThumbnail,
                                        ]}
                                    >
                                        <Image source={img} style={styles.thumbnailImage} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Hero Dots Pagination */}
                    <View style={styles.heroPagination}>
                        {trendingThumbnails.slice(0, 5).map((_, idx) =>
                            idx === selectedStyleIndex % 5 ? (
                                <View key={idx} style={styles.heroPaginationActive} />
                            ) : (
                                <View key={idx} style={styles.heroPaginationDot} />
                            )
                        )}
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <TouchableOpacity
                        style={styles.viewAllRow}
                        onPress={() => navigateService("/explore")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.viewAllText}>View all</Text>
                        <ChevronRight size={15} color="#F59E0B" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>

                <View style={styles.quickActionsCard}>
                    {quickActions.map((item, index) => {
                        const icon =
                            index === 0 ? (
                                <ClipboardList size={26} color="#F59E0B" strokeWidth={2} />
                            ) : index === 1 ? (
                                <Camera size={26} color="#F59E0B" strokeWidth={2} />
                            ) : index === 2 ? (
                                <Sparkles size={26} color="#F59E0B" strokeWidth={2} />
                            ) : (
                                <Calendar size={26} color="#F59E0B" strokeWidth={2} />
                            );
                        return (
                            <React.Fragment key={item.title}>
                                <TouchableOpacity
                                    style={styles.actionCard}
                                    onPress={() => navigateService(item.route)}
                                    activeOpacity={0.75}
                                >
                                    <View style={styles.actionIcon}>{icon}</View>
                                    <Text style={styles.quickActionTitle} numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.quickActionSub} numberOfLines={2}>
                                        {item.subtitle}
                                    </Text>
                                </TouchableOpacity>
                                {index < quickActions.length - 1 && (
                                    <View style={styles.quickActionDivider} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </View>

                {/* Recommended for You */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recommended for You</Text>
                    <TouchableOpacity
                        style={styles.viewAllRow}
                        onPress={() => navigateService("/services/hairstyle")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.viewAllText}>View all</Text>
                        <ChevronRight size={15} color="#F59E0B" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recommendedScroll}
                >
                    {recommendedList.map((item, index) => {
                        const isSaved = !!savedStyles[index];
                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.recommendCard}
                                onPress={() => navigateService("/services/hairstyle")}
                                activeOpacity={0.85}
                            >
                                <View style={styles.recommendImageWrapper}>
                                    <Image source={item.image} style={styles.recommendImage} />
                                    <TouchableOpacity
                                        style={styles.favoriteButton}
                                        onPress={() => toggleSave(index)}
                                        activeOpacity={0.7}
                                    >
                                        <Heart
                                            size={17}
                                            color={isSaved ? "#F59E0B" : "#FFFFFF"}
                                            fill={isSaved ? "#F59E0B" : "none"}
                                            strokeWidth={2}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.recommendInfo}>
                                    <Text style={styles.recommendTitle} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.bottomTabItem}
                    onPress={() => setActiveTab("Home")}
                    activeOpacity={0.8}
                >
                    {activeTab === "Home" && <View style={styles.activeTabIndicator} />}
                    <HomeIcon
                        size={23}
                        color={activeTab === "Home" ? "#F59E0B" : "#71717A"}
                        strokeWidth={2.2}
                    />
                    <Text
                        style={[
                            styles.bottomTabText,
                            activeTab === "Home" && styles.bottomTabTextActive,
                        ]}
                    >
                        Home
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.bottomTabItem}
                    onPress={() => navigateService("/explore")}
                    activeOpacity={0.8}
                >
                    <Compass size={23} color="#71717A" strokeWidth={2.2} />
                    <Text style={styles.bottomTabText}>Explore</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.centerScanWrapper}
                    onPress={() => navigateService("/scanner")}
                    activeOpacity={0.9}
                >
                    <View style={styles.centerScanOuterRing}>
                        <View style={styles.centerScanButton}>
                            <Camera size={26} color="#000000" strokeWidth={2.3} />
                        </View>
                    </View>
                    <Text style={styles.scanLabel}>Scan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.bottomTabItem}
                    onPress={() => navigateService("/services/saved")}
                    activeOpacity={0.8}
                >
                    <Bookmark size={23} color="#71717A" strokeWidth={2.2} />
                    <Text style={styles.bottomTabText}>Saved</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.bottomTabItem}
                    onPress={() => navigateService("/services/barbers")}
                    activeOpacity={0.8}
                >
                    <MapPin size={23} color="#71717A" strokeWidth={2.2} />
                    <Text style={styles.bottomTabText}>Barbers</Text>
                </TouchableOpacity>
            </View>

            <SurveyPopup
                visible={showSurvey}
                onClose={async () => {
                    await AsyncStorage.setItem(
                        "surveyCompleted",
                        "true"
                    );
                    setShowSurvey(false);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#070708" },
    scrollContent: { paddingTop: Platform.OS === "ios" ? 54 : 40, paddingBottom: 122 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, marginBottom: 18 },
    headerLeft: { flex: 1, paddingRight: 14 },
    greetingText: { fontSize: 21, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.35 },
    userNameText: { color: "#F59E0B", fontWeight: "900" },
    subtitleText: { color: "#8D8D96", fontSize: 11.5, fontWeight: "500", marginTop: 5 },
    profileButtonContainer: { width: 50, height: 50, position: "relative" },
    profileAvatarBorder: { width: 50, height: 50, borderRadius: 17, borderWidth: 1.5, borderColor: "#F59E0B", overflow: "hidden", backgroundColor: "#141416", justifyContent: "center", alignItems: "center", shadowColor: "#F59E0B", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 9, elevation: 4 },
    profileAvatarImg: { width: "100%", height: "100%", resizeMode: "cover" },
    blueUserAvatar: { width: "100%", height: "100%", backgroundColor: "#141416", justifyContent: "center", alignItems: "center" },
    crownBadge: { position: "absolute", right: -3, bottom: -3, width: 19, height: 19, borderRadius: 7, backgroundColor: "#0B0B0C", borderWidth: 1.5, borderColor: "#F59E0B", justifyContent: "center", alignItems: "center" },
    heroCard: { marginHorizontal: 16, borderRadius: 24, backgroundColor: "#141416", borderWidth: 1, borderColor: "#28282D", overflow: "hidden", paddingTop: 17, paddingBottom: 14, shadowColor: "#000000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.28, shadowRadius: 18, elevation: 7 },
    heroTopSection: { position: "relative", minHeight: 194, paddingLeft: 17, paddingRight: 0, marginBottom: 10, justifyContent: "center" },
    heroContent: { width: "58%", zIndex: 2 },
    trendingLabel: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8, backgroundColor: "rgba(245,158,11,0.09)", borderWidth: 1, borderColor: "rgba(245,158,11,0.22)", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
    trendingEmoji: { fontSize: 10 },
    trendingText: { color: "#F59E0B", fontSize: 8, fontWeight: "900", letterSpacing: 1.25 },
    heroTitle: { color: "#FFFFFF", fontSize: 21, fontWeight: "900", lineHeight: 26, letterSpacing: -0.35 },
    heroDescription: { color: "#92929B", fontSize: 10.5, lineHeight: 16, marginTop: 7, maxWidth: 165, fontWeight: "500" },
    heroButtonRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 15, zIndex: 3 },
    heroPrimaryBtn: { height: 37, paddingHorizontal: 11, borderRadius: 10, backgroundColor: "#F59E0B", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, shadowColor: "#F59E0B", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 4 },
    heroPrimaryBtnText: { color: "#000000", fontSize: 10, fontWeight: "900" },
    heroOutlineBtn: { height: 37, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: "#F59E0B", backgroundColor: "rgba(15,15,16,0.82)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
    heroOutlineBtnText: { color: "#F59E0B", fontSize: 10, fontWeight: "800" },
    heroImageContainer: { position: "absolute", right: 0, top: -17, bottom: -10, width: "49%", backgroundColor: "transparent", overflow: "hidden", zIndex: 1 },
    heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
    thumbnailScroll: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 17, marginTop: 3, marginBottom: 10 },
    thumbnailWrapper: { alignItems: "center" },
    thumbnailItem: { width: 52, height: 56, borderRadius: 12, overflow: "hidden", backgroundColor: "#202023", borderWidth: 1.5, borderColor: "#29292E" },
    activeThumbnail: { borderColor: "#F59E0B", shadowColor: "#F59E0B", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.24, shadowRadius: 6, elevation: 3 },
    thumbnailImage: { width: "100%", height: "100%", resizeMode: "cover" },
    heroPagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5, marginTop: 3 },
    heroPaginationActive: { width: 18, height: 3, borderRadius: 2, backgroundColor: "#F59E0B" },
    heroPaginationDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#414147" },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, marginTop: 24, marginBottom: 11 },
    sectionTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", letterSpacing: -0.2 },
    viewAllRow: { flexDirection: "row", alignItems: "center", gap: 1, backgroundColor: "rgba(245,158,11,0.07)", borderWidth: 1, borderColor: "rgba(245,158,11,0.16)", paddingLeft: 9, paddingRight: 5, paddingVertical: 5, borderRadius: 9 },
    viewAllText: { color: "#F59E0B", fontSize: 9, fontWeight: "800" },
    quickActionsCard: { marginHorizontal: 16, minHeight: 105, backgroundColor: "#141416", borderRadius: 20, borderWidth: 1, borderColor: "#27272C", paddingVertical: 13, paddingHorizontal: 5, flexDirection: "row", alignItems: "stretch", shadowColor: "#000000", shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 4 },
    actionCard: { flex: 1, alignItems: "center", justifyContent: "flex-start", paddingHorizontal: 3 },
    actionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 8, backgroundColor: "#1C1C1F", borderWidth: 1, borderColor: "#2B2B30" },
    quickActionDivider: { width: 1, backgroundColor: "#29292E", marginVertical: 9 },
    quickActionTitle: { color: "#FFFFFF", fontSize: 9, fontWeight: "800", textAlign: "center", lineHeight: 12, minHeight: 24 },
    quickActionSub: { color: "#7F7F88", fontSize: 7, lineHeight: 10, marginTop: 3, textAlign: "center", fontWeight: "500" },
    recommendedScroll: { paddingLeft: 18, paddingRight: 7 },
    recommendCard: { width: 154, backgroundColor: "#141416", borderRadius: 17, borderWidth: 1, borderColor: "#29292E", marginRight: 11, overflow: "hidden", shadowColor: "#000000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 11, elevation: 3 },
    recommendImageWrapper: { width: "100%", height: 158, position: "relative", backgroundColor: "#1C1C1F" },
    recommendImage: { width: "100%", height: "100%", resizeMode: "cover" },
    favoriteButton: { position: "absolute", top: 8, right: 8, width: 31, height: 31, borderRadius: 10, backgroundColor: "rgba(8,8,9,0.78)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
    recommendInfo: { paddingVertical: 11, paddingHorizontal: 11, backgroundColor: "#141416", borderTopWidth: 1, borderTopColor: "#242428" },
    recommendTitle: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
    bottomBar: { position: "absolute", left: 10, right: 10, bottom: Platform.OS === "ios" ? 8 : 6, height: 72, backgroundColor: "rgba(14,14,15,0.98)", borderWidth: 1, borderColor: "#252529", borderRadius: 22, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingBottom: Platform.OS === "ios" ? 7 : 2, shadowColor: "#000000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.38, shadowRadius: 16, elevation: 12 },
    bottomTabItem: { width: "18%", height: "100%", alignItems: "center", justifyContent: "center", position: "relative", paddingTop: 5 },
    activeTabIndicator: { position: "absolute", top: 0, width: 20, height: 2.5, borderRadius: 2, backgroundColor: "#F59E0B" },
    bottomTabText: { color: "#71717A", fontSize: 8, fontWeight: "600", marginTop: 4 },
    bottomTabTextActive: { color: "#F59E0B", fontWeight: "900" },
    centerScanWrapper: { width: "20%", alignItems: "center", justifyContent: "center", marginTop: -27 },
    centerScanOuterRing: { width: 65, height: 65, borderRadius: 33, backgroundColor: "#0D0D0E", borderWidth: 1, borderColor: "#27272B", justifyContent: "center", alignItems: "center", padding: 4 },
    centerScanButton: { width: 55, height: 55, borderRadius: 28, backgroundColor: "#F59E0B", justifyContent: "center", alignItems: "center", shadowColor: "#F59E0B", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.32, shadowRadius: 11, elevation: 8 },
    scanLabel: { color: "#F59E0B", fontSize: 8, fontWeight: "900", marginTop: 0 }
});