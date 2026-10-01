import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  User,
  Users,
  UserPlus,
  History,
  Edit3,
  LogOut,
  Upload,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Camera,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import { supabase } from "@/lib/supabase";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";

/* ============================================================
   TYPES
============================================================ */

interface ProfileRecord {
  id: string;

  auth_user_id?: string;

  full_name?: string | null;

  email?: string | null;

  age?: number | string | null;

  gender?: string | null;

  profile_image_url?: string | null;

  profile_image?: string | null;

  [key: string]: any;
}

interface ChildProfileRecord {
  id: string;

  parent_profile_id?: string;

  full_name?: string | null;

  age?: number | string | null;

  gender?: string | null;

  profile_image_url?: string | null;

  profile_image?: string | null;

  [key: string]: any;
}

/* ============================================================
   COMPONENT
============================================================ */

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const { logout } =
    useAuth();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    profile,
    setProfile,
  ] =
    useState<ProfileRecord | null>(
      null
    );

  const [
    children,
    setChildren,
  ] =
    useState<ChildProfileRecord[]>(
      []
    );

  const [
    activeProfile,
    setActiveProfile,
  ] =
    useState<string | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    switchingProfileId,
    setSwitchingProfileId,
  ] =
    useState<string | null>(
      null
    );

  const [
    profileImageError,
    setProfileImageError,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    );

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null
    );

  /* ============================================================
     RESOLVE PROFILE IMAGE

     Same concept as mobile:
     - absolute URL → use directly
     - storage path → convert to public URL
  ============================================================ */

  const resolveProfileImage = (
    value?: string | null
  ) => {
    if (!value) {
      return null;
    }

    const imageValue =
      String(value).trim();

    if (!imageValue) {
      return null;
    }

    if (
      imageValue.startsWith(
        "http://"
      ) ||
      imageValue.startsWith(
        "https://"
      ) ||
      imageValue.startsWith(
        "blob:"
      ) ||
      imageValue.startsWith(
        "data:"
      )
    ) {
      return imageValue;
    }

    let storagePath =
      imageValue;

    if (
      storagePath.startsWith(
        "profile-images/"
      )
    ) {
      storagePath =
        storagePath.replace(
          /^profile-images\//,
          ""
        );
    }

    const { data } =
      supabase.storage
        .from(
          "profile-images"
        )
        .getPublicUrl(
          storagePath
        );

    return (
      data?.publicUrl ||
      null
    );
  };

  /* ============================================================
     LOAD PROFILE

     Mobile flow:
       auth user
       ↓
       profiles
       ↓
       child_profiles
       ↓
       user_profiles active record
  ============================================================ */

  const loadProfile =
    useCallback(async () => {
      try {
        setLoading(true);

        setErrorMessage(
          null
        );

        setProfileImageError(
          false
        );

        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        const user =
          userData.user;

        if (!user) {
          navigate(
            "/auth/login",
            {
              replace: true,
            }
          );

          return;
        }

        /* ============================
           PRIMARY PROFILE
        ============================ */

        const {
          data: profileRows,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("*")
          .eq("auth_user_id", user.id)
          .order("created_at", {
            ascending: true,
          })
          .limit(1);

        if (profileError) {
          throw profileError;
        }

        const profileData =
          profileRows?.[0] || null;

        if (!profileData) {
          throw new Error(
            "Primary profile was not found."
          );
        }

        const rawProfileImage =
          profileData.profile_image_url ||
          profileData.profile_image ||
          null;

        const resolvedProfileImage =
          resolveProfileImage(
            rawProfileImage
          );

        const normalizedProfile:
          ProfileRecord =
        {
          ...profileData,

          profile_image_url:
            resolvedProfileImage,

          profile_image:
            resolvedProfileImage,
        };

        setProfile(
          normalizedProfile
        );

        /* ============================
           CHILD PROFILES
        ============================ */

        const {
          data: childData,
          error: childError,
        } =
          await supabase
            .from(
              "child_profiles"
            )
            .select("*")
            .eq(
              "parent_profile_id",
              profileData.id
            );

        if (childError) {
          console.error(
            "CHILD PROFILE ERROR:",
            childError
          );
        }

        const normalizedChildren =
          (
            childData || []
          ).map(
            (
              child: any
            ) => {
              const rawImage =
                child.profile_image_url ||
                child.profile_image ||
                null;

              const resolvedImage =
                resolveProfileImage(
                  rawImage
                );

              return {
                ...child,

                profile_image_url:
                  resolvedImage,

                profile_image:
                  resolvedImage,
              };
            }
          );

        setChildren(
          normalizedChildren
        );

        /* ============================
           ACTIVE PROFILE
        ============================ */

        const {
          data: activeRows,
          error: activeError,
        } = await supabase
          .from("user_profiles")
          .select("*")
          .eq(
            "parent_id",
            profileData.id
          )
          .eq(
            "is_active",
            true
          )
          .limit(1);

        if (activeError) {
          console.error(
            "ACTIVE PROFILE ERROR:",
            activeError
          );
        }

        const activeData =
          activeRows?.[0] || null;

        if (activeData?.profile_id) {
          setActiveProfile(
            activeData.profile_id
          );
        } else {
          setActiveProfile(
            profileData.id
          );
        }
      } catch (
      error: any
      ) {
        console.error(
          "PROFILE LOAD ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
          "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    }, [navigate]);

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* ============================================================
     BROWSER IMAGE COMPRESSION

     Mobile:
       resize width 1000
       JPEG
       compress 0.85

     Browser equivalent.
  ============================================================ */

  const compressImage =
    async (
      file: File
    ): Promise<Blob> => {
      return new Promise(
        (
          resolve,
          reject
        ) => {
          const image =
            new Image();

          const objectUrl =
            URL.createObjectURL(
              file
            );

          image.onload = () => {
            try {
              const maxWidth =
                1000;

              const ratio =
                Math.min(
                  1,
                  maxWidth /
                  image.width
                );

              const width =
                Math.round(
                  image.width *
                  ratio
                );

              const height =
                Math.round(
                  image.height *
                  ratio
                );

              const canvas =
                document.createElement(
                  "canvas"
                );

              canvas.width =
                width;

              canvas.height =
                height;

              const context =
                canvas.getContext(
                  "2d"
                );

              if (!context) {
                throw new Error(
                  "Unable to process profile image."
                );
              }

              context.drawImage(
                image,
                0,
                0,
                width,
                height
              );

              canvas.toBlob(
                (blob) => {
                  URL.revokeObjectURL(
                    objectUrl
                  );

                  if (!blob) {
                    reject(
                      new Error(
                        "Profile image conversion failed."
                      )
                    );

                    return;
                  }

                  resolve(
                    blob
                  );
                },

                "image/jpeg",

                0.85
              );
            } catch (
            error
            ) {
              URL.revokeObjectURL(
                objectUrl
              );

              reject(error);
            }
          };

          image.onerror =
            () => {
              URL.revokeObjectURL(
                objectUrl
              );

              reject(
                new Error(
                  "Unable to read selected profile image."
                )
              );
            };

          image.src =
            objectUrl;
        }
      );
    };

  /* ============================================================
     PROFILE IMAGE UPLOAD

     Same mobile storage path:
       users/{authUserId}/profile_TIMESTAMP.jpg
  ============================================================ */

  const handleImageUpload =
    async (
      event:
        React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target.files?.[0];

      /*
       * reset input so same file
       * can be selected again.
       */
      event.target.value =
        "";

      if (
        !file ||
        !profile
      ) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setErrorMessage(
          "Please select a valid image file."
        );

        return;
      }

      try {
        setUploading(true);

        setErrorMessage(
          null
        );

        setSuccessMessage(
          null
        );

        setProfileImageError(
          false
        );

        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        const user =
          userData.user;

        if (!user) {
          throw new Error(
            "User session not found."
          );
        }

        /* ============================
           COMPRESS
        ============================ */

        const jpegBlob =
          await compressImage(
            file
          );

        if (
          !jpegBlob.size
        ) {
          throw new Error(
            "Converted image is empty."
          );
        }

        /* ============================
           STORAGE
        ============================ */

        const filePath =
          `users/${user.id}/profile_${Date.now()}.jpg`;

        const {
          error: uploadError,
        } =
          await supabase.storage
            .from(
              "profile-images"
            )
            .upload(
              filePath,
              jpegBlob,
              {
                contentType:
                  "image/jpeg",

                upsert:
                  true,
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        const {
          data:
          publicUrlData,
        } =
          supabase.storage
            .from(
              "profile-images"
            )
            .getPublicUrl(
              filePath
            );

        if (
          !publicUrlData?.publicUrl
        ) {
          throw new Error(
            "Unable to generate profile image URL."
          );
        }

        /*
         * Cache-busting exactly like
         * mobile intention.
         */

        const publicUrl =
          `${publicUrlData.publicUrl}?t=${Date.now()}`;

        /* ============================
           PROFILE UPDATE

           Mobile updates BOTH fields.
        ============================ */

        const {
          error: updateError,
        } =
          await supabase
            .from(
              "profiles"
            )
            .update({
              profile_image_url:
                publicUrl,

              profile_image:
                publicUrl,
            })
            .eq(
              "id",
              profile.id
            );

        if (updateError) {
          throw updateError;
        }

        setProfile(
          (previous) =>
            previous
              ? {
                ...previous,

                profile_image_url:
                  publicUrl,

                profile_image:
                  publicUrl,
              }
              : previous
        );

        setSuccessMessage(
          "Profile image updated successfully."
        );
      } catch (
      error: any
      ) {
        console.error(
          "PROFILE IMAGE UPDATE ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
          "Unable to update profile image."
        );
      } finally {
        setUploading(
          false
        );
      }
    };

  /* ============================================================
     SWITCH PROFILE

     Exact mobile behavior:
       disable all
       ↓
       find mapping
       ↓
       update or insert
       ↓
       mark selected profile active
  ============================================================ */

  const switchProfile =
    async (
      profileId: string,
      type:
        | "PRIMARY"
        | "CHILD"
    ) => {
      if (
        !profile ||
        switchingProfileId
      ) {
        return;
      }

      try {
        setSwitchingProfileId(
          profileId
        );

        setErrorMessage(
          null
        );

        setSuccessMessage(
          null
        );

        /* ============================
           DISABLE CURRENT ACTIVE
        ============================ */

        const {
          error:
          disableError,
        } =
          await supabase
            .from(
              "user_profiles"
            )
            .update({
              is_active:
                false,
            })
            .eq(
              "parent_id",
              profile.id
            );

        if (disableError) {
          throw disableError;
        }

        /* ============================
           CHECK MAPPING
        ============================ */

        const {
          data: existing,
          error: findError,
        } =
          await supabase
            .from(
              "user_profiles"
            )
            .select("id")
            .eq(
              "parent_id",
              profile.id
            )
            .eq(
              "profile_id",
              profileId
            )
            .maybeSingle();

        if (findError) {
          throw findError;
        }

        /* ============================
           UPDATE / INSERT
        ============================ */

        if (existing) {
          const {
            error:
            updateError,
          } =
            await supabase
              .from(
                "user_profiles"
              )
              .update({
                profile_type:
                  type,

                is_active:
                  true,
              })
              .eq(
                "id",
                existing.id
              );

          if (updateError) {
            throw updateError;
          }
        } else {
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
                  profile.id,

                profile_id:
                  profileId,

                profile_type:
                  type,

                is_active:
                  true,
              });

          if (insertError) {
            throw insertError;
          }
        }

        setActiveProfile(
          profileId
        );

        setSuccessMessage(
          "Profile switched successfully."
        );
      } catch (
      error: any
      ) {
        console.error(
          "PROFILE SWITCH ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
          "Unable to switch profile."
        );

        /*
         * Reload real DB state if
         * switch partially failed.
         */
        await loadProfile();
      } finally {
        setSwitchingProfileId(
          null
        );
      }
    };

  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout =
    async () => {
      try {
        await logout();

        navigate(
          "/auth/login",
          {
            replace: true,
          }
        );
      } catch (
      error: any
      ) {
        console.error(
          "LOGOUT ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
          "Unable to logout."
        );
      }
    };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 rounded-full" />

          <div className="absolute w-12 h-12 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>

        <p className="text-xs font-black text-primary uppercase tracking-wider">
          Loading User Profile
          Records...
        </p>
      </div>
    );
  }

  /* ============================================================
     PROFILE MISSING
  ============================================================ */

  if (!profile) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <Card
          variant="surface"
          className="w-full max-w-lg p-8 border-border text-center"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-error/10 border border-error/30 flex items-center justify-center">
            <AlertCircle
              size={26}
              className="text-error"
            />
          </div>

          <h2 className="mt-5 text-xl font-black text-white">
            Profile Unavailable
          </h2>

          <p className="mt-2 text-xs text-textSecondary">
            {errorMessage ||
              "Unable to load your Kshurak profile."}
          </p>

          <Button
            variant="primary"
            size="md"
            className="mt-6"
            onClick={
              loadProfile
            }
          >
            TRY AGAIN
          </Button>
        </Card>
      </div>
    );
  }

  /* ============================================================
     PRIMARY PROFILE
  ============================================================ */

  const primaryProfile =
  {
    id:
      profile.id,

    name:
      profile.full_name ||
      "Your Name",

    email:
      profile.email ||
      "your@email.com",

    image:
      profile.profile_image_url ||
      profile.profile_image ||
      null,

    age:
      profile.age ??
      "N/A",

    gender:
      profile.gender ||
      "Not specified",
  };

  const primaryActive =
    activeProfile ===
    primaryProfile.id;

  /* ============================================================
     MAIN UI
  ============================================================ */

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-16 h-[430px] w-[430px] rounded-full bg-primary/[0.025] blur-3xl" />

        <div className="absolute -right-40 top-[55%] h-[420px] w-[420px] rounded-full bg-primary/[0.02] blur-3xl" />
      </div>

      <div className="relative min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-7">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider mb-1">
              <User
                size={14}
              />

              Account Management
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight">
              User & Family
              Profiles
            </h1>

            <p className="text-xs text-textSecondary mt-1">
              Manage your personal
              profile, family members
              and active AI analysis
              identity
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/profile/edit">
              <Button
                variant="outline"
                size="sm"
                icon={
                  <Edit3
                    size={14}
                  />
                }
              >
                Edit Profile
              </Button>
            </Link>

            <Button
              variant="danger"
              size="sm"
              onClick={
                handleLogout
              }
              icon={
                <LogOut
                  size={14}
                />
              }
            >
              Logout
            </Button>
          </div>
        </div>

        {/* =====================================================
            STATUS MESSAGES
        ====================================================== */}

        {errorMessage && (
          <div className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-xs font-bold text-error flex items-start gap-3">
            <AlertCircle
              size={17}
              className="shrink-0 mt-0.5"
            />

            <span>
              {errorMessage}
            </span>
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3 text-xs font-bold text-emerald-400 flex items-center gap-3">
            <CheckCircle2
              size={17}
            />

            {successMessage}
          </div>
        )}

        {/* =====================================================
            DESKTOP LAYOUT
        ====================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ===================================================
              LEFT IDENTITY CARD
          ==================================================== */}

          <div className="lg:col-span-4 space-y-6">
            <Card
              variant="surface"
              className="p-6 border-border text-center space-y-4 relative overflow-hidden"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/[0.04] blur-3xl" />

              <div className="relative">
                {/* Avatar */}

                <div className="relative w-28 h-28 mx-auto rounded-3xl p-1 border-2 border-primary bg-surfaceDark overflow-visible shadow-2xl shadow-amber-500/10">
                  <div className="w-full h-full overflow-hidden rounded-2xl bg-surfaceLight">
                    {primaryProfile.image &&
                      !profileImageError ? (
                      <img
                        key={
                          primaryProfile.image
                        }
                        src={
                          primaryProfile.image
                        }
                        alt={
                          primaryProfile.name
                        }
                        className="w-full h-full object-cover"
                        onError={() => {
                          console.error(
                            "PROFILE IMAGE LOAD ERROR:",
                            primaryProfile.image
                          );

                          setProfileImageError(
                            true
                          );
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User
                          size={48}
                          className="text-primary"
                        />
                      </div>
                    )}
                  </div>

                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary border-4 border-surface flex items-center justify-center">
                    <Crown
                      size={11}
                      className="text-black fill-black"
                    />
                  </div>
                </div>

                {/* Profile Info */}

                <div className="mt-5">
                  <h2 className="text-xl font-black text-white">
                    {
                      primaryProfile.name
                    }
                  </h2>

                  <p className="text-xs text-textSecondary mt-1">
                    {
                      primaryProfile.email
                    }
                  </p>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[9px] font-black text-primary uppercase mt-3">
                    <Crown
                      size={11}
                    />

                    Primary Account
                  </div>
                </div>

                {/* Profile image */}

                <div className="mt-4">
                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageUpload
                    }
                    className="hidden"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      uploading
                    }
                    loading={
                      uploading
                    }
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    icon={
                      <Camera
                        size={14}
                      />
                    }
                    className="text-xs font-bold"
                  >
                    {uploading
                      ? "Uploading..."
                      : "Change Profile Image"}
                  </Button>
                </div>

                {/* Age Gender */}

                <div className="grid grid-cols-2 gap-3 pt-5 mt-5 border-t border-border text-left">
                  <div className="p-3 bg-surfaceDark rounded-xl border border-border">
                    <span className="text-[9px] text-textMuted uppercase font-bold block">
                      Age
                    </span>

                    <span className="text-sm font-black text-white mt-1 block">
                      {
                        primaryProfile.age
                      }{" "}
                      {primaryProfile.age !==
                        "N/A" &&
                        "Years"}
                    </span>
                  </div>

                  <div className="p-3 bg-surfaceDark rounded-xl border border-border">
                    <span className="text-[9px] text-textMuted uppercase font-bold block">
                      Gender
                    </span>

                    <span className="text-sm font-black text-white mt-1 block">
                      {
                        primaryProfile.gender
                      }
                    </span>
                  </div>
                </div>

                {/* Quick Links */}

                <div className="pt-4 space-y-2">
                  <Link
                    to="/profile/history"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-surfaceDark hover:bg-surfaceLight border border-border hover:border-primary/20 text-xs font-bold text-white transition-all group"
                  >
                    <span className="flex items-center gap-2.5">
                      <History
                        size={16}
                        className="text-primary"
                      />

                      Profile History
                      & Reports
                    </span>

                    <span className="text-primary group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </Link>

                  <Link
                    to="/profile/edit"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-surfaceDark hover:bg-surfaceLight border border-border hover:border-primary/20 text-xs font-bold text-white transition-all group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Edit3
                        size={16}
                        className="text-primary"
                      />

                      Edit Account
                      Info
                    </span>

                    <span className="text-primary group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Security card */}

            <Card
              variant="dark"
              className="p-5 border-border"
            >
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={19}
                  className="text-primary shrink-0 mt-0.5"
                />

                <div>
                  <p className="text-xs font-black text-white">
                    Active Profile
                    Controls AI Data
                  </p>

                  <p className="mt-1 text-[10px] leading-relaxed text-textSecondary">
                    Survey answers,
                    face scans,
                    geometry reports
                    and recommendations
                    should use the
                    currently active
                    family profile.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* ===================================================
              RIGHT MANAGEMENT
          ==================================================== */}

          <div className="lg:col-span-8 space-y-6">
            {/* =================================================
                PRIMARY ACCOUNT
            ================================================== */}

            <Card
              variant="surface"
              className="p-6 border-border space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">
                    Account
                  </div>

                  <h3 className="text-base font-black text-white mt-1">
                    Primary Account
                  </h3>

                  <p className="text-xs text-textSecondary mt-1">
                    Default master
                    profile connected
                    to your
                    authentication
                    account
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
                  Verified
                </span>
              </div>

              <div
                className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${primaryActive
                    ? "bg-surfaceLight border-primary shadow-lg shadow-amber-500/10"
                    : "bg-surfaceDark border-border"
                  }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface border border-primary/30 flex items-center justify-center text-primary font-bold text-base shrink-0">
                    {primaryProfile.image &&
                      !profileImageError ? (
                      <img
                        src={
                          primaryProfile.image
                        }
                        alt={
                          primaryProfile.name
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      primaryProfile.name
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-white truncate">
                      {
                        primaryProfile.name
                      }
                    </h4>

                    <p className="text-xs text-textSecondary truncate mt-0.5">
                      {
                        primaryProfile.email
                      }
                    </p>
                  </div>
                </div>

                <Button
                  variant={
                    primaryActive
                      ? "primary"
                      : "outline"
                  }
                  size="sm"
                  disabled={
                    primaryActive ||
                    Boolean(
                      switchingProfileId
                    )
                  }
                  loading={
                    switchingProfileId ===
                    primaryProfile.id
                  }
                  onClick={() =>
                    switchProfile(
                      primaryProfile.id,
                      "PRIMARY"
                    )
                  }
                >
                  {primaryActive
                    ? "ACTIVE"
                    : "SWITCH TO THIS"}
                </Button>
              </div>
            </Card>

            {/* =================================================
                FAMILY PROFILES
            ================================================== */}

            <Card
              variant="surface"
              className="p-6 border-border space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                    <Users
                      size={14}
                    />

                    Family
                  </div>

                  <h3 className="text-lg font-black text-white mt-1">
                    Family & Child
                    Profiles
                  </h3>

                  <p className="text-xs text-textSecondary mt-1 max-w-2xl">
                    Maintain separate
                    surveys, face
                    scans, geometry
                    reports and
                    hairstyle data
                    for each family
                    member.
                  </p>
                </div>

                <Link to="/profile/add-child">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={
                      <UserPlus
                        size={15}
                      />
                    }
                  >
                    Add Child Profile
                  </Button>
                </Link>
              </div>

              {children.length ===
                0 ? (
                <div className="p-8 rounded-2xl bg-surfaceDark border border-dashed border-border text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-surface border border-border mx-auto flex items-center justify-center text-textMuted">
                    <Users
                      size={24}
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white">
                      No Child
                      Profiles Linked
                    </h4>

                    <p className="text-xs text-textSecondary max-w-sm mx-auto mt-1 leading-relaxed">
                      Add a family
                      member to create
                      an independent AI
                      grooming profile.
                    </p>
                  </div>

                  <Link to="/profile/add-child">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={
                        <UserPlus
                          size={14}
                        />
                      }
                    >
                      Create Family
                      Member Profile
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {children.map(
                    (child) => {
                      const isActive =
                        activeProfile ===
                        child.id;

                      const childImage =
                        child.profile_image_url ||
                        child.profile_image ||
                        null;

                      return (
                        <div
                          key={
                            child.id
                          }
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-4 ${isActive
                              ? "bg-surfaceLight border-primary shadow-lg shadow-amber-500/10"
                              : "bg-surfaceDark border-border hover:border-primary/20"
                            }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-surface border border-border flex items-center justify-center text-primary font-bold text-base shrink-0">
                              {childImage ? (
                                <img
                                  src={
                                    childImage
                                  }
                                  alt={
                                    child.full_name ||
                                    "Child profile"
                                  }
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                (
                                  child.full_name ||
                                  "C"
                                )
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-white truncate">
                                {child.full_name ||
                                  "Child Profile"}
                              </h4>

                              <p className="text-xs text-textSecondary mt-0.5 truncate">
                                {child.age ??
                                  "--"}{" "}
                                Years •{" "}
                                {child.gender ||
                                  "--"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60">
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider ${isActive
                                  ? "text-primary"
                                  : "text-textMuted"
                                }`}
                            >
                              {isActive
                                ? "Currently Active"
                                : "Child Account"}
                            </span>

                            <Button
                              variant={
                                isActive
                                  ? "primary"
                                  : "secondary"
                              }
                              size="sm"
                              disabled={
                                isActive ||
                                Boolean(
                                  switchingProfileId
                                )
                              }
                              loading={
                                switchingProfileId ===
                                child.id
                              }
                              onClick={() =>
                                switchProfile(
                                  child.id,
                                  "CHILD"
                                )
                              }
                            >
                              {isActive
                                ? "ACTIVE"
                                : "SWITCH"}
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;