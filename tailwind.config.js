/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#070a12',
        panel: '#0f172a',
        violet: { DEFAULT: '#8b5cf6', soft: '#a78bfa' },
        emerald: { DEFAULT: '#10b981' },
        cyan: { DEFAULT: '#06b6d4' },
        amber: { DEFAULT: '#f59e0b' },
        rose: { DEFAULT: '#f43f5e' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        hand: ['Caveat', '"Segoe Print"', '"Bradley Hand"', 'cursive'],
        handalt: ['Kalam', '"Segoe Print"', 'cursive'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139,92,246,.28), 0 18px 60px -20px rgba(139,92,246,.45)',
        card: '0 20px 60px -30px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.04)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(.9)', opacity: '.8' },
          '70%': { transform: 'scale(1.9)', opacity: '0' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'draw': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(.2,.6,.3,1) infinite',
        float: 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up .45s cubic-bezier(.2,.7,.3,1) both',
        'fade-in': 'fade-in .5s ease both',
        draw: 'draw 1.6s ease forwards',
        shimmer: 'shimmer 2.4s linear infinite',
        'spin-slow': 'spin-slow 18s linear infinite',
      },
    },
  },
  plugins: [],
}
