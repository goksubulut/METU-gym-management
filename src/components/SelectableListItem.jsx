// METU MOTION §2.2 (Selectable List Item / Chip) + §4.4 (liste tarafı animasyonu)
//
// Tekli seçim (radio — cinsiyet ekranı) veya çoklu seçim (checkbox — hedef kas
// listesi) öğesi. Hedef Kas ekranında bu bileşenin seçimi, AYNI state
// güncellemesiyle silüetteki kas bölgesini de tetikler (§4.4 kritik kuralı) —
// bileşen bunu bilmez, sadece onChange'i çağırır; senkronu ekran kurar.
//
// Ölçüler (§2.2): 48px yükseklik, radius = height/2, 1px --color-border-subtle,
// 16px yatay iç boşluk, 20px indicator.
//
// Hareket bölüşümü: renk geçişleri CSS transition (Framer `rgb(var(--x))`
// interpolate edemez), scale/opacity pop'u Framer Motion (--ease-pop).

import { motion } from "framer-motion";

const EASE_POP = [0.34, 1.56, 0.64, 1]; // --ease-pop

export default function SelectableListItem({
  label,
  selected = false,
  onChange,
  type = "checkbox",   // "radio" | "checkbox"
  disabled = false,
  full = false,
  className = "",
}) {
  return (
    <button
      type="button"
      role={type === "radio" ? "radio" : "checkbox"}
      aria-checked={selected}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!selected)}
      className={`flex h-12 items-center gap-3 rounded-full border px-4 text-left text-body text-content outline-none transition-[border-color,background-color,transform] duration-fast ease-standard active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-glow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
        selected ? "border-primary-600 bg-primary-50" : "border-subtle bg-transparent"
      } ${disabled ? "pointer-events-none opacity-40" : ""} ${full ? "w-full" : ""} ${className}`}
    >
      {/* §4.4 liste tarafı — indicator dolgusu (CSS) + pop'u (Framer) */}
      <motion.span
        className={`grid h-5 w-5 shrink-0 place-items-center border-[1.5px] transition-colors duration-fast ease-standard ${
          type === "radio" ? "rounded-full" : "rounded-md"
        } ${selected ? "border-primary-600 bg-primary-600" : "border-subtle bg-transparent"}`}
        animate={{ scale: selected ? 1 : 0.85 }}
        transition={{ duration: 0.15, ease: EASE_POP }}
      >
        <motion.svg
          viewBox="0 0 24 24"
          width={12}
          height={12}
          fill="none"
          stroke="#fff"
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.6 }}
          transition={{ duration: 0.12, ease: EASE_POP, delay: selected ? 0.04 : 0 }}
        >
          <path d="m5 12.5 5 5L19 7" />
        </motion.svg>
      </motion.span>

      <span className="truncate">{label}</span>
    </button>
  );
}
