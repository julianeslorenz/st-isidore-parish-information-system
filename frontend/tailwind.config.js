import { colors, fonts, screens } from './src/theme/tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens,
    extend: {
      colors,
      fontFamily: fonts,
      boxShadow: {
        menu: '0 8px 28px rgba(43,39,38,.14)',
        modal: '0 20px 60px rgba(0,0,0,.3)',
        toast: '0 8px 24px rgba(0,0,0,.25)',
      },
      backgroundImage: {
        'hero-wine': 'linear-gradient(135deg, #3F111B, #6B1D2A 75%)',
        'portal-hero': 'linear-gradient(180deg, #F7ECEE, #FAF7F2)',
        'gold-soft': 'linear-gradient(180deg, #F7EFDA, #F3E4C2)',
        'map-placeholder':
          'repeating-linear-gradient(45deg,#EFE9DF,#EFE9DF 12px,#F6F1E8 12px,#F6F1E8 24px)',
      },
      keyframes: {
        pop: { from: { transform: 'translateY(8px)', opacity: '0' } },
      },
      animation: { pop: 'pop .18s ease-out' },
    },
  },
  plugins: [],
};
