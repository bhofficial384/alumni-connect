/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B0F19', light: '#151E2E', dark: '#06080E' },
        gold: { DEFAULT: '#8B5CF6', light: '#A78BFA', dark: '#7C3AED', '50': '#F5F3FF' },
        cyan: { DEFAULT: '#06B6D4', light: '#22D3EE', dark: '#0891B2', neon: '#00F0FF' },
        purple: { DEFAULT: '#8B5CF6', light: '#A855F7', dark: '#6D28D9' },
        pink: { DEFAULT: '#EC4899', light: '#F472B6', dark: '#DB2777' },
        teal: { DEFAULT: '#06B6D4', light: '#22D3EE', dark: '#0891B2' },
        cream: '#0B0F19',
        obsidian: { DEFAULT: '#07090E', card: '#0D131F', light: '#161F30', border: 'rgba(255,255,255,0.08)' },
        charcoal: '#F1F5F9',
        'slate-custom': '#94A3B8',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1.5deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(12px) rotate(-1.5deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        }
      },
    },
  },
  plugins: [],
};
