import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

interface User {
    id: string;
    email?: string;
    user_metadata?: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    googleLogin: () => Promise<void>;
    facebookLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const pendingOAuthResolver = useRef<((url: string) => void) | null>(null);

    useEffect(() => {
        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("AUTH STATE EVENT:", event);

                if (session?.user) {
                    setUser(session.user);
                    await AsyncStorage.setItem(
                        "user",
                        JSON.stringify(session.user)
                    );
                } else {
                    setUser(null);
                    await AsyncStorage.removeItem("user");
                }
            }
        );

        const linkingSubscription = Linking.addEventListener(
            "url",
            ({ url }) => {
                console.log("DEEPLINK RECEIVED:", getSafeUrl(url));

                if (
                    url.startsWith("kshurak://auth/callback") &&
                    pendingOAuthResolver.current
                ) {
                    const resolver = pendingOAuthResolver.current;
                    pendingOAuthResolver.current = null;
                    resolver(url);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
            linkingSubscription.remove();
        };
    }, []);

    const getSafeUrl = (url: string) => {
        try {
            const withoutHash = url.split("#")[0];
            const withoutQuery = withoutHash.split("?")[0];
            return withoutQuery;
        } catch {
            return "unknown";
        }
    };

    const initializeAuth = async () => {
        try {
            const { data, error } = await supabase.auth.getSession();

            if (error) throw error;

            if (data.session?.user) {
                setUser(data.session.user);

                await AsyncStorage.setItem(
                    "user",
                    JSON.stringify(data.session.user)
                );
            } else {
                setUser(null);
                await AsyncStorage.removeItem("user");
            }
        } catch (error) {
            console.log("AUTH INITIALIZATION ERROR", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const ensureUserProfile = async (authUser: any, extraData?: any) => {
        try {
            if (!authUser?.id) {
                throw new Error("Invalid authenticated user");
            }

            const { data: existing, error: existingError } = await supabase
                .from("profiles")
                .select("*")
                .eq("auth_user_id", authUser.id)
                .maybeSingle();

            if (existingError) throw existingError;

            if (existing) return existing;

            const metadata = authUser.user_metadata || {};

            const fullName =
                extraData?.username ||
                extraData?.fullName ||
                metadata.full_name ||
                metadata.name ||
                metadata.username ||
                authUser.email?.split("@")[0] ||
                "User";

            const email =
                extraData?.email ||
                authUser.email ||
                null;

            const ageValue =
                extraData?.age !== undefined &&
                    extraData?.age !== null &&
                    extraData?.age !== ""
                    ? Number(extraData.age)
                    : metadata.age !== undefined &&
                        metadata.age !== null &&
                        metadata.age !== ""
                        ? Number(metadata.age)
                        : null;

            const genderValue =
                extraData?.gender ||
                metadata.gender ||
                null;

            const avatarUrl =
                metadata.avatar_url ||
                metadata.picture ||
                null;

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .insert({
                    auth_user_id: authUser.id,
                    full_name: fullName,
                    email: email,
                    age: Number.isNaN(ageValue) ? null : ageValue,
                    gender: genderValue,
                    profile_image_url: avatarUrl,
                    profile_image: avatarUrl,
                    profile_type: "PRIMARY"
                })
                .select()
                .single();

            if (profileError) throw profileError;

            const {
                data: existingUserProfile,
                error: userProfileCheckError
            } = await supabase
                .from("user_profiles")
                .select("id")
                .eq("parent_id", profile.id)
                .eq("profile_id", profile.id)
                .maybeSingle();

            if (userProfileCheckError) {
                throw userProfileCheckError;
            }

            if (!existingUserProfile) {
                const { error: userProfileError } = await supabase
                    .from("user_profiles")
                    .insert({
                        parent_id: profile.id,
                        profile_id: profile.id,
                        profile_type: "PRIMARY",
                        is_active: true
                    });

                if (userProfileError) {
                    throw userProfileError;
                }
            }

            return profile;
        } catch (error) {
            console.log("ENSURE PROFILE ERROR", error);
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) throw error;

        if (data.user) {
            await ensureUserProfile(data.user);

            setUser(data.user);

            await AsyncStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
        }
    };

    const signup = async (data: any) => {
        const {
            email,
            password,
            username,
            age,
            gender
        } = data;

        if (!email || !password || !username) {
            throw new Error(
                "Email, password and username are required"
            );
        }

        const { data: userData, error } =
            await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: username,
                        name: username,
                        username: username,
                        age: age ? Number(age) : null,
                        gender: gender || null
                    }
                }
            });

        if (error) throw error;

        if (!userData.user) {
            throw new Error(
                "Signup failed. User was not created."
            );
        }

        console.log(
            "AUTH USER CREATED",
            userData.user.id
        );

        if (!userData.session) {
            console.log("SIGNUP SESSION IS NULL");

            throw new Error(
                "Account created, but no active session was returned. Disable email confirmation for immediate app login or confirm the email first."
            );
        }

        const profile = await ensureUserProfile(
            userData.user,
            {
                username,
                email,
                age,
                gender
            }
        );

