import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/agora-agent-uikit/dist/**/*.{js,mjs}",
  ],
  theme: {
  	extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'vs-sm': 'var(--vs-shadow-sm)',
        'vs-md': 'var(--vs-shadow-md)',
        'vs-lg': 'var(--vs-shadow-lg)',
        'vs-glow': 'var(--vs-shadow-glow)',
      },
  		colors: {
        // ── Valsea brand tokens (values defined in globals.css :root / .dark) ──
        vs: {
          page:           'var(--vs-page)',
          card:           'var(--vs-card)',
          surface:        'var(--vs-surface)',
          overlay:        'var(--vs-overlay)',
          fg:             'var(--vs-fg)',
          'fg-muted':     'var(--vs-fg-muted)',
          'fg-dim':       'var(--vs-fg-dim)',
          brand:          'var(--vs-brand)',
          'brand-text':   'var(--vs-brand-text)',
          'brand-acc':    'var(--vs-brand-acc)',
          border:         'var(--vs-border)',
          'border-md':    'var(--vs-border-md)',
          'border-hdr':   'var(--vs-border-hdr)',
          'ctrl-bg':             'var(--vs-ctrl-bg)',
          'ctrl-border':         'var(--vs-ctrl-border)',
          'ctrl-icon':           'var(--vs-ctrl-icon)',
          'ctrl-active-bg':      'var(--vs-ctrl-active-bg)',
          'ctrl-active-border':  'var(--vs-ctrl-active-border)',
          'msg-agent-bg':     'var(--vs-msg-agent-bg)',
          'msg-agent-border': 'var(--vs-msg-agent-border)',
          'msg-agent-text':   'var(--vs-msg-agent-text)',
          'pill-bg':      'var(--vs-pill-bg)',
          'pill-border':  'var(--vs-pill-border)',
          'pill-text':    'var(--vs-pill-text)',
          'tag-bg':       'var(--vs-tag-bg)',
          'tag-text':     'var(--vs-tag-text)',
          divider:        'var(--vs-divider)',
          'select-bg':    'var(--vs-select-bg)',
          'select-option':'var(--vs-select-option)',
        },
        // ── Shadcn/Agora semantic tokens ─────────────────────────────────────
        // The <alpha-value> placeholder enables Tailwind opacity modifiers like
        // bg-primary/90, bg-card/80, bg-destructive/10, etc.
        // Without it, hsl(var(--token)) can't accept an alpha channel at utility-class time.
  			background: 'hsl(var(--background) / <alpha-value>)',
  			foreground: 'hsl(var(--foreground) / <alpha-value>)',
  			card: {
  				DEFAULT: 'hsl(var(--card) / <alpha-value>)',
  				foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
  				foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
  				foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
  				foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
  				foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
  				foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
  				foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
  			},
  			border: 'hsl(var(--border) / <alpha-value>)',
  			input: 'hsl(var(--input) / <alpha-value>)',
  			ring: 'hsl(var(--ring) / <alpha-value>)',
  			chart: {
  				'1': 'hsl(var(--chart-1) / <alpha-value>)',
  				'2': 'hsl(var(--chart-2) / <alpha-value>)',
  				'3': 'hsl(var(--chart-3) / <alpha-value>)',
  				'4': 'hsl(var(--chart-4) / <alpha-value>)',
  				'5': 'hsl(var(--chart-5) / <alpha-value>)'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background) / <alpha-value>)',
  				foreground: 'hsl(var(--sidebar-foreground) / <alpha-value>)',
  				primary: 'hsl(var(--sidebar-primary) / <alpha-value>)',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground) / <alpha-value>)',
  				accent: 'hsl(var(--sidebar-accent) / <alpha-value>)',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground) / <alpha-value>)',
  				border: 'hsl(var(--sidebar-border) / <alpha-value>)',
  				ring: 'hsl(var(--sidebar-ring) / <alpha-value>)'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' },
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' },
  			},
  			'vs-shimmer': {
  				'0%': { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' },
  			},
  			'vs-breathe': {
  				'0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
  				'50%': { opacity: '1', transform: 'scale(1.05)' },
  			},
  			'vs-float': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-6px)' },
  			},
  			'vs-glow-pulse': {
  				'0%, 100%': { opacity: '0.45' },
  				'50%': { opacity: '0.85' },
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'vs-shimmer': 'vs-shimmer 2.2s ease-in-out infinite',
  			'vs-breathe': 'vs-breathe 2.4s ease-in-out infinite',
  			'vs-float': 'vs-float 5s ease-in-out infinite',
  			'vs-glow-pulse': 'vs-glow-pulse 3s ease-in-out infinite',
  		},
  		transitionTimingFunction: {
  			'vs-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
