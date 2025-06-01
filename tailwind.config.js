/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E5EDFF',
          100: '#CCDCFF',
          200: '#99B8FF',
          300: '#6694FF',
          400: '#3366FF', // Main primary
          500: '#0044FF',
          600: '#0033CC',
          700: '#002299',
          800: '#001166',
          900: '#000033',
        },
        secondary: {
          50: '#E6FBFF',
          100: '#CCF7FF',
          200: '#99EFFF',
          300: '#66E7FF',
          400: '#00B8D9', // Main secondary
          500: '#00A3C4',
          600: '#0082A0',
          700: '#00617A',
          800: '#004155',
          900: '#002030',
        },
        accent: {
          50: '#FFF5E6',
          100: '#FFEACC',
          200: '#FFD699',
          300: '#FFC266',
          400: '#FF8B00', // Main accent
          500: '#E67A00',
          600: '#CC6A00',
          700: '#995000',
          800: '#663500',
          900: '#331A00',
        },
        success: {
          50: '#E8F7EF',
          100: '#D0F0DF',
          200: '#A0E1BF',
          300: '#71D29F',
          400: '#36B37E', // Main success
          500: '#1D9F6B',
          600: '#158657',
          700: '#0E6743',
          800: '#07482E',
          900: '#00241A',
        },
        warning: {
          50: '#FFF9E6',
          100: '#FFF3CC',
          200: '#FFE799',
          300: '#FFDB66',
          400: '#FFAB00', // Main warning
          500: '#E69A00',
          600: '#CC8800',
          700: '#996600',
          800: '#664400',
          900: '#332200',
        },
        error: {
          50: '#FFEAE6',
          100: '#FFD6CC',
          200: '#FFAD99',
          300: '#FF8466',
          400: '#FF5630', // Main error
          500: '#E64325',
          600: '#CC3A1F',
          700: '#992B17',
          800: '#661D0F',
          900: '#330E07',
        },
        gray: {
          50: '#F7F8FA',
          100: '#ECEEF2',
          200: '#DCE0E8',
          300: '#C1C7D4',
          400: '#A5ADBD',
          500: '#8993A5',
          600: '#6B758C',
          700: '#505870',
          800: '#373F59',
          900: '#172142',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};