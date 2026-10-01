import React from "react";

import {
  motion,
  HTMLMotionProps,
} from "framer-motion";

/* ============================================================
   TYPES
============================================================ */

export type CardVariant =
  | "surface"
  | "glass"
  | "bordered"
  | "dark";

export interface CardProps
  extends HTMLMotionProps<"div"> {
  children: React.ReactNode;

  variant?: CardVariant;

  hoverEffect?: boolean;
}

/* ============================================================
   VARIANT STYLES
============================================================ */

const CARD_VARIANTS: Record<
  CardVariant,
  string
> = {
  /* ==========================================================
     Standard application card

     Used for:
     - Profile
     - Scanner
     - Geometry
     - History
     - Try-On
     - Forms
  ========================================================== */

  surface: `
    bg-surface
    border
    border-border
  `,

  /* ==========================================================
     Premium translucent card

     Use mostly for:
     - Hero overlays
     - Floating information
     - Premium highlights
  ========================================================== */

  glass: `
    bg-surface/80
    backdrop-blur-xl
    border
    border-white/10
    shadow-xl
    shadow-black/20
  `,

  /* ==========================================================
     Interactive bordered card

     Useful for:
     - Selectable options
     - Survey options
     - Hairstyle selections
     - Child profile cards
  ========================================================== */

  bordered: `
    bg-surfaceDark
    border
    border-border
    transition-colors
    duration-200
    hover:border-borderLight
  `,

  /* ==========================================================
     Dark secondary information card

     Used for:
     - Security notes
     - Selected hairstyle summary
     - Secondary data
     - Status information
  ========================================================== */

  dark: `
    bg-surfaceDark
    border
    border-borderDark
  `,
};

/* ============================================================
   COMPONENT
============================================================ */

export const Card: React.FC<
  CardProps
> = ({
  children,

  variant = "surface",

  hoverEffect = false,

  className = "",

  ...props
}) => {
    const variantClasses =
      CARD_VARIANTS[variant];

    return (
      <motion.div
        whileHover={
          hoverEffect
            ? {
              y: -4,
              scale: 1.005,
              transition: {
                duration: 0.2,
                ease: "easeOut",
              },
            }
            : undefined
        }
        whileTap={
          hoverEffect
            ? {
              scale: 0.995,
            }
            : undefined
        }
        className={`
        rounded-2xl

        ${variantClasses}

        ${className}
      `}
        {...props}
      >
        {children}
      </motion.div>
    );
  };

Card.displayName =
  "Card";

export default Card;