        console.log("PROFILE CREATED", profile);

        setUser(userData.user);

        await AsyncStorage.setItem(
            "user",
            JSON.stringify(userData.user)
        );
    };

    const createSessionFromUrl = async (url: string) => {
        console.log(
            "PROCESSING OAUTH CALLBACK:",
            getSafeUrl(url)
        );

        const { params, errorCode } =
            QueryParams.getQueryParams(url);

        if (errorCode) {
            throw new Error(errorCode);
        }

        const accessToken = params.access_token;
        const refreshToken = params.refresh_token;

        console.log(
            "CALLBACK HAS ACCESS TOKEN:",
            Boolean(accessToken)
        );

        console.log(
            "CALLBACK HAS REFRESH TOKEN:",
            Boolean(refreshToken)
        );

        if (!accessToken || !refreshToken) {
            throw new Error(
                "OAuth callback did not contain a Supabase session"
            );
        }

        const { data, error } =
            await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });

        if (error) throw error;

        return data.session;
    };

    const waitForDeepLink = (timeoutMs = 5000) => {
        return new Promise<string | null>((resolve) => {
            let completed = false;

            const finish = (url: string | null) => {
                if (completed) return;

                completed = true;

                if (pendingOAuthResolver.current) {
                    pendingOAuthResolver.current = null;
                }

                resolve(url);
            };

            pendingOAuthResolver.current = (url: string) => {
                finish(url);
            };

            setTimeout(() => {
                finish(null);
            }, timeoutMs);
        });
    };

    const finalizeOAuthSession = async (
        callbackUrl: string
    ) => {
        const session =
            await createSessionFromUrl(callbackUrl);

        if (!session?.user) {
            throw new Error(
                "OAuth session was not created"
            );
        }

        await ensureUserProfile(session.user);

        setUser(session.user);

        await AsyncStorage.setItem(
            "user",
            JSON.stringify(session.user)
        );

        return session.user;
    };

    const handleOAuthLogin = async (
        provider: "google" | "facebook"
    ) => {
        try {
            const redirectUrl =
                Platform.OS === "web"
                    ? window.location.origin
                    : "kshurak://auth/callback";

            console.log(
                "OAUTH PROVIDER:",
                provider
            );

            console.log(
                "OAUTH REDIRECT URL:",
                redirectUrl
            );

            const queryParams =
                provider === "google"
                    ? {
                        prompt: "select_account"
                    }
                    : undefined;

            const { data, error } =
                await supabase.auth.signInWithOAuth({
                    provider,
                    options: {
                        redirectTo: redirectUrl,
                        skipBrowserRedirect:
                            Platform.OS !== "web",
                        queryParams
                    }
                });

            if (error) throw error;

            if (Platform.OS === "web") {
                return;
            }

            if (!data.url) {
                throw new Error(
                    "OAuth authentication URL was not generated"
                );
            }

            console.log(
                "OAUTH AUTHORIZATION URL GENERATED"
            );

            const deepLinkPromise =
                waitForDeepLink(5000);

            const result =
                await WebBrowser.openAuthSessionAsync(
                    data.url,
                    redirectUrl
                );

            console.log(
                "OAUTH RESULT:",
                result.type
            );

            let callbackUrl: string | null = null;

            if (result.type === "success") {
                callbackUrl = result.url;
            } else {
                console.log(
                    "WAITING FOR ANDROID DEEPLINK CALLBACK"
                );

                callbackUrl =
                    await deepLinkPromise;
            }

            if (!callbackUrl) {
                const {
                    data: existingSession,
                    error: sessionError
                } = await supabase.auth.getSession();

                if (sessionError) {
                    throw sessionError;
                }

                if (existingSession.session?.user) {
                    await ensureUserProfile(
                        existingSession.session.user
                    );

                    setUser(
                        existingSession.session.user
                    );

                    await AsyncStorage.setItem(
                        "user",
                        JSON.stringify(
                            existingSession.session.user
                        )
                    );

                    console.log(
                        `${provider.toUpperCase()} LOGIN SUCCESS FROM EXISTING SESSION`
                    );

                    return;
                }

                throw new Error(
                    `${provider} authentication was not completed. No callback was received by the app.`
                );
            }

            console.log(
                "OAUTH CALLBACK RECEIVED:",
                getSafeUrl(callbackUrl)
            );

            const authenticatedUser =
                await finalizeOAuthSession(
                    callbackUrl
                );

            console.log(
                `${provider.toUpperCase()} LOGIN SUCCESS:`,
                authenticatedUser.email
            );
        } catch (error) {
            console.log(
                `${provider.toUpperCase()} LOGIN ERROR:`,
                error
            );

            throw error;
        } finally {
            pendingOAuthResolver.current = null;
        }
    };

    const googleLogin = async () => {
        await handleOAuthLogin("google");
    };

    const facebookLogin = async () => {
        await handleOAuthLogin("facebook");
    };

    const logout = async () => {
        const { error } =
            await supabase.auth.signOut();

        if (error) throw error;

        setUser(null);

        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem(
            "surveyCompleted"
        );
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                logout,
                googleLogin,
                facebookLogin
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}