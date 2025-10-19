/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/Components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Ensure cream colors are always included
    'from-cream-50',
    'via-cream-100', 
    'to-cream-200',
    'from-cream-300',
    'via-cream-400',
    'to-cream-500',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fefdf8',
          100: '#fdf9f0',
          200: '#faf2e1',
          300: '#f6e8c7',
          400: '#f0d9a8',
          500: '#e8c885',
          600: '#d4b062',
          700: '#b8954a',
          800: '#9a7a3d',
          900: '#7d6233',
        },
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
      },
      animation: {
        blob: "blob 7s infinite",
      },
    },
  },
  plugins: [],
};
