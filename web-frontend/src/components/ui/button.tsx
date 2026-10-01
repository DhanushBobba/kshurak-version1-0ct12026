import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "outline" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-bold tracking-wide transition-all rounded-xl cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5",
  }[size];

  const variantClasses = {
    primary:
      "bg-primary text-black hover:bg-amber-400 active:bg-amber-500 shadow-lg shadow-amber-500/20 font-black",
    outline:
      "border border-primary text-primary bg-transparent hover:bg-primary/10 active:bg-primary/20",
    secondary:
      "bg-surfaceLight text-white hover:bg-[#2a2c31] active:bg-[#33353b] border border-border",
    danger:
      "bg-error text-white hover:bg-red-600 active:bg-red-700 shadow-lg shadow-red-500/20",
    ghost:
      "text-textSecondary hover:text-white hover:bg-white/5 active:bg-white/10",
  }[variant];

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
