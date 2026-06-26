/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FFF0F5',
          100: '#FFE1EC',
          200: '#FFC2D9',
          300: '#FF94BE',
          400: '#FF6B9D',
          500: '#E8407A',
          600: '#C92060',
          700: '#A8174F',
          800: '#8A1641',
          900: '#721537',
        },
        accent: {
          peach:   '#FF8E7A',
          lavender:'#9B8EC4',
          gold:    '#FFB347',
          mint:    '#7EC8A4',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft:    '#FFF5F8',
          card:    '#FFFAFC',
        },
        ink: {
          DEFAULT: '#1A1A2E',
          muted:   '#6B7280',
          light:   '#9CA3AF',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'rose-gradient':   'linear-gradient(135deg, #FF6B9D 0%, #FF8E7A 100%)',
        'purple-gradient': 'linear-gradient(135deg, #9B8EC4 0%, #FF6B9D 100%)',
        'gold-gradient':   'linear-gradient(135deg, #FFB347 0%, #FF8E7A 100%)',
        'soft-gradient':   'linear-gradient(135deg, #FFF5F8 0%, #FFE1EC 100%)',
      },
      boxShadow: {
        'rose-sm': '0 2px 8px rgba(255,107,157,0.15)',
        'rose-md': '0 4px 20px rgba(255,107,157,0.25)',
        'rose-lg': '0 8px 40px rgba(255,107,157,0.30)',
        card:      '0 2px 12px rgba(26,26,46,0.08)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        'float':       'float 3s ease-in-out infinite',
        'float-delay': 'float 3s ease-in-out 1.5s infinite',
        'pulse-rose':  'pulseRose 2s ease-in-out infinite',
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        pulseRose: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,107,157,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(255,107,157,0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
