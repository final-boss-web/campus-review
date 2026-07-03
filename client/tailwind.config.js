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
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#85a3ff',
          500: '#4d70ff',
          600: '#2642ff',
          700: '#152cd6',
          800: '#1324ad',
          900: '#16238a',
        },
        cyber: {
          purple: '#a855f7',
          blue: '#06b6d4',
          cyan: '#22d3ee',
          pink: '#f43f5e',
          yellow: '#fbbf24',
          slate: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-purple': '0 0 15px rgba(168, 85, 247, 0.4)',
        'glow-blue': '0 0 15px rgba(6, 182, 212, 0.4)',
        'glow-pink': '0 0 15px rgba(244, 63, 94, 0.4)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'text-gradient': 'textGradient 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.03)' },
        },
        gradientShift: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        textGradient: {
          '0%, 100%': { 'background-size': '200% auto', 'background-position': '0% center' },
          '50%': { 'background-size': '200% auto', 'background-position': '200% center' },
        }
      }
    },
  },
  plugins: [],
}

