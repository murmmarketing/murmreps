import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0A",
        surface: "#141414",
        accent: "rgb(var(--accent-rgb, 255 107 53) / <alpha-value>)",
        "text-primary": "#FFFFFF",
        "text-secondary": "#9CA3AF",
        "text-muted": "#6C757D",
        verified: "#1DB954",
        danger: "#EF4444",
        warning: "#F59E0B",
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
        pill: "99px",
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
