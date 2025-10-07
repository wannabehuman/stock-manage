/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f9f7f4',
          100: '#f1ede6',
          200: '#e4daca',
          300: '#d4c2a9',
          400: '#c29261',
          500: '#c29261',
          600: '#c29261',
          700: '#9a7550',
          800: '#7a5d40',
          900: '#5c4630',
          950: '#3d2e20'
        }
      }
    }
  },
  plugins: [require('flowbite/plugin')],
  darkMode: 'class'
};