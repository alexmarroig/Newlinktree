import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
        // Design tokens específicos do Therapy Bio Hub
        stone: {
          50: "hsl(45, 30%, 97%)",
          100: "hsl(40, 25%, 93%)",
          200: "hsl(38, 22%, 85%)",
          300: "hsl(35, 20%, 72%)",
          400: "hsl(32, 19%, 59%)",
          500: "hsl(30, 18%, 47%)",
          600: "hsl(28, 18%, 42%)",
          700: "hsl(26, 16%, 35%)",
          800: "hsl(25, 15%, 28%)",
          900: "hsl(22, 13%, 20%)",
          950: "hsl(20, 12%, 11%)",
        },
        sage: {
          50: "hsl(120, 14%, 96%)",
          100: "hsl(120, 12%, 90%)",
          200: "hsl(120, 10%, 80%)",
          300: "hsl(120, 8%, 65%)",
          400: "hsl(120, 7%, 52%)",
          500: "hsl(120, 6%, 42%)",
          600: "hsl(120, 5%, 35%)",
        },
        rose: {
          50: "hsl(340, 60%, 97%)",
          100: "hsl(340, 50%, 93%)",
          200: "hsl(340, 40%, 85%)",
          300: "hsl(340, 35%, 72%)",
          400: "hsl(340, 30%, 60%)",
          500: "hsl(340, 25%, 50%)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui"],
        serif: [
          "var(--font-playfair)",
          "Playfair Display",
          "ui-serif",
          "Georgia",
        ],
        heading: [
          "var(--font-playfair)",
          "Playfair Display",
          "ui-serif",
          "Georgia",
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      boxShadow: {
        soft: "0 2px 8px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.03)",
        "soft-md":
          "0 4px 16px 0 rgb(0 0 0 / 0.06), 0 2px 6px 0 rgb(0 0 0 / 0.04)",
        "soft-lg":
          "0 8px 24px 0 rgb(0 0 0 / 0.07), 0 4px 10px 0 rgb(0 0 0 / 0.04)",
        "soft-xl":
          "0 16px 40px 0 rgb(0 0 0 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.04)",
        "inner-soft": "inset 0 1px 3px 0 rgb(0 0 0 / 0.04)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.04)",
        "card-hover":
          "0 8px 24px 0 rgb(0 0 0 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.04)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
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
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      maxWidth: {
        "content": "680px",
        "content-lg": "800px",
        "content-xl": "960px",
        "admin": "1400px",
      },
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
        "400": "400ms",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-soft": "cubic-bezier(0.45, 0, 0.55, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
