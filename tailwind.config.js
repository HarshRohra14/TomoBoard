/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Sakura theme colors
        sakura: {
          // Pink shades for Sakura theme
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        // Updated primary colors to use pink
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // Background colors for light/dark mode
        background: {
          light: '#ffffff',
          dark: '#0f0f0f',
        },
        // Surface colors for cards, etc.
        surface: {
          light: '#ffffff',
          dark: '#1a1a1a',
        },
        // Text colors
        text: {
          primary: {
            light: '#1f2937',
            dark: '#ffffff',
          },
          secondary: {
            light: '#6b7280',
            dark: '#d1d5db',
          },
          muted: {
            light: '#9ca3af',
            dark: '#6b7280',
          }
        },
        // Border colors
        border: {
          light: '#e5e7eb',
          dark: '#374151',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          900: '#0f172a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'sakura-bloom': 'sakuraBloom 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        sakuraBloom: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
