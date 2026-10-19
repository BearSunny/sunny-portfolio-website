import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Binds directly to the CSS variable declared in your RootLayout
        pixel: ['var(--font-pixel)', 'Tahoma', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      colors: {
        retro: {
          teal: '#008080',
          bg: '#c0c0c0',
          navy: '#000080',
          'navy-light': '#1084d0',
          gray: {
            light: '#dfdfdf',
            dark: '#808080',
            darkest: '#000000',
          },
        },
      },
      boxShadow: {
        'retro-outset':
          'inset 1px 1px #ffffff, inset -1px -1px #000000, inset 2px 2px #c0c0c0, inset -2px -2px #808080',
        'retro-inset':
          'inset 1px 1px #000000, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #c0c0c0',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        /* Retains sharp edges on pixel art icons & fonts */
        '.pixelated': {
          'image-rendering': 'pixelated',
        },
        /* Hides horizontal taskbar scrollbars while preserving scroll functionality */
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    }),
  ],
};

export default config;