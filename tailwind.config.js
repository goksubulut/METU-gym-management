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
        // Referanstaki açık şeftali kart zeminine karşılık gelen kırmızı-nötr ton.
        soft: "#fdf1f1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.06)",
        pop: "0 8px 30px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
