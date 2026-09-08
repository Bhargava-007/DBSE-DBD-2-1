/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#fafafa',
          dark: '#09090b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ],
      },
      fontSize: {
        '2xs': '0.6875rem',
      },
      letterSpacing: {
        tightest: '-0.025em',
        tighter: '-0.02em',
        tight: '-0.01em',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
        'card': '0 0 0 1px rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-dark': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.4)',
        'elevated': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'elevated-dark': '0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 16px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
