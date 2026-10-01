/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#F59E0B",
        black: "#000000",
        background: "#070708",
        surface: "#17181A",
        surfaceDark: "#0D0D0E",
        surfaceLight: "#202124",
        thumbnail: "#222326",
        text: "#FFFFFF",
        textSecondary: "#9E9EA7",
        textMuted: "#71717A",
        border: "#27282C",
        borderDark: "#1F2023",
        borderLight: "#3E3F45",
        overlay: "rgba(18,18,20,0.75)",
        glass: "rgba(23,24,26,0.85)",
        glassBorder: "rgba(255,255,255,0.12)",
        heroFade: "rgba(23,24,26,0.4)",
        success: "#22C55E",
        error: "#EF4444",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      screens: {
        tablet: "768px",
        laptop: "1280px",
        desktop: "1440px",
      }
    },
  },
  plugins: [],
}
