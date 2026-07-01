import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          50: "#eefbf8",
          100: "#d4f3ec",
          500: "#178f82",
          600: "#0f746d",
          700: "#0d5d59",
          900: "#123f3d"
        },
        canopy: {
          500: "#3f8f4b",
          700: "#276336"
        },
        clay: {
          100: "#f4eadf",
          500: "#b66a3c"
        },
        ink: "#13201f"
      },
      boxShadow: {
        soft: "0 24px 60px rgba(18, 63, 61, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
