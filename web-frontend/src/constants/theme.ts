import { COLORS } from "./colors";

export const Colors = {
  light: {
    text: COLORS.black,
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: COLORS.textSecondary,
  },
  dark: {
    text: COLORS.text,
    background: COLORS.background,
    backgroundElement: COLORS.surface,
    backgroundSelected: COLORS.surfaceDark,
    textSecondary: COLORS.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 1440;

export const THEME = {
  colors: COLORS,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 999,
  },
  text: {
    title: 28,
    heading: 22,
    subheading: 18,
    body: 15,
    small: 13,
    caption: 11,
  },
};
