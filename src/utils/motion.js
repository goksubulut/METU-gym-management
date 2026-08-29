// METU MOTION §1.5 — hareket süreleri ve eğrileri, TEK KAYNAK (JS tarafı).
//
// CSS karşılıkları index.css'te (--duration-*, --ease-*) ve Tailwind'de
// (duration-fast, ease-pop…). Framer Motion saniye cinsinden sayı istediği
// için burada ayrıca JS sabiti olarak tutulur — ikisi elle senkron kalır.
//
// Süreler spec'in temel değerlerinin ~1.35 katı: kullanıcı geri bildirimi
// "geçişler biraz hızlı, azıcık daha yavaş olabilir". Oran korunarak
// ölçeklendi, yani hareketlerin birbirine göre ritmi değişmedi.

/** Saniye cinsinden (Framer Motion için). */
export const D = {
  instant: 0.16,  // basma/press feedback      (spec 120ms)
  fast: 0.24,     // küçük pop/highlight        (spec 180ms)
  base: 0.30,     // stagger, segmented slide   (spec 220ms)
  slow: 0.50,     // ekran girişi               (spec 380ms)
  flip: 0.36,     // 3D/sahte flip toplam       (spec 260ms)
  exit: 0.20,     // ekran çıkışı               (spec 150ms)
};

/** Liste öğeleri arası gecikme farkı (saniye). */
export const STAGGER_STEP = 0.09; // spec 70ms

/** Easing eğrileri — index.css'teki --ease-* ile birebir aynı. */
export const EASE = {
  standard: [0.16, 1, 0.3, 1],    // --ease-standard (expo-out)
  motion: [0.4, 0, 0.2, 1],       // --ease-motion   (fade, flip)
  pop: [0.34, 1.56, 0.64, 1],     // --ease-pop      (seçim onayı)
};
