import { useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";


export default function useRequireAuth() {

    const router = useRouter();

    const { user } = useAuth();



    const requireAuth = (
        callback?: () => void
    ) => {


        if (user) {

            callback?.();

        }
        else {

            router.push("/auth/login");

        }


    };


    return {
        requireAuth
    };

}