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
        slate: {
          50: 'var(--bg-primary-light)',
          100: 'var(--bg-secondary-light)',
          200: 'var(--border-light)',
          300: 'var(--text-tertiary-light)',
          400: 'var(--text-tertiary-light)',
          500: 'var(--text-secondary-light)',
          600: 'var(--text-secondary-light)',
          700: 'var(--text-primary-light)',
          800: 'var(--border-light)',
          900: 'var(--text-primary-light)',
          950: 'var(--bg-primary-light)',
        },
        brand: {
          50: 'var(--bg-primary-light)',
          100: 'var(--bg-secondary-light)',
          200: 'var(--border-light)',
          300: 'var(--primary-light)',
          400: 'var(--primary-light)',
          500: 'var(--primary-light)',
          600: 'var(--primary-light)',
          700: 'var(--primary-light)',
          800: 'var(--primary-light)',
          900: 'var(--primary-light)',
        },
        cyber: {
          purple: 'var(--primary-light)',
          blue: 'var(--secondary-light)',
          cyan: 'var(--secondary-light)',
          pink: 'var(--danger-light)',
          yellow: '#fbbf24',
          slate: 'var(--bg-primary-light)',
        },
        emerald: {
          500: 'var(--success-light)',
          600: 'var(--success-light)',
        },
        red: {
          500: 'var(--danger-light)',
          600: 'var(--danger-light)',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Roboto', 'sans-serif'],
        headings: ['Inter', 'Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
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

