// METU MOTION — içerik kartı. Varsayılan: hafif frosted cam (.glass-card),
// uygulama genelinde tutarlı Spatial Glassmorphism dili. Eski nötr yüzey için
// `plain`, kırmızı-yumuşak zemin için `soft`, güçlü bento cam için `glass`.

export default function Card({ className = "", soft, glass, plain, onClick, children }) {
  const interactive = onClick
    ? "cursor-pointer select-none transition-[box-shadow,transform] duration-200 ease-smooth hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
    : "";

  // Güçlü bento cam (renkli/bulanık zeminler üstünde)
  if (glass) {
    return (
      <div
        onClick={onClick}
        className={`glass-panel rounded-[28px] ${
          onClick ? "cursor-pointer select-none transition-transform duration-200 ease-smooth hover:-translate-y-0.5 active:scale-[0.98]" : ""
        } ${className}`}
      >
        {children}
      </div>
    );
  }

  // Eski nötr yüzey (gerekirse geri dönüş)
  if (plain) {
    return (
      <div
        onClick={onClick}
        className={`rounded-2xl border ${
          soft ? "border-primary-200 bg-soft" : "border-hairline bg-surface"
        } shadow-card ${interactive} ${className}`}
      >
        {children}
      </div>
    );
  }

  // Kırmızı-yumuşak zemin (uyarı/öne çıkarma)
  if (soft) {
    return (
      <div
        onClick={onClick}
        className={`rounded-2xl border border-primary-200 bg-soft shadow-card ${interactive} ${className}`}
      >
        {children}
      </div>
    );
  }

  // Varsayılan — frosted cam kart
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl ${onClick ? "glass-card--interactive" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
