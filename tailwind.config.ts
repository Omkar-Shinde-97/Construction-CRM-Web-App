import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#0369a1',
        accent: '#0891b2',
        app: {
          background: '#F8FAFC',
          text: '#1E293B',
          success: '#0d9488',
          warning: '#d97706',
          danger: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        soft: '0 12px 35px rgba(15, 23, 42, 0.08)',
        card: '0 20px 60px rgba(30, 64, 175, 0.08)',
        glow: '0 0 30px rgba(30, 64, 175, 0.15)',
        elevated: '0 25px 50px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1e40af 0%, #0369a1 100%)',
        'gradient-secondary':
          'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
        'gradient-accent': 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
        'gradient-success': 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
        'gradient-card':
          'linear-gradient(135deg, rgba(30, 64, 175, 0.05) 0%, rgba(8, 145, 178, 0.05) 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(30, 64, 175, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(30, 64, 175, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
