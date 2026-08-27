/** @type {import('tailwindcss').Config} */

// METU MOTION — tüm renkler CSS değişkenlerine bağlanır (R G B kanalları) →
// Tailwind alpha modifier'ları çalışır (ör. shadow-glow/60, bg-glow/25) ve
// tema data-theme ile döner. Token tanımları: src/index.css (tek gerçek kaynak).
const ch = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
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
        // Bölüm 1.1 — highlight/pulse kırmızısı (#FF3B4E) ve aksan altını (#F2A93B)
        glow: ch("--glow"),
        gold: { DEFAULT: ch("--gold"), ink: ch("--gold-ink") },
        // Bölüm 1.1 — --color-border-subtle (#3A3A3D) → border-subtle / bg-subtle
        subtle: ch("--border-subtle"),
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
      // Bölüm 1.4 — tipografi skalası. [boyut, {satır yüksekliği, tracking, ağırlık}]
      fontSize: {
        hero: ["30px", { lineHeight: "1.06", letterSpacing: "-0.02em", fontWeight: "800" }],
        h1: ["23px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        body: ["15px", { lineHeight: "1.5", fontWeight: "500" }],
        caption: ["13px", { lineHeight: "1.45", fontWeight: "400" }],
        button: ["16px", { lineHeight: "1", fontWeight: "600" }],
        tab: ["11px", { lineHeight: "1.2", fontWeight: "500" }],
      },
      // Bölüm 1.2 — 4px temel birim (Tailwind varsayılanıyla birebir örtüşür);
      // ekran kenar boşluğu için adlandırılmış yardımcı.
      spacing: {
        screen: "24px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
        cta: "var(--shadow-cta)",
        "nav-float": "var(--shadow-nav)",
        glow: "var(--shadow-glow)",
      },
      // Bölüm 1.3 — radius skalası
      borderRadius: {
        xl2: "1.25rem",
        card: "20px",
        input: "12px",
        band: "10px",
        pill: "9999px",
      },
      // Bölüm 1.5 — hareket token'ları
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
        standard: "cubic-bezier(0.16, 1, 0.3, 1)",
        motion: "cubic-bezier(0.4, 0, 0.2, 1)",
        pop: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      transitionDuration: {
        instant: "160ms",
        fast: "240ms",
        base: "300ms",
        slow: "500ms",
        flip: "360ms",
      },
    },
  },
  plugins: [],
};
