/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        bg: '#1A1A1A',
        surface: '#242424',
        'surface-raised': '#2E2E2E',
        border: '#333333',
        'text-primary': '#F5F0E8',
        'text-secondary': '#8A8480',
        accent: '#F59E0B',
        'accent-hover': '#FBBF24',
        'accent-dim': '#92400E',
        danger: '#F87060',
        'danger-hover': '#EF4444',
        'badge-green': '#4ADE80',
        'badge-amber': '#F59E0B',
        'badge-red': '#F87171',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

