// METU MOTION §2.3 — Segmented Control (paylaşılan sürüm).
//
// 8 ekran bu bileşeni kullanıyor. Spec renkleri (kırmızı dolgulu aktif thumb,
// --color-surface-muted track) buraya uygulandı; API değişmedi.
//
// SegmentedControl.jsx'ten farkı: orada thumb ayrı bir katman olarak
// translateX ile KAYAR (§4.5). O, sabit sayıda ve eşit genişlikte segment
// gerektirir. Bu sürüm değişken sayıda/genişlikte, yatay kaydırılabilir
// sekmeler için; kayan thumb yerine renk crossfade'i kullanır.

export default function Tabs({ tabs, active, onChange, className = "" }) {
  return (
    <div
      role="tablist"
      className={`inline-flex max-w-full gap-1 overflow-x-auto no-scrollbar rounded-full bg-surface p-1 ${className}`}
    >
      {tabs.map((t) => {
        const value = t.value ?? t;
        const label = t.label ?? t;
        const on = value === active;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(value)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-caption font-semibold outline-none transition-[background-color,color,transform] duration-instant ease-standard active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-glow/60 ${
              on ? "bg-primary-600 text-white" : "text-muted hover:text-content"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
