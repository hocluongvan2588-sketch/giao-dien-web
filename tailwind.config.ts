import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f8f2",
          100: "#dcefe0",
          200: "#bbdfc4",
          300: "#8ec79f",
          400: "#5ea876",
          500: "#3c8b57",
          600: "#2b6f44",
          700: "#235939",
          800: "#1e4730",
          900: "#193b29",
          950: "#0c2116",
        },
        earth: { 50: "#fbf7f0", 100: "#f4ead7", 400: "#d39b4a", 500: "#c4822f", 600: "#a86826" },
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      boxShadow: { card: "0 1px 2px rgba(16,40,24,.06), 0 8px 24px -12px rgba(16,40,24,.18)" },
    },
  },
  plugins: [],
} satisfies Config;
