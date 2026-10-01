import React, {
    useEffect,
    useState,
} from "react";

import HomePage from "./home/HomePage";

import { useAuth } from "@/context/AuthContext";

export default function Index() {
    const [
        splashFinished,
        setSplashFinished,
    ] = useState(false);

    const {
        loading,
    } = useAuth();

    /* ============================================================
       SPLASH TIMER
    ============================================================ */

    useEffect(() => {
        const timer =
            window.setTimeout(
                () => {
                    setSplashFinished(
                        true
                    );
                },
                3000
            );

        return () => {
            window.clearTimeout(
                timer
            );
        };
    }, []);

    /* ============================================================
       SPLASH / AUTH LOADING
    ============================================================ */

    if (
        !splashFinished ||
        loading
    ) {
        return (
            <div
                className="
          min-h-screen
          bg-background
          flex
          flex-col
          items-center
          justify-center
          px-6
        "
            >
                <img
                    src="/assets/images/logo.png"
                    alt="Kshurak"
                    className="
            w-[180px]
            sm:w-[210px]
            h-auto
            object-contain
          "
                    draggable={false}
                />

                <div
                    className="
            mt-8
            w-9
            h-9
            rounded-full
            border-[3px]
            border-primary/20
            border-t-primary
            animate-spin
          "
                />

                <p
                    className="
            mt-4
            text-[10px]
            font-black
            tracking-[0.2em]
            text-primary
            uppercase
          "
                >
                    Kshurak
                </p>
            </div>
        );
    }

    /* ============================================================
       HOME
    ============================================================ */

    return (
        <HomePage />
    );
}