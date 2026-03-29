/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        nba: {
          red: "#E63030",
          orange: "#FF8C00",
        },
      },
    },
  },
  plugins: [],
};
