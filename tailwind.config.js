/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Tek yerden yönetilen kırmızı tema paleti.
        primary: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626", // ana marka rengi (CTA, aktif durum)
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        // Koyu "mürekkep" yüzeyler (hero kartlar, koyu paneller)
        ink: {
          800: "#1f2430",
          900: "#151923",
          950: "#0d1017",
        },
        // Referanstaki açık şeftali kart zeminine karşılık gelen kırmızı-nötr ton.
        soft: "#fdf1f1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,20,28,0.04), 0 4px 16px rgba(16,20,28,0.06)",
        pop: "0 4px 12px rgba(16,20,28,0.08), 0 16px 40px rgba(16,20,28,0.14)",
        glow: "0 8px 24px rgba(220,38,38,0.35)",
        "nav-float": "0 8px 32px rgba(16,20,28,0.16)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
