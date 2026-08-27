// METU MOTION §2.1 — Primary Pill Button (paylaşılan temel buton).
//
// 22 ekran bu bileşeni kullanıyor; spec geometrisi tek tek ekranları
// değiştirmek yerine buraya uygulandı — hepsi otomatik uyum sağlar.
//
// PillButton.jsx'ten farkı: bu bileşen STATİK gelir (morph reveal yok).
// §4.3'ün çizgi→hap giriş animasyonu yalnızca bir ekranın ANA ilerleme
// aksiyonu için anlamlıdır (onboarding CTA'ları); listedeki her butonun
// morph etmesi gürültü olur. Oralar PillButton kullanır.

const VARIANTS = {
  // Ana CTA — solid marka kırmızısı, gradient yok (§2.1)
  primary:
    "bg-primary-600 text-white shadow-cta hover:bg-primary-700 active:bg-primary-800",
  secondary: "bg-surface-2 text-content border border-line hover:bg-surface-3",
  outline:
    "bg-transparent text-accent border border-primary-200 hover:border-primary-400 hover:bg-primary-50",
  ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-content",
  quiet: "bg-transparent text-accent hover:bg-primary-50",
  danger: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
  // Yüksek vurgulu nötr — temaya göre tersine döner
  dark: "bg-content text-bg hover:opacity-90 active:opacity-80",
  // Spatial Glassmorphism — buzlu cam ikincil buton (renkli/koyu zeminler üstünde)
  glass: "glass-tile text-white hover:brightness-110",
};

// §2.1: ana CTA 52px. sm/md yardımcı eylemler için orantılı küçültme.
const SIZES = {
  sm: "h-9 px-4 text-caption font-semibold",
  md: "h-11 px-5 text-body font-semibold",
  lg: "h-[52px] px-6 text-button",
};

export default function Button({
  variant = "primary",
  size = "md",
  full,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full transition-[background-color,color,box-shadow,transform,opacity] duration-instant ease-standard active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${full ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
