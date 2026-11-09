/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BreatheAI Premium Organic Technology Palette
        forest: {
          DEFAULT: '#173D32',
          hover: '#245543',
          dark: '#0e261f',
          light: '#2a5b4c',
        },
        ivory: {
          DEFAULT: '#F7F5ED',
          50: '#FDFCF9',
          100: '#F7F5ED',
          200: '#EDE9DE',
          300: '#E2DCD0',
        },
        sage: {
          DEFAULT: '#A8B99A',
          light: '#C4D1BA',
          soft: '#EEF1E8',
          dark: '#7A8C6B',
        },
        wood: {
          DEFAULT: '#8B5E3C',
          hover: '#734C2F',
          light: '#B38B6D',
          dark: '#5C3E28',
        },
        teal: {
          DEFAULT: '#65B9C9',
          hover: '#4EA5B6',
          light: '#E2F3F6',
          dark: '#3A8C9C',
        },
        charcoal: {
          DEFAULT: '#26332D',
          body: '#58645C',
          muted: '#89938A',
        },
        // Surface & borders
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#EEF1E8',
          border: '#E3E6DC',
        },
        // AQI Natural Indicator Scale (organic, calm, non-neon)
        aqi: {
          good: '#2D6A4F',          // Organic deep forest green
          moderate: '#C08532',      // Warm wood amber
          sensitive: '#B8652B',     // Terracotta earth
          unhealthy: '#A83232',     // Brick red
          veryUnhealthy: '#6A3D73', // Plum purple
          hazardous: '#4A1D28',     // Deep garnet
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '14px',
        'lg': '22px',
        'xl': '28px',
      },
      boxShadow: {
        'card': '0 8px 30px rgba(23, 61, 50, 0.06)',
        'card-hover': '0 12px 36px rgba(23, 61, 50, 0.10)',
        'soft': '0 2px 10px rgba(23, 61, 50, 0.04)',
      },
      animation: {
        'airflow': 'airflow 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        airflow: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(6px) translateY(-3px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
