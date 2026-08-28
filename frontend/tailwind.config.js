/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--nuvora-background) / <alpha-value>)",
        obsidian: "rgb(var(--nuvora-obsidian) / <alpha-value>)",
        "deep-surface": "rgb(var(--nuvora-deep-surface) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--nuvora-surface) / <alpha-value>)",
          low: "rgb(var(--nuvora-surface-low) / <alpha-value>)",
          container: "rgb(var(--nuvora-surface-container) / <alpha-value>)",
          high: "rgb(var(--nuvora-surface-high) / <alpha-value>)",
          highest: "rgb(var(--nuvora-surface-highest) / <alpha-value>)",
          elevated: "rgb(var(--nuvora-surface-elevated) / <alpha-value>)",
        },
        lime: {
          DEFAULT: "rgb(var(--nuvora-lime) / <alpha-value>)",
          soft: "rgb(var(--nuvora-lime-soft) / <alpha-value>)",
        },
        accent: "rgb(var(--nuvora-accent) / <alpha-value>)",
        "text-primary": "rgb(var(--nuvora-on-surface) / <alpha-value>)",
        "text-muted": "rgb(var(--nuvora-on-surface-variant) / <alpha-value>)",
        outline: "rgb(var(--nuvora-outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--nuvora-outline-variant) / <alpha-value>)",
      },
      fontFamily: {
        display: ['"Sora"', "system-ui", "sans-serif"],
        sans: ['"Manrope"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      fontSize: {
        display: ["72px", { lineHeight: "80px", letterSpacing: "-0.02em", fontWeight: "600" }],
        h1: ["56px", { lineHeight: "64px", letterSpacing: "-0.01em", fontWeight: "600" }],
        h2: ["40px", { lineHeight: "48px", fontWeight: "500" }],
        h3: ["28px", { lineHeight: "36px", fontWeight: "500" }],
        h4: ["22px", { lineHeight: "28px", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-sm": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};
