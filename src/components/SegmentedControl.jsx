// METU MOTION §2.3 (Segmented Control) + §4.5 (Sliding Thumb)
//
// İki (veya daha fazla) seçenek arası geçiş. Thumb `transform: translateX` ile
// kayar — `left`/`margin-left` gibi layout-tetikleyici property KULLANILMAZ
// (spec §5.6, layout thrashing'den kaçınmak için).
//
// Ölçüler (§2.3): 40px track, 4px iç padding, 32px thumb, radius = hap.
// Track --color-surface-muted, thumb --color-brand-red, aktif label beyaz.

import { motion } from "framer-motion";

export default function SegmentedControl({
  options,        // [{ value, label }]
  value,
  onChange,
  className = "",
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const pct = 100 / options.length;

  return (
    <div
      role="tablist"
      className={`relative inline-flex h-10 items-center rounded-full bg-surface p-1 ${className}`}
    >
      {/* Kayan thumb — mutlak konumlu, yalnızca translateX animasyonlanır */}
      <motion.span
        aria-hidden="true"
        className="absolute left-1 top-1 h-8 rounded-full bg-primary-600"
        style={{ width: `calc((100% - 8px) / ${options.length})` }}
        animate={{ x: `${index * 100}%` }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }} // --ease-motion
      />
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange?.(o.value)}
            style={{ width: `${pct}%` }}
            className={`relative z-10 h-8 whitespace-nowrap rounded-full px-4 text-caption font-semibold outline-none transition-colors duration-instant ease-standard focus-visible:ring-2 focus-visible:ring-glow/60 ${
              on ? "text-white" : "text-muted hover:text-content"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
