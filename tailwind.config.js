/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand palette
        'health-teal': '#14b8a6',
        'health-emerald': '#10b981',
        'health-cyan': '#06b6d4',
        // Feature-specific
        'health-coral': '#f97316',
        'health-indigo': '#6366f1',
        'health-purple': '#a855f7',
        'health-rose': '#f43f5e',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      boxShadow: {
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(20, 184, 166, 0.05)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.15), 0 0 40px rgba(168, 85, 247, 0.05)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.15), 0 0 40px rgba(59, 130, 246, 0.05)',
      },
    },
  },
  plugins: [],
};