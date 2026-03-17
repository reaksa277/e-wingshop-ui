import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#1a6b2f',
          dark: '#0d3d1a',
          mid: '#2d9c4a',
          light: '#dcf5e4',
          pale: '#f0faf3',
        },
        cream: '#faf8f4',
        amber: { 
          DEFAULT: '#f59e0b', 
          light: '#fef3c7' 
        },
        border: '#e5e7eb',
      },
      borderRadius: {
        xl: '1rem', 
        '2xl': '1.5rem', 
        '3xl': '2rem',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,.07)',
        hover: '0 8px 32px rgba(0,0,0,.12)',
        green: '0 8px 24px rgba(26,107,47,.25)',
      },
      animation: {
        'fade-up': 'fadeUp .5s ease both',
        'fade-in': 'fadeIn .4s ease both',
        'scale-in': 'scaleIn .3s ease both',
        'slide-in-right': 'slideInRight .3s ease both',
        'pulse-dot': 'pulseDot 1.2s ease-in-out infinite',
        'bounce-short': 'bounceShort .6s ease both',
        'shake': 'shake .5s ease both',
        'check': 'check .4s ease both',
        'fill': 'fill .6s ease-out both',
      },
      keyframes: {
        fadeUp: { 
          from: { opacity: '0', transform: 'translateY(16px)' }, 
          to: { opacity: '1', transform: 'translateY(0)' } 
        },
        fadeIn: { 
          from: { opacity: '0' }, 
          to: { opacity: '1' } 
        },
        scaleIn: { 
          from: { opacity: '0', transform: 'scale(0.9)' }, 
          to: { opacity: '1', transform: 'scale(1)' } 
        },
        slideInRight: { 
          from: { opacity: '0', transform: 'translateX(16px)' }, 
          to: { opacity: '1', transform: 'translateX(0)' } 
        },
        pulseDot: { 
          '0%,100%': { opacity: '1' }, 
          '50%': { opacity: '.4' } 
        },
        bounceShort: { 
          '0%': { transform: 'scale(1)' }, 
          '50%': { transform: 'scale(1.2)' }, 
          '100%': { transform: 'scale(1)' } 
        },
        shake: { 
          '0%,100%': { transform: 'translateX(0)' }, 
          '20%,60%': { transform: 'translateX(-6px)' }, 
          '40%,80%': { transform: 'translateX(6px)' } 
        },
        check: { 
          '0%': { transform: 'scale(0)', opacity: '0' }, 
          '50%': { transform: 'scale(1.2)' }, 
          '100%': { transform: 'scale(1)', opacity: '1' } 
        },
        fill: { 
          from: { width: '0' } 
        },
        heartPop: { 
          '0%': { transform: 'scale(1)' }, 
          '50%': { transform: 'scale(1.3)' }, 
          '100%': { transform: 'scale(1)' } 
        },
        cartBounce: { 
          '0%,100%': { transform: 'scale(1)' }, 
          '30%': { transform: 'scale(1.3)' }, 
          '50%': { transform: 'scale(0.9)' }, 
          '70%': { transform: 'scale(1.15)' } 
        },
        digitPulse: { 
          '0%,100%': { opacity: '1' }, 
          '50%': { opacity: '0.6' } 
        },
      },
    },
  },
  plugins: [],
} satisfies Config
