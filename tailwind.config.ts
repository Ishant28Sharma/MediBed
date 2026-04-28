import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        headline: ["var(--font-manrope)", "sans-serif"],
      },
      colors: {
        background: "#050505",
        surface: {
          DEFAULT: "rgba(20, 20, 20, 0.6)",
          low: "rgba(25, 25, 25, 0.5)",
          container: "rgba(30, 30, 30, 0.4)",
          high: "rgba(35, 35, 35, 0.3)",
          highest: "rgba(40, 40, 40, 0.2)",
        },
        primary: {
          DEFAULT: "#a855f7",
          dim: "#c084fc",
        },
        'on-primary': "#ffffff",
        secondary: "#d946ef",
        tertiary: "#2dd4bf",
        error: "#ef4444",
        'on-error': "#ffffff",
        'on-surface': "#ffffff",
        'on-surface-variant': "#a1a1aa",
        'outline-variant': "rgba(255, 255, 255, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
