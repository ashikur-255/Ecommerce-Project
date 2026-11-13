/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#fda702",
        secondary: "#ebeff2",
        dark: "#02171d",
        light: "#ffffff",
      },

      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },

      boxShadow: {
        card: "2px 2px 10px 4px rgb(14 55 54 / 15%)",
      },
    },
  },

  plugins: [],
};