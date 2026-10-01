import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

import { readFileAsDataURL } from "@/utils/imageConverter";

import {
  UserPlus,
  User,
  Mail,
  Phone,
  Camera,
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";

/* ============================================================
   COMPONENT
============================================================ */

export const AddChildPage: React.FC = () => {
  const navigate = useNavigate();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    parentId,
    setParentId,
  ] = useState("");

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    age,
    setAge,
  ] = useState("");

  const [
    gender,
    setGender,
  ] = useState("");

  const [
    imagePreview,
    setImagePreview,
  ] =
    useState<string | null>(
      null
    );

  const [
    imageFile,
    setImageFile,
  ] =
    useState<File | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    uploading,
    setUploading,
  ] = useState(false);

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
     LOAD PARENT PROFILE

     Same mobile flow:
       Supabase auth user
       ↓
       profiles.auth_user_id
       ↓
       parent profile id
  ============================================================ */

  useEffect(() => {
    getParentProfile();
  }, []);

  const getParentProfile =
    async () => {
      try {
        setLoading(true);

        setError(null);

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

        const {
          data,
          error:
          profileError,
        } =
          await supabase
            .from(
              "profiles"
            )
            .select("id")
            .eq(
              "auth_user_id",
              user.id
            )
            .single();

        if (profileError) {
          console.error(
            "PARENT PROFILE ERROR:",
            profileError
          );

          throw profileError;
        }

        if (!data?.id) {
          throw new Error(
            "Parent profile not found."
          );
        }

        setParentId(
          data.id
        );
      } catch (
      error: any
      ) {
        console.error(
          "PARENT FETCH ERROR:",
          error
        );

        setError(
          error?.message ||
          "Unable to find parent profile. Please setup the master profile first."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ============================================================
     FILE SELECTION
  ============================================================ */

  const handleFileChange =
    async (
      event:
        React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target.files?.[0];

      /*
       * Reset so same image can be
       * selected again later.
       */
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

      try {
        setError(null);

        const dataUrl =
          await readFileAsDataURL(
            file
          );

        setImagePreview(
          dataUrl
        );

        setImageFile(
          file
        );
      } catch (
      error
      ) {
        console.error(
          "CHILD IMAGE PREVIEW ERROR:",
          error
        );

        setError(
          "Unable to read the selected child image."
        );
      }
    };

  /* ============================================================
     CHILD IMAGE UPLOAD

     Same mobile storage structure:

     profile-images
       ↓
     children/{authUserId}/child_TIMESTAMP.jpg
  ============================================================ */

  const uploadChildImage =
    async (
      file: File
    ): Promise<string> => {
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
          "User not found."
        );
      }

      /*
       * Browser File can be uploaded
       * directly as Blob/File.
       *
       * Equivalent to mobile:
       * fetch(uri) → arrayBuffer
       */

      const filePath =
        `children/${user.id}/child_${Date.now()}.jpg`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            "profile-images"
          )
          .upload(
            filePath,
            file,
            {
              contentType:
                file.type ||
                "image/jpeg",

              upsert:
                true,
            }
          );

      if (uploadError) {
        console.error(
          "CHILD IMAGE UPLOAD ERROR:",
          uploadError
        );

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
          "Unable to generate child profile image URL."
        );
      }

      return publicUrlData.publicUrl;
    };

  /* ============================================================
     ADD CHILD

     Same mobile business flow:
       validate
       ↓
       optional image upload
       ↓
       child_profiles INSERT
       ↓
       get child id
       ↓
       user_profiles INSERT
       profile_type = CHILD
       is_active = false
       ↓
       profile
  ============================================================ */

  const handleAddChild =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (!parentId) {
        setError(
          "Parent profile not found."
        );

        return;
      }

      /*
       * Same required fields as mobile.
       */

      if (
        !name.trim() ||
        !age ||
        !gender
      ) {
        setError(
          "Please enter child basic details."
        );

        return;
      }

      try {
        setUploading(true);

        setError(null);

        setSuccessMessage(
          null
        );

        /* ============================
           OPTIONAL IMAGE
        ============================ */

        let imageUrl:
          | string
          | null = null;

        if (imageFile) {
          imageUrl =
            await uploadChildImage(
              imageFile
            );
        }

        /* ============================
           CHILD PROFILE INSERT
        ============================ */

        const {
          data: childData,
          error:
          insertError,
        } =
          await supabase
            .from(
              "child_profiles"
            )
            .insert({
              parent_profile_id:
                parentId,

              full_name:
                name.trim(),

              /*
               * Mobile stores email/phone
               * values directly.
               */

              email:
                email.trim(),

              phone:
                phone.trim(),

              age:
                Number(age),

              gender,

              /*
               * Mobile populates BOTH
               * image fields.
               */

              profile_image_url:
                imageUrl,

              profile_image:
                imageUrl,
            })
            .select()
            .single();

        if (insertError) {
          console.error(
            "CHILD INSERT ERROR:",
            insertError
          );

          throw insertError;
        }

        if (!childData) {
          throw new Error(
            "Child profile was not created."
          );
        }

        /* ============================
           USER PROFILE MAPPING

           VERY IMPORTANT:
           This was missing from the
           old Web implementation.
        ============================ */

        const {
          error:
          mappingError,
        } =
          await supabase
            .from(
              "user_profiles"
            )
            .insert({
              parent_id:
                parentId,

              profile_id:
                childData.id,

              profile_type:
                "CHILD",

              /*
               * Same mobile behavior:
               * newly created child is
               * NOT automatically active.
               */

              is_active:
                false,
            });

        if (mappingError) {
          console.error(
            "CHILD PROFILE MAPPING ERROR:",
            mappingError
          );

          throw mappingError;
        }

        setSuccessMessage(
          "Child profile added successfully."
        );

        /*
         * Web equivalent of mobile router.back().
         *
         * Returning directly to Profile is
         * more predictable in browser navigation.
         */

        window.setTimeout(
          () => {
            navigate(
              "/profile",
              {
                replace: true,
              }
            );
          },
          500
        );
      } catch (
      error: any
      ) {
        console.error(
          "ADD CHILD ERROR:",
          error
        );

        setError(
          error?.message ||
          "Failed to add child profile."
        );
      } finally {
        setUploading(
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
        <div className="relative flex items-center justify-center">
          <div className="w-11 h-11 rounded-full border-4 border-primary/20" />

          <div className="absolute w-11 h-11 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>

        <p className="text-xs text-primary font-black uppercase tracking-wider">
          Verifying Account...
        </p>
      </div>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background */}

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
            onClick={() =>
              navigate(
                "/profile"
              )
            }
            className="flex items-center gap-1.5 text-xs font-bold text-textMuted hover:text-primary transition-colors mb-3"
          >
            <ArrowLeft
              size={14}
            />

            Back to Profiles
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.16em]">
                <Users
                  size={14}
                />

                Family Profile
              </div>

              <h1 className="mt-1 text-3xl font-black text-white tracking-tight">
                Add Child Profile
              </h1>

              <p className="text-xs text-textSecondary mt-1 max-w-xl leading-relaxed">
                Create an independent
                facial geometry,
                survey and hairstyle
                profile under your
                primary Kshurak
                account.
              </p>
            </div>

            <div className="hidden sm:flex w-11 h-11 rounded-xl border border-primary/25 bg-primary/[0.07] items-center justify-center text-primary">
              <UserPlus
                size={19}
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
              className="shrink-0 mt-0.5"
            />

            <span>
              {error}
            </span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-3">
            <CheckCircle2
              size={18}
            />

            {successMessage}
          </div>
        )}

        {/* =====================================================
            FORM
        ====================================================== */}

        <Card
          variant="surface"
          className="overflow-hidden border-border"
        >
          {/* Card header */}

          <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-border bg-surfaceDark/50">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.17em] text-primary">
                New Family Member
              </p>

              <p className="mt-1 text-sm font-black text-white">
                Child Profile
                Details
              </p>
            </div>

            <div className="w-9 h-9 rounded-xl border border-primary/25 bg-primary/[0.07] flex items-center justify-center">
              <UserPlus
                size={16}
                className="text-primary"
              />
            </div>
          </div>

          <form
            onSubmit={
              handleAddChild
            }
            className="p-6 sm:p-8 space-y-6"
          >
            {/* =================================================
                AVATAR
            ================================================== */}

            <div className="flex flex-col items-center justify-center text-center space-y-4 pb-6 border-b border-border">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl border-2 border-primary bg-surfaceDark overflow-hidden flex items-center justify-center shadow-xl shadow-amber-500/10">
                  {imagePreview ? (
                    <img
                      src={
                        imagePreview
                      }
                      alt="Child Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User
                      size={42}
                      className="text-textMuted"
                    />
                  )}
                </div>

                <div className="absolute -right-2 -bottom-2 w-9 h-9 rounded-xl bg-primary border-4 border-surface flex items-center justify-center">
                  <Camera
                    size={14}
                    className="text-black"
                  />
                </div>
              </div>

              <div>
                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/*"
                  onChange={
                    handleFileChange
                  }
                  disabled={
                    uploading
                  }
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
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
                >
                  {imagePreview
                    ? "Change Photo"
                    : "Upload Child Photo"}
                </Button>

                <p className="mt-2 text-[9px] text-textMuted">
                  Optional profile
                  image
                </p>
              </div>
            </div>

            {/* =================================================
                BASIC DETAILS
            ================================================== */}

            <div>
              <div className="mb-4">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-primary">
                  Basic Information
                </p>

                <p className="text-xs text-textSecondary mt-1">
                  Name, age and
                  gender are required.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. Leo Morgan"
                  value={name}
                  onChange={(
                    e
                  ) => {
                    setName(
                      e.target.value
                    );

                    if (error) {
                      setError(null);
                    }
                  }}
                  icon={
                    <User
                      size={18}
                    />
                  }
                  disabled={
                    uploading
                  }
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Age"
                    type="number"
                    placeholder="e.g. 8"
                    value={age}
                    onChange={(
                      e
                    ) => {
                      setAge(
                        e.target.value
                      );

                      if (
                        error
                      ) {
                        setError(
                          null
                        );
                      }
                    }}
                    min="1"
                    max="18"
                    disabled={
                      uploading
                    }
                    required
                  />

                  <div className="space-y-1.5 text-left">
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
                        ) => {
                          setGender(
                            e.target.value
                          );

                          if (
                            error
                          ) {
                            setError(
                              null
                            );
                          }
                        }}
                        disabled={
                          uploading
                        }
                        className="w-full bg-surfaceDark text-white border border-border rounded-2xl px-4 py-3.5 pr-11 text-sm appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                        required
                      >
                        <option
                          value=""
                          disabled
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
            </div>

            {/* =================================================
                OPTIONAL CONTACT
            ================================================== */}

            <div className="pt-5 border-t border-border">
              <div className="mb-4">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-primary">
                  Contact
                  Information
                </p>

                <p className="text-xs text-textSecondary mt-1">
                  Optional details
                  for family profile
                  management.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address (Optional)"
                  type="email"
                  placeholder="child@domain.com"
                  value={email}
                  onChange={(
                    e
                  ) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  icon={
                    <Mail
                      size={18}
                    />
                  }
                  disabled={
                    uploading
                  }
                  autoComplete="email"
                />

                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(
                    e
                  ) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  icon={
                    <Phone
                      size={18}
                    />
                  }
                  disabled={
                    uploading
                  }
                  autoComplete="tel"
                />
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
                    Independent AI
                    Profile
                  </p>

                  <p className="mt-1 text-[10px] leading-relaxed text-textMuted">
                    The child profile
                    will maintain its
                    own survey, face
                    scans, geometry
                    metrics and
                    hairstyle
                    recommendations.
                    It will not become
                    active automatically
                    after creation.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================== */}

            <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={
                  uploading
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
                  uploading
                }
                disabled={
                  uploading
                }
                icon={
                  <UserPlus
                    size={16}
                  />
                }
                className="px-8 font-black"
              >
                ADD CHILD PROFILE
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddChildPage;