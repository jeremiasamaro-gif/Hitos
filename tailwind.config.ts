import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Semantic tokens (CSS-var backed) ──
        app:       'var(--color-bg-app)',
        card:      'var(--color-bg-card)',
        hover:     'var(--color-bg-hover)',
        alt:       'var(--color-bg-alt)',

        border:    'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',

        primary:   'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        muted:     'var(--color-text-muted)',

        accent: {
          DEFAULT: 'var(--color-accent)',
          light:   'var(--color-accent-light)',
          dark:    'var(--color-accent-dark)',
        },
        status: {
          ok:       'var(--color-status-ok)',
          warning:  'var(--color-status-warning)',
          exceeded: 'var(--color-status-exceeded)',
        },

        // ── Legacy aliases (keep old names working during migration) ──
        dark: {
          bg:      'var(--color-bg-app)',
          surface: 'var(--color-bg-card)',
          border:  'var(--color-border)',
          hover:   'var(--color-bg-hover)',
          text:    'var(--color-text-primary)',
          muted:   'var(--color-text-secondary)',
        },
      },
      fontFamily: {
        sans: ['Ubuntu', 'sans-serif'],
        heading: ['Ubuntu', 'sans-serif'],
        mono: ['monospace'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
    },
  },
  plugins: [],
} satisfies Config
