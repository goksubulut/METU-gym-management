/** @type {import('tailwindcss').Config} */

// Tüm renkler CSS değişkenlerine bağlanır (R G B kanalları) → Tailwind alpha
// modifier'ları çalışır (ör. ring-primary-600/40) ve tema data-theme ile döner.
const ch = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: ch("--primary-50"),
          100: ch("--primary-100"),
          200: ch("--primary-200"),
          300: ch("--primary-300"),
          400: ch("--primary-400"),
          500: ch("--primary-500"),
          600: ch("--primary-600"),
          700: ch("--primary-700"),
          800: ch("--primary-800"),
          900: ch("--primary-900"),
          DEFAULT: ch("--primary-600"),
        },
        gray: {
          50: ch("--gray-50"),
          100: ch("--gray-100"),
          200: ch("--gray-200"),
          300: ch("--gray-300"),
          400: ch("--gray-400"),
          500: ch("--gray-500"),
          600: ch("--gray-600"),
          700: ch("--gray-700"),
          800: ch("--gray-800"),
          900: ch("--gray-900"),
        },
        ink: {
          800: ch("--ink-800"),
          900: ch("--ink-900"),
          950: ch("--ink-950"),
        },
        // Semantik yüzey + metin
        bg: ch("--bg"),
        surface: {
          DEFAULT: ch("--surface"),
          2: ch("--surface-2"),
          3: ch("--surface-3"),
        },
        content: ch("--content"),
        muted: ch("--muted"),
        faint: ch("--faint"),
        accent: ch("--accent"),
        soft: ch("--soft"),
        hairline: "var(--hairline)",
        line: "var(--line)",
        // Durum (doluluk)
        available: { DEFAULT: ch("--available"), soft: ch("--available-soft") },
        busy: { DEFAULT: ch("--busy"), soft: ch("--busy-soft") },
        info: { DEFAULT: ch("--info"), soft: ch("--info-soft") },
      },
      fontFamily: {
        sans: ["Geist", "-apple-system", "SF Pro Text", "system-ui", "sans-serif"],
        display: ["Geist", "-apple-system", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SF Mono", "monospace"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
        cta: "var(--shadow-cta)",
        "nav-float": "var(--shadow-nav)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};
