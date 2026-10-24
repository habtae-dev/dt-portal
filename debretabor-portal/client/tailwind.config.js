/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Inter for Latin text, Noto Sans Ethiopic for Amharic (both loaded in index.html).
        sans: ['Inter', '"Noto Sans Ethiopic"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } }
      },
      animation: { fadeIn: 'fadeIn 0.6s ease-out both' }
    }
  },
  plugins: []
};
