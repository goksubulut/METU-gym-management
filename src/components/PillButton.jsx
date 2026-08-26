// METU MOTION §2.1 (Primary Pill Button) + §4.3 (Line-to-Pill Morph Reveal)
//
// Ekranın ana ilerleme aksiyonu. Girişi basit bir fade-in DEĞİLDİR: buton önce
// ince bir çizgi (32×4px) olarak belirir, sonra genişleyerek hap şekline döner.
//
// Ölçüler (§2.1): 52px yükseklik, ekran genişliği − 2×24px, radius = height/2,
// solid --color-brand-red dolgu (gradient yok), beyaz metin, ikonla 6px ara.
//
// Perf (§5.7): morph TEK bir container üzerinde tek bir width/height/borderRadius
// tween'i olarak çalışır — ayrı ayrı elemanlar animasyonlanmaz.

import { motion } from "framer-motion";
import Icon from "./Icon.jsx";

const EASE = [0.16, 1, 0.3, 1]; // --ease-standard

export default function PillButton({
  children,
  icon = "arrow-right",   // sağdaki ikon; null verilirse ikon yok
  iconPosition = "right",
  onClick,
  disabled = false,
  reveal = true,          // false → morph atlanır, buton hazır durumda gelir
  revealDelay = 0,        // saniye
  type = "button",
  className = "",
  ...rest
}) {
  const iconEl = icon ? <Icon name={icon} size={16} strokeWidth={2.2} /> : null;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // §4.3 ADIM 1 — şekil morph'u (180ms). Yükseklik/genişlik/radius birlikte.
      initial={reveal ? { width: 32, height: 4, borderRadius: 2 } : false}
      animate={{ width: "100%", height: 52, borderRadius: 26 }}
      transition={{ duration: 0.18, ease: EASE, delay: revealDelay }}
      // §2.1 pressed state — scale(0.97), 100ms
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`relative mx-auto flex items-center justify-center gap-1.5 overflow-hidden bg-primary-600 text-button text-white shadow-cta outline-none transition-[background-color,opacity] duration-instant ease-standard focus-visible:ring-2 focus-visible:ring-glow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 ${className}`}
      {...rest}
    >
      {/* §4.3 ADIM 2 — içerik girişi (120ms, morph'un son 140ms'inde başlar) */}
      <motion.span
        className="flex items-center gap-1.5 whitespace-nowrap"
        initial={reveal ? { opacity: 0, y: 4 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.12, ease: EASE, delay: revealDelay + 0.14 }}
      >
        {iconPosition === "left" && iconEl}
        {children}
        {iconPosition === "right" && iconEl}
      </motion.span>
    </motion.button>
  );
}
