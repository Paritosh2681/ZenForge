/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Cyberpunk Academic Color System
      colors: {
        // Background hierarchy
        gc: {
          base: 'rgb(var(--bg-base) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface) / <alpha-value>)',
          elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        },
        // Accent colors
        cyan: {
          DEFAULT: '#00D4FF',
          50: '#E0F9FF',
          100: '#B3F1FF',
          200: '#80E8FF',
          300: '#4DDEFF',
          400: '#1AD5FF',
          500: '#00D4FF',
          600: '#00A8CC',
          700: '#007D99',
          800: '#005166',
          900: '#002633',
        },
        purple: {
          DEFAULT: '#7C3AED',
          50: '#F3EAFD',
          100: '#E2D0FB',
          200: '#C5A1F7',
          300: '#A872F3',
          400: '#8B43EF',
          500: '#7C3AED',
          600: '#6026D9',
          700: '#4A1DAA',
          800: '#34147B',
          900: '#1E0B4C',
        },
        // Semantic colors
        success: {
          DEFAULT: '#10B981',
          muted: 'rgba(16, 185, 129, 0.15)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          muted: 'rgba(245, 158, 11, 0.15)',
        },
        error: {
          DEFAULT: '#EF4444',
          muted: 'rgba(239, 68, 68, 0.15)',
        },
        // Text hierarchy
        text: {
          primary: '#E2E8F0',
          secondary: '#94A3B8',
          muted: '#475569',
        },
        // shadcn/ui compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Typography
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // Spacing based on 4px grid
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '18': '72px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
      },
      // Border radius
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      // Box shadows - Cyberpunk style
      boxShadow: {
        'gc-card': '0 0 0 1px rgba(0,212,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
        'gc-glow': '0 0 20px rgba(0,212,255,0.15)',
        'gc-glow-lg': '0 0 40px rgba(0,212,255,0.2)',
        'gc-glow-purple': '0 0 20px rgba(124,58,237,0.15)',
        'gc-input': '0 0 0 3px rgba(0,212,255,0.15)',
      },
      // Animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        "fade-in-up": {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        "slide-up": {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        "slide-down": {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(100%)' },
        },
        "float": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        "pulse-glow": {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0,212,255,0.15)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(0,212,255,0.25)' },
        },
        "breathing": {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.95)' },
        },
        "typewriter-cursor": {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        "shimmer": {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        "progress-drain": {
          '0%': { transform: 'scaleX(1)' },
          '100%': { transform: 'scaleX(0)' },
        },
        "dots-pulse": {
          '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-down": "slide-down 0.2s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "breathing": "breathing 2s ease-in-out infinite",
        "cursor-blink": "typewriter-cursor 1s step-end infinite",
        "shimmer": "shimmer 1.5s infinite linear",
        "progress-drain": "progress-drain 4s linear forwards",
        "dots-1": "dots-pulse 1.4s infinite ease-in-out both",
        "dots-2": "dots-pulse 1.4s infinite ease-in-out 0.16s both",
        "dots-3": "dots-pulse 1.4s infinite ease-in-out 0.32s both",
      },
      // Background images
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        'glow-purple': 'radial-gradient(ellipse 600px 400px at 70% 50%, rgba(124,58,237,0.08), transparent)',
        'glow-cyan': 'radial-gradient(ellipse 600px 400px at 30% 50%, rgba(0,212,255,0.08), transparent)',
        'gradient-primary': 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, #1f2b42 50%, transparent 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      // Transition timing functions
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
