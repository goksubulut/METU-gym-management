// METU MOTION §2.7 — Banner / Görev Kartı (Dashboard)
//
// Dashboard'daki tek "vitrin" alanı. Bu kart uygulamadaki TEK altın aksanlı
// yüzeydir ve bilinçli olarak marka kırmızısı KULLANMAZ (§2.7) — kırmızı
// yoğunluğunun içinde bir nefes alma alanı.
//
// Yapı: keskin diagonal bir çizgiyle iki bölge (gradient/blur YOK, düz grafik).
// Sol-üst altın, sağ-alt koyu. clip-path ile kesilir.
//
// Kontrast notu: altın zemin üzerinde beyaz metin 1.9:1 kalıyor — bu yüzden
// metin --gold-ink (#1A1206, koyu kahve-siyah) ile yazılır (§2.7).

import Icon from "./Icon.jsx";

export default function QuestCard({
  title,
  subtitle,
  actionLabel,
  actionIcon = "play",
  onAction,
  className = "",
}) {
  return (
    <div
      className={`relative h-40 overflow-hidden rounded-card bg-surface ${className}`}
    >
      {/* Altın bölge — keskin diagonal kenar (~22°), sol-üstten sağ-alta */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gold"
        style={{ clipPath: "polygon(0 0, 62% 0, 44% 100%, 0 100%)" }}
      />

      <div className="relative flex h-full">
        {/* Altın taraf — metin --gold-ink ile */}
        <div className="flex w-[52%] flex-col justify-center py-4 pl-5 pr-2">
          <h3 className="text-h1 font-extrabold uppercase leading-[1.1] text-gold-ink">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1.5 text-caption font-medium text-gold-ink/80">{subtitle}</p>
          )}
        </div>

        {/* Koyu taraf — sub-buton */}
        <div className="flex flex-1 items-end justify-end p-4">
          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-bg px-3.5 text-caption font-semibold text-content outline-none transition-transform duration-instant ease-standard active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-glow/60"
            >
              <Icon name={actionIcon} size={12} strokeWidth={2.4} />
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
