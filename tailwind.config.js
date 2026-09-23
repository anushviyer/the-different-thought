/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FAF8F5',
          card: '#FFFFFF',
          subtle: '#F3EFEA',
          border: '#E8E3DC'
        },
        charcoal: {
          900: '#18181B',
          800: '#27272A',
          700: '#3F3F46',
          500: '#71717A',
          400: '#A1A1AA'
        },
        editorial: {
          terracotta: '#C25E3E',
          ochre: '#B47B44',
          sand: '#ECE6DF'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}