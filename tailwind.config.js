/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        'card-bg': 'var(--card-bg)',
        purple: 'var(--purple)',
        green: 'var(--green)',
        blue: 'var(--blue)',
      }
    },
    keyframes: {
      shimmer: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' }
      }
    },
    animation: {
      'shimmer': 'shimmer 2s linear infinite'
    }
  },
  plugins: [],
} 