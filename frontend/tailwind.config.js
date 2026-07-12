/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'primary-light': '#818cf8',
        'primary-dark': '#4f46e5',
        secondary: '#06b6d4',
        'ht-bg': '#080b14',
        'ht-surface': '#111827',
        'ht-surface2': '#1f2937',
        'ht-surface3': '#374151',
        'ht-green': '#10b981',
        'ht-danger': '#ef4444',
        'ht-warning': '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 3s ease infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(99,102,241,0.3)',
        'glow-green': '0 0 20px rgba(16,185,129,0.3)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.3)',
      },
    },
  },
  plugins: [],
}
