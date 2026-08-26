// METU MOTION §2.4 (Wheel / Spinner Picker)
//
// Tarih seçimi için 3 kolonlu çark. Bu bileşen renk açısından TAMAMEN NÖTR —
// marka renginden bağımsızdır (spec §2.4). Merkez seçim bandı yalnızca
// --color-surface-muted zeminlidir, kırmızı kullanılmaz.
//
// Ölçüler: 36px satır, aynı anda 5 satır görünür (merkez 1.0, ±1 → 0.5, ±2 → 0.2).
// Özel giriş/highlight animasyonu yok — native scroll + snap yeterli (§2.4).

import { useEffect, useRef, useCallback } from "react";

const ROW = 36;
const VISIBLE = 5;
const PAD = ((VISIBLE - 1) / 2) * ROW; // 2 satır üstte, 2 altta

function Column({ items, value, onChange, ariaLabel }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const settle = useRef(0);

  // Seçili değer dışarıdan değişirse çarkı oraya kaydır.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const i = items.findIndex((it) => it.value === value);
    if (i < 0) return;
    const target = i * ROW;
    if (Math.abs(el.scrollTop - target) > 1) el.scrollTop = target;
  }, [value, items]);

  // Scroll dururken merkeze en yakın satırı seç. rAF ile okunur — her frame'de
  // state güncellemesi yapılmaz, yalnızca satır değiştiğinde onChange çağrılır.
  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const i = Math.round(el.scrollTop / ROW);
      const item = items[Math.min(items.length - 1, Math.max(0, i))];
      if (item && item.value !== value) onChange(item.value);
      // Opacity katmanlarını doğrudan DOM'da güncelle (React re-render'ı yok).
      Array.from(el.querySelectorAll("[data-row]")).forEach((row, idx) => {
        const d = Math.abs(idx - el.scrollTop / ROW);
        row.style.opacity = d < 0.5 ? "1" : d < 1.5 ? "0.5" : d < 2.5 ? "0.2" : "0.12";
        row.style.fontWeight = d < 0.5 ? "600" : "400";
        row.style.color = d < 0.5 ? "rgb(var(--content))" : "rgb(var(--muted))";
      });
      clearTimeout(settle.current);
    });
  }, [items, value, onChange]);

  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      role="listbox"
      aria-label={ariaLabel}
      tabIndex={0}
      className="no-scrollbar relative flex-1 snap-y snap-mandatory overflow-y-auto outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
      style={{ height: ROW * VISIBLE, scrollPaddingTop: PAD }}
    >
      <div style={{ paddingTop: PAD, paddingBottom: PAD }}>
        {items.map((it, idx) => (
          <div
            key={it.value}
            data-row={idx}
            role="option"
            aria-selected={it.value === value}
            className="flex snap-center items-center justify-center text-body tabular-nums"
            style={{ height: ROW }}
          >
            {it.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WheelPicker({ columns, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Merkez seçim bandı — 3 kolonu birden kapsar, nötr zemin (§2.4) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-band bg-surface"
        style={{ height: ROW }}
      />
      <div className="relative flex gap-2">
        {columns.map((c) => (
          <Column
            key={c.key}
            items={c.items}
            value={c.value}
            onChange={c.onChange}
            ariaLabel={c.label}
          />
        ))}
      </div>
    </div>
  );
}
