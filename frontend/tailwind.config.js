/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F7FB",
        surface: "#FFFFFF",
        ink: "#1B2340",
        "ink-soft": "#5B6478",
        "ink-faint": "#9AA3B8",
        border: "#E4E9F2",
        primary: {
          DEFAULT: "#3457D5",
          soft: "#EAF0FF",
          dark: "#2540A8",
        },
        mint: {
          DEFAULT: "#0FA98A",
          soft: "#E4F8F2",
        },
        coral: {
          DEFAULT: "#FF6B5C",
          soft: "#FFEDEA",
        },
        amber: {
          DEFAULT: "#F5A623",
          soft: "#FFF4E0",
        },
        lavender: {
          DEFAULT: "#8B7BE0",
          soft: "#EFECFC",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 24px rgba(27, 35, 64, 0.06)",
        card: "0 8px 30px rgba(27, 35, 64, 0.08)",
        glow: "0 0 0 4px rgba(52, 87, 213, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(20px,-15px) scale(1.05)" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(52,87,213,0.35)" },
          "70%": { boxShadow: "0 0 0 14px rgba(52,87,213,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(52,87,213,0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        drift: "drift 10s ease-in-out infinite",
        pulseRing: "pulseRing 2.2s ease-out infinite",
        marquee: "marquee 35s linear infinite",
      },
    },
  },
  plugins: [],
};
