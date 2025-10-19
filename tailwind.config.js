/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mint: {
          50: '#F3FFFA',
          100: '#E9FFF7',
          200: '#CFFAEF',
          400: '#5BD3B3',
          500: '#28C7A7'
        },
        blue: {
          50: '#E9F5FF',
          100: '#DFF0FF',
          200: '#CBE5FF',
          400: '#70A7FF',
          500: '#3F8CFF'
        },
        lavender: {
          50: '#F6F3FF',
          100: '#EFEAFF',
          200: '#E3DBFF',
          400: '#B298DC',
          500: '#9A7EDB'
        },
        ink: {
          900: '#0F172A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
}