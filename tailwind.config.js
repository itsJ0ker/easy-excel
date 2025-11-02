/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        excel: {
          green: '#107C41',
          'green-light': '#16A085',
          'green-dark': '#0D5D31',
        }
      }
    },
  },
  plugins: [],
}