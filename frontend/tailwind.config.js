/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#111318",
        "deep-surface": "#0C0E13",
        surface: {
          DEFAULT: "#1A1C21",
          low: "#16181D",
          high: "#22252B",
          elevated: "#282A30",
        },
        lime: {
          DEFAULT: "#B8F34A",
          soft: "#9FD830",
        },
        "text-primary": "#E2E2E9",
        "text-muted": "#C3C9B0",
        outline: "#8D937C",
        "outline-variant": "#434936",
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
    },
  },
  plugins: [],
};
