/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic tokens via CSS variables — respond to .light / .dark automatically
        surface: {
          base:  'var(--surface-base)',
          raised: 'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
        },
        tx: {
          primary:   'var(--tx-primary)',
          secondary: 'var(--tx-secondary)',
          muted:     'var(--tx-muted)',
          faint:     'var(--tx-faint)',
        },
        line: {
          DEFAULT: 'var(--line)',
          subtle:  'var(--line-subtle)',
        },
        // keep existing accent palette
        accent: {
          DEFAULT: '#3b82f6',
          hover:   '#2563eb',
        },
        // legacy tokens (keep for backwards compat)
        background: 'var(--surface-base)',
        foreground:  'var(--tx-primary)',
        card:        'var(--surface-raised)',
        border:      'var(--line)',
        sidebar:     'var(--surface-sidebar)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0,0,0,0.37)',
        card:  '0 2px 12px 0 rgba(0,0,0,0.18)',
      },
      animation: {
        'fade-in':      'fadeIn 0.25s ease-out forwards',
        'slide-up':     'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
        shimmer:        'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        slideUp:   { '0%': { transform:'translateY(10px)', opacity:'0' }, '100%': { transform:'translateY(0)', opacity:'1' } },
        pulseSubtle: { '0%,100%': { opacity:'1' }, '50%': { opacity:'0.7' } },
        shimmer:   { '0%,100%': { backgroundPosition:'200% center' }, '50%': { backgroundPosition:'-200% center' } },
      },
    },
  },
  plugins: [],
}
