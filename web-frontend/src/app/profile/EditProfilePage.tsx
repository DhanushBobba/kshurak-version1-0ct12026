import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { supabase } from "@/lib/supabase";

import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";

/* ============================================================
   TYPES
============================================================ */

type ProfileType =
  | "PRIMARY"
  | "CHILD";

interface EditableProfile {
  id: string;

  full_name?: string | null;

  email?: string | null;

  phone?: string | null;

  age?: number | string | null;

  gender?: string | null;

  profile_image?: string | null;

  profile_image_url?: string | null;

  [key: string]: any;
}

/* ============================================================
   COMPONENT
============================================================ */

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const [searchParams] =
    useSearchParams();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  /*
   * ==========================================================
   * PROFILE TARGET
   * ==========================================================
   *
   * Supports:
   *
   * /profile/edit?id=<uuid>&type=PRIMARY
   * /profile/edit?id=<uuid>&type=CHILD
   *
   * OR React Router state:
   *
   * navigate("/profile/edit", {
   *   state: {
   *     id,
   *     type
   *   }
   * })
   *
   * If nothing is supplied,
   * logged-in PRIMARY profile is used.
   */

  const routeId =
    location.state?.id
      ? String(
          location.state.id
        )
      : "";

  const queryId =
    searchParams.get("id") ||
    "";

  const routeType =
    location.state?.type
      ? String(
          location.state.type
        ).toUpperCase()
      : "";

  const queryType =
    (
      searchParams.get(
        "type"
      ) || ""
    ).toUpperCase();

  const requestedId =
    routeId ||
    queryId;

  const requestedType =
    (
      routeType ||
      queryType
    ) as ProfileType | "";

  /* ============================================================
     STATE
  ============================================================ */

  const [
    profileId,
    setProfileId,
  ] =
    useState("");

  const [
    profileType,
    setProfileType,
  ] =
    useState<ProfileType>(
      "PRIMARY"
    );

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    age,
    setAge,
  ] =
    useState("");

  const [
    gender,
    setGender,
  ] =
    useState("");

  const [
    currentImage,
    setCurrentImage,
  ] =
    useState<string | null>(
      null
    );

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState<File | null>(
      null
    );

  const [
    imagePreview,
    setImagePreview,
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
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
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
     INITIAL LOAD

     Same mobile idea:
       id + type
       ↓
       PRIMARY → profiles
       CHILD   → child_profiles

     Web additionally supports:
       no id/type
       ↓
       resolve logged-in PRIMARY
  ============================================================ */

  useEffect(() => {
    loadProfile();
  }, [
    requestedId,
    requestedType,
  ]);

  const loadProfile =
    async () => {
      try {
        setLoading(true);

        setError(null);

        let targetId =
          requestedId;

        let targetType:
          ProfileType =
          requestedType ===
          "CHILD"
            ? "CHILD"
            : "PRIMARY";

        /*
         * ==================================
         * NO PARAMS:
         * find authenticated PRIMARY profile
         * ==================================
         */

        if (!targetId) {
          const {
            data:
              userData,
            error:
              userError,
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

          const {
            data:
              primary,
            error:
              primaryError,
          } =
            await supabase
              .from(
                "profiles"
              )
              .select("*")
              .eq(
                "auth_user_id",
                user.id
              )
              .single();

          if (
            primaryError
          ) {
            throw primaryError;
          }

          if (!primary) {
            throw new Error(
              "Primary profile not found."
            );
          }

          targetId =
            primary.id;

          targetType =
            "PRIMARY";

          populateForm(
            primary
          );

          setProfileId(
            primary.id
          );

          setProfileType(
            "PRIMARY"
          );

          return;
        }

        /*
         * ==================================
         * PARAMETER BASED PROFILE
         * ==================================
         */

        let data:
          EditableProfile | null =
          null;

        if (
          targetType ===
          "PRIMARY"
        ) {
          const {
            data:
              primary,
            error:
              primaryError,
          } =
            await supabase
              .from(
                "profiles"
              )
              .select("*")
              .eq(
                "id",
                targetId
              )
              .single();

          if (
            primaryError
          ) {
            throw primaryError;
          }

          data =
            primary;
        } else {
          const {
            data:
              child,
            error:
              childError,
          } =
            await supabase
              .from(
                "child_profiles"
              )
              .select("*")
              .eq(
                "id",
                targetId
              )
              .single();

          if (
            childError
          ) {
            throw childError;
          }

          data =
            child;
        }

        if (!data) {
          throw new Error(
            "Profile data not found."
          );
        }

        setProfileId(
          targetId
        );

        setProfileType(
          targetType
        );

        populateForm(
          data
        );
      } catch (
        err: any
      ) {
        console.error(
          "LOAD PROFILE ERROR:",
          err
        );

        setError(
          err?.message ||
            "Unable to load profile data."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /* ============================================================
     POPULATE FORM
  ============================================================ */

  const populateForm = (
    data: EditableProfile
  ) => {
    setName(
      data.full_name ||
        ""
    );

    setEmail(
      data.email ||
        ""
    );

    setPhone(
      data.phone ||
        ""
    );

    setAge(
      data.age !==
        null &&
        data.age !==
          undefined
        ? String(
            data.age
          )
        : ""
    );

    setGender(
      data.gender ||
        ""
    );

    const rawImage =
      data.profile_image_url ||
      data.profile_image ||
      null;

    const resolvedImage =
      resolveProfileImage(
        rawImage
      );

    setCurrentImage(
      resolvedImage
    );

    setImagePreview(
      resolvedImage
    );
  };

  /* ============================================================
     SELECT IMAGE
  ============================================================ */

  const handleImageChange =
    (
      event:
        React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target.files?.[0];

      event.target.value =
        "";

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setError(
          "Please select a valid image file."
        );

        return;
      }

      if (
        imagePreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      const preview =
        URL.createObjectURL(
          file
        );

      setSelectedImage(
        file
      );

      setImagePreview(
        preview
      );

      setError(null);
    };

  /* ============================================================
     IMAGE COMPRESSION

     Browser equivalent for clean JPEG upload.
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

          image.onload =
            () => {
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

                if (
                  !context
                ) {
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
                  (
                    blob
                  ) => {
                    URL.revokeObjectURL(
                      objectUrl
                    );

                    if (
                      !blob
                    ) {
                      reject(
                        new Error(
                          "Image conversion failed."
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
                err
              ) {
                URL.revokeObjectURL(
                  objectUrl
                );

                reject(err);
              }
            };

          image.onerror =
            () => {
              URL.revokeObjectURL(
                objectUrl
              );

              reject(
                new Error(
                  "Unable to read the selected image."
                )
              );
            };

          image.src =
            objectUrl;
        }
      );
    };

  /* ============================================================
     UPLOAD IMAGE

     Same mobile path concept:

       primary/{id}/{timestamp}.jpg
       child/{id}/{timestamp}.jpg
  ============================================================ */

  const uploadImage =
    async (
      file: File
    ): Promise<string> => {
      if (!profileId) {
        throw new Error(
          "Profile ID missing."
        );
      }

      const {
        data: userData,
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!userData.user) {
        throw new Error(
          "User not found."
        );
      }

      const blob =
        await compressImage(
          file
        );

      const path =
        `${profileType.toLowerCase()}/${profileId}/${Date.now()}.jpg`;

      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            "profile-images"
          )
          .upload(
            path,
            blob,
            {
              contentType:
                "image/jpeg",

              upsert:
                true,
            }
          );

      if (
        uploadError
      ) {
        throw uploadError;
      }

      const {
        data:
          publicData,
      } =
        supabase.storage
          .from(
            "profile-images"
          )
          .getPublicUrl(
            path
          );

      if (
        !publicData?.publicUrl
      ) {
        throw new Error(
          "Unable to generate image URL."
        );
      }

      return `${publicData.publicUrl}?t=${Date.now()}`;
    };

  /* ============================================================
     SAVE PROFILE

     Same mobile logic:
       selected new image?
       ↓
       upload
       ↓
       PRIMARY → profiles
       CHILD → child_profiles
  ============================================================ */

  const handleUpdate =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (!profileId) {
        setError(
          "Profile ID is missing."
        );

        return;
      }

      if (
        !name.trim()
      ) {
        setError(
          "Full name is required."
        );

        return;
      }

      try {
        setSaving(true);

        setError(null);

        setSuccessMessage(
          null
        );

        let imageUrl =
          currentImage;

        /*
         * New browser file selected.
         */

        if (
          selectedImage
        ) {
          imageUrl =
            await uploadImage(
              selectedImage
            );
        }

        const payload = {
          full_name:
            name.trim(),

          email:
            email.trim(),

          phone:
            phone.trim(),

          age:
            age
              ? Number(
                  age
                )
              : null,

          gender,

          profile_image:
            imageUrl,

          profile_image_url:
            imageUrl,

          updated_at:
            new Date().toISOString(),
        };

        /* ============================
           PRIMARY
        ============================ */

        if (
          profileType ===
          "PRIMARY"
        ) {
          const {
            error:
              updateError,
          } =
            await supabase
              .from(
                "profiles"
              )
              .update(
                payload
              )
              .eq(
                "id",
                profileId
              );

          if (
            updateError
          ) {
            throw updateError;
          }
        }

        /* ============================
           CHILD
        ============================ */

        else {
          const {
            error:
              updateError,
          } =
            await supabase
              .from(
                "child_profiles"
              )
              .update(
                payload
              )
              .eq(
                "id",
                profileId
              );

          if (
            updateError
          ) {
            throw updateError;
          }
        }

        setCurrentImage(
          imageUrl
        );

        setImagePreview(
          imageUrl
        );

        setSelectedImage(
          null
        );

        setSuccessMessage(
          "Profile updated successfully."
        );

        window.setTimeout(
          () => {
            navigate(
              "/profile",
              {
                replace:
                  true,
              }
            );
          },
          500
        );
      } catch (
        err: any
      ) {
        console.error(
          "SAVE PROFILE ERROR:",
          err
        );

        setError(
          err?.message ||
            "Unable to update profile."
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-11 h-11 rounded-full border-4 border-primary/20" />

          <div className="absolute inset-0 w-11 h-11 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>

        <p className="text-xs text-primary font-black uppercase tracking-wider">
          Loading Profile...
        </p>
      </div>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-primary/[0.025] blur-3xl" />

        <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-primary/[0.02] blur-3xl" />
      </div>

      <div className="relative min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="border-b border-border pb-6">
          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              navigate(
                "/profile"
              )
            }
            className="flex items-center gap-1.5 text-xs font-bold text-textMuted hover:text-primary transition-colors mb-3 disabled:opacity-50"
          >
            <ArrowLeft
              size={14}
            />

            Back to Profile
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                {profileType ===
                "PRIMARY"
                  ? "Primary Account"
                  : "Family Profile"}
              </div>

              <h1 className="mt-1 text-3xl font-black text-white tracking-tight">
                Edit Profile
              </h1>

              <p className="text-xs text-textSecondary mt-1">
                Update personal
                information and
                profile image
              </p>
            </div>

            <div className="hidden sm:flex w-11 h-11 rounded-xl border border-primary/25 bg-primary/[0.07] items-center justify-center">
              <User
                size={19}
                className="text-primary"
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            STATUS
        ====================================================== */}

        {error && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-error/10 border border-error/30 text-error text-xs font-bold flex items-start gap-3"
          >
            <AlertCircle
              size={18}
              className="shrink-0"
            />

            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-3">
            <CheckCircle2
              size={18}
            />

            {
              successMessage
            }
          </div>
        )}

        {/* =====================================================
            FORM CARD
        ====================================================== */}

        <Card
          variant="surface"
          className="overflow-hidden border-border"
        >
          <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-border bg-surfaceDark/50">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">
                Profile Details
              </p>

              <p className="mt-1 text-sm font-black text-white">
                {profileType ===
                "PRIMARY"
                  ? "Personal Account"
                  : "Child Account"}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full border border-primary/25 bg-primary/[0.07] text-[9px] font-black text-primary">
              {profileType}
            </span>
          </div>

          <form
            onSubmit={
              handleUpdate
            }
            className="p-6 sm:p-8 space-y-6"
          >
            {/* =================================================
                PROFILE IMAGE
            ================================================== */}

            <div className="flex flex-col items-center text-center pb-6 border-b border-border">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl border-2 border-primary bg-surfaceDark overflow-hidden flex items-center justify-center shadow-xl shadow-amber-500/10">
                  {imagePreview ? (
                    <img
                      key={
                        imagePreview
                      }
                      src={
                        imagePreview
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User
                      size={42}
                      className="text-textMuted"
                    />
                  )}
                </div>

                <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-primary border-4 border-surface flex items-center justify-center">
                  <Camera
                    size={14}
                    className="text-black"
                  />
                </div>
              </div>

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="image/*"
                disabled={
                  saving
                }
                onChange={
                  handleImageChange
                }
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  saving
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
                icon={
                  <Camera
                    size={14}
                  />
                }
                className="mt-4"
              >
                CHANGE IMAGE
              </Button>

              {selectedImage && (
                <p className="mt-2 text-[9px] font-bold text-emerald-400">
                  New image selected
                </p>
              )}
            </div>

            {/* =================================================
                PERSONAL DETAILS
            ================================================== */}

            <div>
              <p className="mb-4 text-[9px] font-black uppercase tracking-[0.16em] text-primary">
                Personal
                Information
              </p>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(
                    e
                  ) => {
                    setName(
                      e.target.value
                    );

                    setError(
                      null
                    );
                  }}
                  placeholder="Enter full name"
                  icon={
                    <User
                      size={18}
                    />
                  }
                  disabled={
                    saving
                  }
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(
                    e
                  ) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="Enter email address"
                  icon={
                    <Mail
                      size={18}
                    />
                  }
                  disabled={
                    saving
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={(
                      e
                    ) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    placeholder="+91 98765 43210"
                    icon={
                      <Phone
                        size={18}
                      />
                    }
                    disabled={
                      saving
                    }
                  />

                  <Input
                    label="Age"
                    type="number"
                    value={age}
                    onChange={(
                      e
                    ) =>
                      setAge(
                        e.target.value
                      )
                    }
                    placeholder="e.g. 28"
                    min="1"
                    max="120"
                    disabled={
                      saving
                    }
                  />
                </div>

                {/* Gender */}

                <div className="space-y-1.5">
                  <label className="block text-xs font-black tracking-wider text-primary uppercase">
                    Gender
                  </label>

                  <div className="relative">
                    <select
                      value={
                        gender
                      }
                      onChange={(
                        e
                      ) =>
                        setGender(
                          e.target.value
                        )
                      }
                      disabled={
                        saving
                      }
                      className="w-full bg-surfaceDark text-white border border-border rounded-2xl px-4 py-3.5 pr-11 text-sm appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option
                        value=""
                        className="bg-surfaceDark text-textMuted"
                      >
                        Select
                        Gender
                      </option>

                      <option
                        value="Male"
                        className="bg-surfaceDark text-white"
                      >
                        Male
                      </option>

                      <option
                        value="Female"
                        className="bg-surfaceDark text-white"
                      >
                        Female
                      </option>

                      <option
                        value="Others"
                        className="bg-surfaceDark text-white"
                      >
                        Others
                      </option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textMuted"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                INFO
            ================================================== */}

            <div className="rounded-2xl border border-border bg-surfaceDark p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl border border-primary/25 bg-background flex items-center justify-center shrink-0">
                  <ShieldCheck
                    size={16}
                    className="text-primary"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white">
                    {profileType ===
                    "PRIMARY"
                      ? "Primary Profile"
                      : "Child Profile"}
                  </p>

                  <p className="mt-1 text-[10px] leading-relaxed text-textMuted">
                    Changes made
                    here update the
                    same profile
                    record used by
                    Kshurak survey,
                    scanner and
                    personalized AI
                    experiences.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================== */}

            <div className="pt-5 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={
                  saving
                }
                onClick={() =>
                  navigate(
                    "/profile"
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={
                  saving
                }
                disabled={
                  saving
                }
                icon={
                  <Save
                    size={16}
                  />
                }
                className="px-8 font-black"
              >
                SAVE PROFILE
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditProfilePage;