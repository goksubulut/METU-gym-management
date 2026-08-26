// METU MOTION — grafik renkleri için token köprüsü.
//
// Recharts / reaviz / <canvas> düz renk stringi ister; CSS değişkeni kabul
// etmezler. Bu yüzden token'lar computed style'dan okunup sayıya çevrilir.
// Hardcode hex yazmak yerine HER ZAMAN bu yol kullanılır — aksi halde marka
// veya tema değiştiğinde grafikler geride kalır (nitekim kalmışlardı:
// grafiklerde DESIGN.md'nin açıkça yasakladığı jenerik #dc2626 duruyordu).

import { useEffect, useState } from "react";

const THEME_EVENT = "themechange";

/** "--primary-600" → "rgb(227, 24, 55)" (alpha verilirse rgba). */
export function token(name, fallback = "#888", alpha) {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const p = raw.split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n));
  if (p.length !== 3) return raw || fallback;
  return alpha === undefined
    ? `rgb(${p[0]}, ${p[1]}, ${p[2]})`
    : `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${alpha})`;
}

function snapshot() {
  return {
    brand: token("--primary-600", "#E31837"),
    glow: token("--glow", "#FF3B4E"),
    gold: token("--gold", "#F2A93B"),
    available: token("--available", "#34D399"),
    busy: token("--busy", "#FBBF24"),
    info: token("--info", "#60A5FA"),
    content: token("--content", "#fff"),
    muted: token("--muted", "#A5A5AA"),
    faint: token("--faint", "#7A7A80"),
    surface: token("--surface", "#1A1A1C"),
    grid: token("--border-subtle", "#3A3A3D", 0.55),
    axis: token("--faint", "#7A7A80"),
    brandFade: token("--primary-600", "#E31837", 0.3),
  };
}

/** Tema değişince otomatik güncellenen grafik paleti. */
export function useChartColors() {
  const [colors, setColors] = useState(snapshot);
  useEffect(() => {
    const refresh = () => setColors(snapshot());
    refresh(); // ilk boyamadan sonra gerçek değerleri al
    window.addEventListener(THEME_EVENT, refresh);
    return () => window.removeEventListener(THEME_EVENT, refresh);
  }, []);
  return colors;
}

/** Kadran/kategori serileri için sıralı palet (Matrix scatter vb.). */
export function categoricalPalette(c) {
  return [c.available, c.brand, c.info, c.faint];
}

/** Tek renkli (marka) sıralı seri paleti — pasta/donut dilimleri için.
 *  Eski mock/analytics.js'teki sabit dizi (jenerik #dc2626 ailesi) yerine
 *  marka rampasından türer, temayla birlikte döner. */
export function seriesPalette() {
  return [
    token("--primary-600", "#E31837"),
    token("--primary-400", "#ED5C6F"),
    token("--primary-300", "#F48A98"),
    token("--primary-800", "#A00E24"),
    token("--primary-200", "#541621"),
    token("--glow", "#FF3B4E"),
  ];
}
