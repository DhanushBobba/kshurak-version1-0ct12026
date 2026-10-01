import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function useRequireAuth() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const requireAuth = (callback?: () => void) => {
    if (user) {
      callback?.();
      return true;
    }

    localStorage.setItem(
      "kshurak_show_survey_after_login",
      "true"
    );

    navigate("/auth/login");

    return false;
  };

  return {
    requireAuth,
    isAuthenticated: Boolean(user),
  };
}