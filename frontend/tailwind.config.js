/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--color-ink-soft) / <alpha-value>)",
        "ink-faint": "rgb(var(--color-ink-faint) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          soft: "rgb(var(--color-primary-soft) / <alpha-value>)",
          dark: "rgb(var(--color-primary-dark) / <alpha-value>)",
        },
        mint: {
          DEFAULT: "rgb(var(--color-mint) / <alpha-value>)",
          soft: "rgb(var(--color-mint-soft) / <alpha-value>)",
        },
        coral: {
          DEFAULT: "rgb(var(--color-coral) / <alpha-value>)",
          soft: "rgb(var(--color-coral-soft) / <alpha-value>)",
        },
        amber: {
          DEFAULT: "rgb(var(--color-amber) / <alpha-value>)",
          soft: "rgb(var(--color-amber-soft) / <alpha-value>)",
        },
        lavender: {
          DEFAULT: "rgb(var(--color-lavender) / <alpha-value>)",
          soft: "rgb(var(--color-lavender-soft) / <alpha-value>)",
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
