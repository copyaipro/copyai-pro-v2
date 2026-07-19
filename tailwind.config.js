/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Pulse-style dark theme
        ink: {
          900: "#1a1a1a", // page background
          800: "#232323", // raised background (sidebar, header)
          700: "#2d2d2d", // cards
          600: "#3a3a3a", // borders / hover surfaces
          500: "#4a4a4a", // strong borders
        },
        gold: {
          300: "#E8CD6E", // hover / highlights
          400: "#DEBE52",
          500: "#D4AF37", // primary accent
          600: "#B8962E", // pressed
          700: "#8f7524",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4)",
        glow: "0 0 24px rgba(212,175,55,0.15)",
      },
    },
  },
  plugins: [],
};
