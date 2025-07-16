const { Title } = require("chart.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    fontFamily: {
      regular: ["Regular"],
    },
    extend: {
      screens: {
        xs: "390px",
        "custom-md": "769px", // Custom md breakpoint
        "custom-md-air": "820px", // Custom md breakpoint
        "custom-1.5xl": "1440px", // Custom md breakpoint
        "ipad-mini": "768px", // iPad Mini (768 x 1024)
        "ipad-air": "820px", // iPad Air (820 x 1180)
        "ipad-pro": "1024px", // iPad Pro (1024 x 1366)
        "3xl-custom": "1855px",
      },
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
    },
  },
  plugins: [],
};
