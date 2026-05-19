import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        shopee: {
          orange: '#EE4D2D',
          'orange-dark': '#D73211',
          'orange-light': '#FF6633',
          red: '#FF0000',
          'red-light': '#FFECE9',
          gray: '#F5F5F5',
          'gray-dark': '#757575',
          'gray-border': '#E8E8E8',
          text: '#333333',
          'text-light': '#757575',
          white: '#FFFFFF',
          green: '#26AA99',
          blue: '#0055AA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(0,0,0,.12)',
        'card-hover': '0 4px 16px 0 rgba(0,0,0,.16)',
        header: '0 2px 4px rgba(0,0,0,.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-shopee': 'pulseShopee 2s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseShopee: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
}

export default config
