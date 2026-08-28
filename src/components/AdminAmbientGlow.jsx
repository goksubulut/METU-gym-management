// METU MOTION — Admin kabuğu için spatial glow zemin.
//
// AdminLayout ve AdminLogin arasında paylaşılır. Marka görseli
// (public/images/admin-background.jpeg — pembe/turuncu aurora + 8 köşeli
// yıldız) tüm admin ekranlarının zeminidir. Görsel açık gri baskın olduğu için,
// koyu admin dili (beyaz metin + buzlu cam kartlar) üstünde kontrast kaybolmasın
// diye ölçülü koyulaştırılır ve okunurluk vinyetleriyle katmanlanır; aurora ve
// yıldız premium bir aksan olarak görünür kalır.

export default function AdminAmbientGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      {/* Marka görseli — hafif koyulaştırma (daha açık/editoryal), doygunluk korunur */}
      <img
        src="/images/admin-background.jpg"
        alt=""
        draggable="false"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: "saturate(1.14) brightness(0.68) contrast(1.0)" }}
        onError={(e) => {
          if (e.currentTarget.src.indexOf("admin-background.jpeg") === -1)
            e.currentTarget.src = "/images/admin-background.jpeg";
        }}
      />

      {/* Hafif genel veil — cam yüzeyler ve beyaz metin için kontrast tabanı */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgb(var(--bg) / 0.26)" }} />

      {/* Üst/alt karartma — bare başlıklar ve alt kenar okunurluğu (üst korunur) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgb(var(--bg) / 0.5) 0%, transparent 24%, transparent 74%, rgb(var(--bg) / 0.32) 100%)",
        }}
      />

      {/* Sol kenar karartma — sidebar navigasyonu net kalsın */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgb(var(--bg) / 0.5) 0%, transparent 24%)" }}
      />

      {/* İnce grain — camın arkasındaki zemine doku hissi */}
      <div className="absolute inset-0 bg-noise opacity-[0.04]" />
    </div>
  );
}
