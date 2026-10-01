import { supabase } from "@/lib/supabase";

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  age: string | number;
  gender: string;
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUp(data: SignUpData) {
    const { email, password, username, age, gender } = data;

    const { data: userData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: username,
          age,
          gender,
        },
      },
    });

    if (error) {
      console.error("SIGNUP ERROR", error);
      throw error;
    }

    if (userData.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          auth_user_id: userData.user.id,
          full_name: username,
          email: email,
          age: Number(age),
          gender: gender,
          profile_image: null,
        })
        .select()
        .single();

      if (profileError) {
        console.error("PROFILE INSERT ERROR", profileError);
        throw profileError;
      }

      if (profile) {
        const { error: activeError } = await supabase
          .from("user_profiles")
          .insert({
            parent_id: profile.id,
            profile_type: "PRIMARY",
            profile_id: profile.id,
            is_active: true,
          });

        if (activeError) {
          console.error("USER PROFILE INSERT ERROR", activeError);
        }
      }
    }

    return userData;
  },

  async signInWithOAuth(provider: "google" | "facebook") {
    const redirectUrl = window.location.origin;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
      },
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
};
