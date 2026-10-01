import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getProfileByAuthId,
  getChildProfiles,
  getActiveProfile,
  switchActiveProfile as switchServiceProfile,
  ProfileRecord,
  ChildProfileRecord,
} from "@/services/profileService";

export function useProfiles() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [children, setChildren] = useState<ChildProfileRecord[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setChildren([]);
      setActiveProfileId(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profileData = await getProfileByAuthId(user.id);
      setProfile(profileData);

      if (profileData) {
        const [childData, activeData] = await Promise.all([
          getChildProfiles(profileData.id),
          getActiveProfile(profileData.id),
        ]);
        setChildren(childData);
        if (activeData) {
          setActiveProfileId(activeData.profile_id);
        } else {
          setActiveProfileId(profileData.id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profiles", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const switchProfile = async (profileId: string, type: "PRIMARY" | "CHILD") => {
    if (!profile) return;
    await switchServiceProfile(profile.id, profileId, type);
    setActiveProfileId(profileId);
  };

  return {
    profile,
    children,
    activeProfileId,
    loading,
    refresh: fetchProfiles,
    switchProfile,
  };
}
