import React, {
    useEffect,
} from "react";
import {
    useNavigate,
} from "react-router-dom";
import {
    Sparkles,
    X,
} from "lucide-react";

interface Props {
    visible: boolean;
    onClose: () => void;
}

const SurveyPopup: React.FC<Props> = ({
    visible,
    onClose,
}) => {
    const navigate =
        useNavigate();

    /* ============================================================
       START SURVEY
    ============================================================ */

    const startSurvey = () => {
        onClose();

        navigate("/survey");
    };

    /* ============================================================
       SKIP SURVEY
       User selected NO / SKIP
       Return to Home
    ============================================================ */

    const skipSurvey = () => {
        onClose();

        navigate("/");
    };

    /* ============================================================
       ESCAPE KEY SUPPORT
    ============================================================ */

    useEffect(() => {
        if (!visible) {
            return;
        }

        const handleEscape = (
            event: KeyboardEvent
        ) => {
            if (
                event.key ===
                "Escape"
            ) {
                skipSurvey();
            }
        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        const previousOverflow =
            document.body.style
                .overflow;

        document.body.style.overflow =
            "hidden";

        return () => {
            window.removeEventListener(
                "keydown",
                handleEscape
            );

            document.body.style.overflow =
                previousOverflow;
        };
    }, [visible]);

    /* ============================================================
       HIDDEN
    ============================================================ */

    if (!visible) {
        return null;
    }

    /* ============================================================
       WEB MODAL
    ============================================================ */

    return (
        <div
            className="
        fixed
        inset-0
        z-[1000]
        flex
        items-center
        justify-center
        bg-black/75
        backdrop-blur-sm
        px-4
      "
            role="dialog"
            aria-modal="true"
            aria-labelledby="survey-popup-title"
        >
            <div
                className="
          relative
          w-full
          max-w-[460px]
          overflow-hidden
          rounded-[28px]
          border
          border-border
          bg-surface
          p-6
          sm:p-8
          text-center
          shadow-2xl
          shadow-black/40
        "
            >
                {/* Background glow */}

                <div
                    className="
            pointer-events-none
            absolute
            -top-24
            left-1/2
            h-52
            w-52
            -translate-x-1/2
            rounded-full
            bg-primary/[0.08]
            blur-3xl
          "
                />

                {/* ===================================================
            CLOSE BUTTON
        ==================================================== */}

                <button
                    type="button"
                    onClick={skipSurvey}
                    aria-label="Close survey popup"
                    className="
            absolute
            right-4
            top-4
            z-10
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-border
            bg-surfaceDark
            text-textMuted
            transition-all
            hover:border-primary/30
            hover:text-primary
          "
                >
                    <X size={16} />
                </button>

                {/* ===================================================
            ICON
        ==================================================== */}

                <div
                    className="
            relative
            mx-auto
            flex
            h-[62px]
            w-[62px]
            items-center
            justify-center
            rounded-full
            border
            border-primary
            bg-surfaceDark
            shadow-lg
            shadow-amber-500/10
          "
                >
                    <Sparkles
                        size={26}
                        className="text-primary"
                    />
                </div>

                {/* ===================================================
            TITLE
        ==================================================== */}

                <h2
                    id="survey-popup-title"
                    className="
            relative
            mt-5
            text-2xl
            sm:text-[26px]
            font-black
            tracking-tight
            text-white
          "
                >
                    Discover Your Perfect
                    Style
                </h2>

                {/* ===================================================
            DESCRIPTION
        ==================================================== */}

                <p
                    className="
            relative
            mx-auto
            mt-3
            max-w-sm
            text-sm
            leading-6
            text-textSecondary
          "
                >
                    Would you like to
                    complete our{" "}
                    <span className="font-black text-primary">
                        5 Step Hair Survey
                    </span>{" "}
                    for personalized
                    hairstyle
                    recommendations?
                </p>

                {/* ===================================================
            INFO CARD
        ==================================================== */}

                <div
                    className="
            relative
            mt-5
            rounded-2xl
            border
            border-border
            bg-surfaceDark
            px-4
            py-3
          "
                >
                    <p
                        className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.15em]
              text-primary
            "
                    >
                        Personalized
                        Recommendations
                    </p>

                    <p
                        className="
              mt-1
              text-[10px]
              leading-relaxed
              text-textMuted
            "
                    >
                        Your survey responses
                        help Kshurak understand
                        your hair texture,
                        density, preferred
                        length, maintenance
                        needs and scalp
                        profile.
                    </p>
                </div>

                {/* ===================================================
            YES / START SURVEY
        ==================================================== */}

                <button
                    type="button"
                    onClick={startSurvey}
                    className="
            relative
            mt-6
            flex
            h-[54px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-primary
            px-5
            text-sm
            font-black
            tracking-wide
            text-black
            shadow-lg
            shadow-amber-500/20
            transition-all
            hover:-translate-y-0.5
            hover:shadow-xl
            hover:shadow-amber-500/25
            active:translate-y-0
          "
                >
                    <Sparkles size={17} />

                    YES, START SURVEY
                </button>

                {/* ===================================================
            NO / SKIP
        ==================================================== */}

                <button
                    type="button"
                    onClick={skipSurvey}
                    className="
            relative
            mt-2
            flex
            h-[46px]
            w-full
            items-center
            justify-center
            rounded-xl
            border
            border-border
            bg-surfaceDark
            text-sm
            font-bold
            text-textMuted
            transition-all
            hover:border-borderLight
            hover:text-white
          "
                >
                    NO, SKIP FOR NOW
                </button>

                {/* ===================================================
            FOOTER
        ==================================================== */}

                <p
                    className="
            relative
            mt-4
            text-[8px]
            font-black
            uppercase
            tracking-[0.18em]
            text-textMuted
          "
                >
                    KSHURAK •
                    PERSONALIZED AI
                </p>
            </div>
        </div>
    );
};

export default SurveyPopup;