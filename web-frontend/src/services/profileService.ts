import { supabase } from "@/lib/supabase";

export interface ProfileRecord {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
  profile_image?: string | null;
  profile_image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChildProfileRecord {
  id: string;
  parent_profile_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  age: number;
  gender: string;
  profile_image_url?: string | null;
  created_at?: string;
}

export interface HistoryRecord {
  id: string;
  profile_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  activity_date: string;
}

export const getProfileByAuthId = async (authUserId: string): Promise<ProfileRecord | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    console.error("Profile fetch error", error);
    return null;
  }
  return data;
};

export const getChildProfiles = async (parentProfileId: string): Promise<ChildProfileRecord[]> => {
  const { data, error } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("parent_profile_id", parentProfileId);

  if (error) {
    console.error("Child profile fetch error", error);
    return [];
  }
  return data || [];
};

export const getActiveProfile = async (parentProfileId: string) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("parent_id", parentProfileId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Active profile fetch error", error);
    return null;
  }
  return data;
};

export const switchActiveProfile = async (
  parentId: string,
  profileId: string,
  type: "PRIMARY" | "CHILD"
) => {
  await supabase
    .from("user_profiles")
    .update({ is_active: false })
    .eq("parent_id", parentId);

  const { error } = await supabase
    .from("user_profiles")
    .update({
      profile_id: profileId,
      profile_type: type,
      is_active: true,
    })
    .eq("parent_id", parentId);

  if (error) throw error;
};

export const updateProfile = async (profileId: string, updates: Partial<ProfileRecord>) => {
  const { error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (error) throw error;
};

export const addChildProfile = async (
  parentProfileId: string,
  child: {
    full_name: string;
    email?: string;
    phone?: string;
    age: number;
    gender: string;
    profile_image_url?: string | null;
  }
) => {
  const { data, error } = await supabase
    .from("child_profiles")
    .insert({
      parent_profile_id: parentProfileId,
      ...child,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getProfileHistory = async (profileId: string): Promise<HistoryRecord[]> => {
  const { data, error } = await supabase
    .from("profile_history")
    .select("*")
    .eq("profile_id", profileId)
    .order("activity_date", { ascending: false });

  if (error) {
    console.error("History fetch error", error);
    return [];
  }
  return data || [];
};

export const addProfileHistory = async (
  profileId: string,
  activityType: string,
  title: string,
  description: string
) => {
  const { error } = await supabase.from("profile_history").insert({
    profile_id: profileId,
    activity_type: activityType,
    title,
    description,
    activity_date: new Date().toISOString(),
  });

  if (error) {
    console.error("History insert error", error);
  }
};
