/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '6px',
        lg: '6px',
      },
      colors: {
        accent: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          light: '#eef2ff',
        }
      }
    },
  },
  plugins: [],
}
