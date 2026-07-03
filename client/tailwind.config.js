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
          50: '#0D0D1A', // Base background
          100: '#15152E', // Neubrutalism Card Background
          200: '#2A2A3D', // Subtle grey border
          300: '#94A3B8', // Muted text
          350: '#CBD5E1', // Highly visible muted text (new!)
          355: '#94A3B8', // Secondary muted text (new!)
          400: '#94A3B8', // Muted text
          500: '#CBD5E1', // Body text
          600: '#CBD5E1', // Body text
          700: '#FFFFFF', // High contrast text
          800: '#2A2A3D', // Subtle grey border
          900: '#FFFFFF', // Heading text
          950: '#0D0D1A', // Base background
        },
        brand: {
          50: '#0D0D1A',
          100: '#15152E',
          200: '#2A2A3D',
          300: '#38BDF8', // Sky Blue secondary
          400: '#38BDF8',
          500: '#38BDF8',
          600: '#38BDF8',
          700: '#38BDF8',
          800: '#38BDF8',
          900: '#38BDF8',
        },
        cyber: {
          purple: '#8b5cf6', // Tertiary
          blue: '#38BDF8', // sky blue
          cyan: '#38BDF8',
          green: '#00D68F', // Mint Green primary action
          red: '#EF4444', // Red-500 warning alert
          slate: '#0D0D1A',
        },
        emerald: {
          500: '#00D68F',
          600: '#059669',
        },
        red: {
          500: '#EF4444',
          600: '#DC2626',
        }
      },
      fontSize: {
        'xs': ['13.5px', '18px'],
        'sm': ['15.5px', '22px'],
        'base': ['17.5px', '26px'],
        'lg': ['19.5px', '29px'],
        'xl': ['22px', '32px'],
        '2xl': ['26.5px', '36px'],
        '3xl': ['32px', '42px'],
        '4xl': ['38px', '48px'],
        '5xl': ['50px', '60px'],
        '6xl': ['62px', '72px'],
        '7xl': ['74px', '84px'],
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        headings: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'brutal-blue': '4px 4px 0px 0px #38BDF8',
        'brutal-green': '4px 4px 0px 0px #00D68F',
        'brutal-red': '4px 4px 0px 0px #EF4444',
        'brutal-white': '4px 4px 0px 0px #FFFFFF',
        'brutal-blue-hover': '6px 6px 0px 0px #38BDF8',
        'brutal-green-hover': '6px 6px 0px 0px #00D68F',
        'brutal-white-hover': '6px 6px 0px 0px #FFFFFF',
        'glow-purple': '0 0 15px rgba(168, 85, 247, 0.1)',
        'glow-blue': '0 0 15px rgba(56, 189, 248, 0.1)',
        'glow-green': '0 0 15px rgba(0, 214, 143, 0.1)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pulse-border': 'pulseBorder 2s ease-in-out infinite',
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
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(239, 68, 68, 0.4)' },
          '50%': { borderColor: 'rgba(239, 68, 68, 1)' },
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
