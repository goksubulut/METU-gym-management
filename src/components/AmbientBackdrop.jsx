// METU MOTION — Spatial Glassmorphism arka plan sahnesi.
//
// Onboarding akışının tamamında ortak "spatial" zemin: koşucu fotoğrafı ağır
// bulanıklaştırılıp doygunlaştırılır ve üstüne kırmızı/glow ışık bulutları
// bindirilerek referanstaki renkli aura elde edilir. Buzlu cam kartlar (.glass-*)
// bu sahnenin üstünde yüzer.
//
// Görsel: /images/onboarding-hero.jpg (kullanıcının koşucu fotoğrafı). Dosya
// yoksa mevcut /images/pose-base.jpg'e düşer, böylece ekran asla boş kalmaz.

export default function AmbientBackdrop({
  image = "/images/onboarding-hero.jpg",
  fallback = "/images/pose-base.jpg",
  className = "",
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-bg ${className}`}
    >
      {/* Bulanık renkli sahne */}
      <div className="spatial-aura">
        <img
          src={image}
          alt=""
          draggable="false"
          className="spatial-aura__img"
          onError={(e) => {
            if (e.currentTarget.src.indexOf(fallback) === -1) e.currentTarget.src = fallback;
          }}
        />
      </div>

      {/* Kırmızı/glow ışık bulutları — derinlik ve marka rengi (kısılmış) */}
      <div
        className="absolute -left-1/4 top-[8%] h-[60%] w-[75%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(var(--glow) / 0.22), transparent 64%)" }}
      />
      <div
        className="absolute -right-1/4 top-[38%] h-[62%] w-[72%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(var(--primary-600) / 0.22), transparent 62%)" }}
      />

      {/* Okunurluk için üst/alt karartma vinyeti + genel karartma katmanı */}
      <div className="absolute inset-0 bg-bg/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/25 to-bg/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
    </div>
  );
}
