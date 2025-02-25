import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-fira)'],
        mono: ['var(--font-shrikhand)'],
      },
      colors: {
        main: 'var(--main)',
        overlay: 'var(--overlay)',
        destructive: 'var(--destructive)',
        bg: 'var(--bg)',
        bw: 'var(--bw)',
        blank: 'var(--blank)',
        text: 'var(--text)',
        mtext: 'var(--mtext)',
        border: 'var(--border)',
        ring: 'var(--ring)',
        ringOffset: 'var(--ring-offset)',

        secondaryBlack: '#212121',
      },
      borderRadius: {
        base: '10px',
      },
      boxShadow: {
        shadow: 'var(--shadow)',
      },
      translate: {
        boxShadowX: '2px',
        boxShadowY: '4px',
        reverseBoxShadowX: '-2px',
        reverseBoxShadowY: '-4px',
      },
      fontWeight: {
        base: '500',
        heading: '700',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
