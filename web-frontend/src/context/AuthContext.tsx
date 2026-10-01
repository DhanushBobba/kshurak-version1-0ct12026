import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

/* ============================================================
   TYPES
============================================================ */

export interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  age: string | number;
  gender: string;
}

export interface AuthContextType {
  user: User | null;

  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  signup: (
    data: SignUpData
  ) => Promise<void>;

  logout: () => Promise<void>;

  googleLogin: () => Promise<void>;

  facebookLogin: () => Promise<void>;
}

/* ============================================================
   CONTEXT
============================================================ */

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

/* ============================================================
   PROVIDER
============================================================ */

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  /* ============================================================
     STORAGE HELPERS
  ============================================================ */

  const saveUserLocally = (
    authUser: any
  ) => {
    if (!authUser) {
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify(authUser)
    );
  };

  const clearLocalAuth = () => {
    localStorage.removeItem(
      "user"
    );

    /*
     * Same intention as mobile logout.
     * Remove any old local survey completion flag.
     */
    localStorage.removeItem(
      "surveyCompleted"
    );
  };

  /* ============================================================
     ENSURE USER PROFILE

     Same core mobile flow:

     Supabase auth user
          ↓
     profiles.auth_user_id
          ↓
     existing?
       YES → verify PRIMARY user_profiles mapping
       NO  → create PRIMARY profile
          ↓
     user_profiles PRIMARY / active
  ============================================================ */

  const ensureUserProfile = async (
    authUser: any,
    extraData?: Partial<SignUpData>
  ) => {
    try {
      if (!authUser?.id) {
        throw new Error(
          "Invalid authenticated user."
        );
      }

      const normalizedEmail =
        (
          extraData?.email ||
          authUser.email ||
          ""
        )
          .trim()
          .toLowerCase();

      const {
        data: authProfiles,
        error: authProfileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq(
          "auth_user_id",
          authUser.id
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        )
        .limit(1);

      if (authProfileError) {
        throw authProfileError;
      }

      let existingProfile =
        authProfiles?.[0] ||
        null;

      if (existingProfile) {
        await ensurePrimaryMapping(
          existingProfile.id
        );

        return existingProfile;
      }

      if (normalizedEmail) {
        const {
          data: emailProfiles,
          error: emailProfileError,
        } = await supabase
          .from("profiles")
          .select("*")
          .ilike(
            "email",
            normalizedEmail
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          )
          .limit(1);

        if (emailProfileError) {
          throw emailProfileError;
        }

        const emailProfile =
          emailProfiles?.[0] ||
          null;

        if (emailProfile) {
          const {
            data: linkedProfile,
            error: linkError,
          } = await supabase
            .from("profiles")
            .update({
              auth_user_id:
                authUser.id,
              email:
                normalizedEmail,
            })
            .eq(
              "id",
              emailProfile.id
            )
            .select()
            .single();

          if (linkError) {
            throw linkError;
          }

          existingProfile =
            linkedProfile;

          await ensurePrimaryMapping(
            existingProfile.id
          );

          return existingProfile;
        }
      }

      const metadata =
        authUser.user_metadata ||
        {};

      const fullName =
        extraData?.username ||
        metadata.full_name ||
        metadata.name ||
        metadata.username ||
        normalizedEmail.split(
          "@"
        )[0] ||
        "User";

      const rawAge =
        extraData?.age !==
          undefined &&
        extraData?.age !==
          null &&
        extraData?.age !==
          ""
          ? extraData.age
          : metadata.age;

      const parsedAge =
        rawAge !==
          undefined &&
        rawAge !==
          null &&
        rawAge !==
          ""
          ? Number(rawAge)
          : null;

      const gender =
        extraData?.gender ||
        metadata.gender ||
        null;

      const avatarUrl =
        metadata.avatar_url ||
        metadata.picture ||
        null;

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .insert({
          auth_user_id:
            authUser.id,
          full_name:
            fullName,
          email:
            normalizedEmail ||
            null,
          age:
            parsedAge !==
              null &&
            !Number.isNaN(
              parsedAge
            )
              ? parsedAge
              : null,
          gender,
          profile_image_url:
            avatarUrl,
          profile_image:
            avatarUrl,
          profile_type:
            "PRIMARY",
        })
        .select()
        .single();

      if (profileError) {
        const {
          data: retryProfiles,
          error: retryError,
        } = await supabase
          .from("profiles")
          .select("*")
          .eq(
            "auth_user_id",
            authUser.id
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          )
          .limit(1);

        if (retryError) {
          throw retryError;
        }

        const retryProfile =
          retryProfiles?.[0] ||
          null;

        if (retryProfile) {
          await ensurePrimaryMapping(
            retryProfile.id
          );

          return retryProfile;
        }

        throw profileError;
      }

      if (!profile) {
        throw new Error(
          "Unable to create user profile."
        );
      }

      await ensurePrimaryMapping(
        profile.id
      );

      return profile;
    } catch (error) {
      console.error(
        "ENSURE PROFILE ERROR:",
        error
      );

      throw error;
    }
  };

  /* ============================================================
     ENSURE PRIMARY USER_PROFILES MAPPING

     This improves the mobile behavior slightly:
     even an older existing primary profile whose mapping is
     missing will be repaired.
  ============================================================ */

  const ensurePrimaryMapping =
    async (
      profileId: string
    ) => {
      const {
        data: existingMappings,
        error: mappingCheckError,
      } = await supabase
        .from("user_profiles")
        .select("id, is_active")
        .eq("parent_id", profileId)
        .eq("profile_id", profileId)
        .limit(1);

      if (mappingCheckError) {
        throw mappingCheckError;
      }

      const existingMapping =
        existingMappings?.[0] || null;

      if (
        existingMapping
      ) {
        return;
      }

      /*
       * Determine whether another
       * profile is already active.
       *
       * If no active mapping exists,
       * PRIMARY becomes active.
       */

      const {
        data: activeMappings,
        error: activeCheckError,
      } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("parent_id", profileId)
        .eq("is_active", true)
        .limit(1);

      if (activeCheckError) {
        throw activeCheckError;
      }

      const activeMapping =
        activeMappings?.[0] || null;

      const {
        error:
        insertError,
      } =
        await supabase
          .from(
            "user_profiles"
          )
          .insert({
            parent_id:
              profileId,

            profile_id:
              profileId,

            profile_type:
              "PRIMARY",

            is_active:
              !activeMapping,
          });

      if (insertError) {
        throw insertError;
      }
    };

  /* ============================================================
     INITIAL SESSION
  ============================================================ */

  const initializeAuth =
    async () => {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        const authUser =
          data.session?.user;

        if (authUser) {
          try {
            await ensureUserProfile(
              authUser
            );

            setUser(
              authUser
            );

            saveUserLocally(
              authUser
            );
          } catch (profileError) {
            console.error(
              "INITIAL PROFILE CHECK ERROR:",
              profileError
            );

            setUser(null);

            clearLocalAuth();

            throw profileError;
          }
        } else {
          setUser(null);

          clearLocalAuth();
        }
      } catch (
      error
      ) {
        console.error(
          "AUTH INITIALIZATION ERROR:",
          error
        );

        setUser(null);

        clearLocalAuth();
      } finally {
        setLoading(
          false
        );
      }
    };

  /* ============================================================
     AUTH LISTENER
  ============================================================ */

  useEffect(() => {
    initializeAuth();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          session
        ) => {
          console.log(
            "AUTH STATE EVENT:",
            event
          );

          const authUser =
            session?.user;

          if (authUser) {
            void (async () => {
              try {
                await ensureUserProfile(
                  authUser
                );

                setUser(
                  authUser
                );

                saveUserLocally(
                  authUser
                );

                console.log(
                  "AUTH PROFILE READY:",
                  authUser.id
                );
              } catch (error) {
                console.error(
                  "AUTH PROFILE SYNC ERROR:",
                  error
                );

                setUser(null);

                clearLocalAuth();
              }
            })();
          } else {
            setUser(null);

            clearLocalAuth();
          }
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* ============================================================
     EMAIL LOGIN

     Mobile:
       signInWithPassword
           ↓
       ensureUserProfile
           ↓
       setUser
  ============================================================ */

  const login =
    async (
      email: string,
      password: string
    ) => {
      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              normalizedEmail,

            password,
          }
        );

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "Login failed. User information was not returned."
        );
      }

      await ensureUserProfile(
        data.user
      );

      setUser(
        data.user
      );

      saveUserLocally(
        data.user
      );
    };

  /* ============================================================
     SIGNUP

     Same mobile data contract.
  ============================================================ */

  const signup =
    async (
      data: SignUpData
    ) => {
      const {
        email,
        password,
        username,
        age,
        gender,
      } = data;

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const normalizedUsername =
        username.trim();

      if (
        !normalizedEmail ||
        !password ||
        !normalizedUsername
      ) {
        throw new Error(
          "Email, password and username are required."
        );
      }

      const {
        data:
        userData,
        error,
      } =
        await supabase.auth.signUp(
          {
            email:
              normalizedEmail,

            password,

            options: {
              data: {
                full_name:
                  normalizedUsername,

                name:
                  normalizedUsername,

                username:
                  normalizedUsername,

                age:
                  age !==
                    "" &&
                    age !==
                    null &&
                    age !==
                    undefined
                    ? Number(
                      age
                    )
                    : null,

                gender:
                  gender ||
                  null,
              },
            },
          }
        );

      if (error) {
        throw error;
      }

      if (
        !userData.user
      ) {
        throw new Error(
          "Signup failed. User was not created."
        );
      }

      /*
       * Same mobile rule:
       * profile creation requires authenticated session.
       *
       * If Supabase email confirmation is enabled,
       * session can be null after sign-up.
       */

      if (
        !userData.session
      ) {
        throw new Error(
          "Account created successfully. Please confirm your email and login to continue."
        );
      }

      await ensureUserProfile(
        userData.user,
        {
          username:
            normalizedUsername,

          email:
            normalizedEmail,

          age,

          gender,
        }
      );

      setUser(
        userData.user
      );

      saveUserLocally(
        userData.user
      );
    };

  /* ============================================================
     WEB OAUTH

     Browser flow:
       Google / Facebook
           ↓
       Supabase hosted OAuth
           ↓
       window.location.origin
           ↓
       browser returns to app
           ↓
       Supabase restores session
           ↓
       auth listener
           ↓
       ensureUserProfile()
  ============================================================ */

  const handleOAuthLogin =
    async (
      provider:
        | "google"
        | "facebook"
    ) => {
      try {
        const redirectUrl =
          window.location.origin;

        const queryParams =
          provider ===
            "google"
            ? {
              prompt:
                "select_account",
            }
            : undefined;

        const {
          error,
        } =
          await supabase.auth.signInWithOAuth(
            {
              provider,

              options: {
                redirectTo:
                  redirectUrl,

                skipBrowserRedirect:
                  false,

                queryParams,
              },
            }
          );

        if (error) {
          throw error;
        }

        /*
         * Browser is redirected from here.
         * There is intentionally no
         * navigate("/") here.
         *
         * On return, Supabase restores
         * the browser session and the
         * auth state listener handles it.
         */
      } catch (
      error
      ) {
        console.error(
          `${provider.toUpperCase()} LOGIN ERROR:`,
          error
        );

        throw error;
      }
    };

  const googleLogin =
    async () => {
      await handleOAuthLogin(
        "google"
      );
    };

  const facebookLogin =
    async () => {
      await handleOAuthLogin(
        "facebook"
      );
    };

  /* ============================================================
     LOGOUT
  ============================================================ */

  const logout =
    async () => {
      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);

      clearLocalAuth();
    };

  /* ============================================================
     PROVIDER
  ============================================================ */

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        googleLogin,
        facebookLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ============================================================
   HOOK
============================================================ */

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}