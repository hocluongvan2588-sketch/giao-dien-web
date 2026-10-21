import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Xanh lá tươi, rõ nét — màu nhấn của Vexim Harvest
        brand: {
          50: "#ecfdf3",
          100: "#d1fae0",
          200: "#a7f0c4",
          300: "#6ee0a0",
          400: "#34c777",
          500: "#12a95c",
          600: "#08894a",
          700: "#086c3d",
          800: "#0b5534",
          900: "#0b462d",
          950: "#022817",
        },
        // Màu chữ / nền tối trung tính
        ink: { DEFAULT: "#0b1210", soft: "#1c2522" },
        earth: { 50: "#fdf8ef", 100: "#f8ecd5", 400: "#e3a347", 500: "#d08a2c", 600: "#b06d1e" },
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      boxShadow: {
        card: "0 1px 2px rgba(11,18,16,.04), 0 1px 1px rgba(11,18,16,.03)",
        lift: "0 2px 4px rgba(11,18,16,.04), 0 12px 32px -8px rgba(11,18,16,.14)",
        glow: "0 0 0 1px rgba(11,18,16,.06), 0 30px 60px -20px rgba(11,18,16,.35)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: { "fade-up": "fade-up .6s cubic-bezier(.2,.7,.2,1) both" },
    },
  },
  plugins: [],
} satisfies Config;
