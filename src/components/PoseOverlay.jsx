// METU MOTION §2.9 (Pose-Overlay Grafiği) + §4.8 (Pulse / Breathing Glow Loop)
//
// Onboarding ekranlarının marka motifi: desatüre bir koşucu fotoğrafı ve üstünde
// eklemleri temsil eden nokta-çizgi grafiği. İki katman da AYNI fit modunda
// (object-fit: cover) render edilir ki noktalar fotoğraftan kaymasın (§2.9.2).
//
// İki mod:
//   mode="image" (varsayılan) — pose-overlay.png şeffaf katmanı. Base ile birebir
//                aynı piksel boyutunda (960x1200) ve aynı çerçevelemede; iskelet
//                koşucunun anatomisine elle hizalanmış. Nabız SADECE bu katmana
//                uygulanır, fotoğraf sabit kalır (§2.9 + §4.8).
//   mode="svg"   — iskelet kod içinde SVG olarak çizilir (spec §6: "SVG — kod
//                içinde çizilebilir"). Yedek/karşılaştırma modu olarak duruyor.
//
// ÖNEMLİ: overlay ile base ASLA tek bir düz görselde birleştirilmemeli. Birleşik
// bir görselde drop-shadow nabzı fotoğrafın tamamını (koşucunun gövdesini de)
// parlatır — §4.8'in "yalnızca nokta/çizgi katmanı parlar" kuralı kırılır.
//
// Renk (§2.9): Opsiyon A = tek renk (glow kırmızı), Opsiyon B = noktalar altın +
// çizgiler beyaz. `colorMode` prop'u ile seçilir.
//
// Nabız animasyonu saf CSS'tir (index.css @keyframes pulse-glow). Sekme arka
// plana geçince `is-paused` ile durdurulur (§4.8 kural 2 — pil tüketimi).

import { useEffect, useState } from "react";

/** Koşucunun profil pozuna hizalanmış eklem konumları — 0-100 normalize uzay. */
export const RUNNER_JOINTS = {
  head:  [55, 9],
  shoulderNear: [53, 23],
  shoulderFar:  [40, 27],
  elbowNear: [69, 37],
  wristNear: [77, 25],
  elbowFar:  [24, 36],
  wristFar:  [19, 45],
  hip: [45, 58],
  kneeNear:  [62, 76],
  ankleNear: [71, 95],
  kneeFar:   [27, 79],
  ankleFar:  [9, 94],
};

/** İskelet bağlantıları (omuz-dirsek, dirsek-bilek, kalça-diz, diz-ayak bileği…). */
const BONES = [
  ["head", "shoulderNear"],
  ["shoulderNear", "shoulderFar"],
  ["shoulderNear", "elbowNear"], ["elbowNear", "wristNear"],
  ["shoulderFar", "elbowFar"],   ["elbowFar", "wristFar"],
  ["shoulderNear", "hip"],       ["shoulderFar", "hip"],
  ["hip", "kneeNear"], ["kneeNear", "ankleNear"],
  ["hip", "kneeFar"],  ["kneeFar", "ankleFar"],
];

/** Sekme görünürlüğünü izler — arka planda animasyon durdurulur (§4.8). */
function usePageVisible() {
  const [visible, setVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );
  useEffect(() => {
    const on = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  return visible;
}

export default function PoseOverlay({
  mode = "image",                     // "image" | "svg"
  colorMode = "A",                    // "A" tek renk | "B" altın nokta + beyaz çizgi
  base = "/images/pose-base.jpg",
  overlay = "/images/pose-overlay.png",
  breathe = false,                    // §4.8 kural 3 — opsiyonel ölçek nefesi
  objectPosition = "center",
  baseWidth = 960,                    // pose-base.jpg gerçek piksel genişliği
  baseHeight = 1200,                  //  "        "     "      "    yüksekliği
  className = "",
  priority = false,                   // splash'te true → preload
}) {
  const visible = usePageVisible();
  // object-position → SVG preserveAspectRatio hizası (ikisi aynı olmalı)
  const sliceAlign =
    objectPosition === "top"    ? "xMidYMin slice"
    : objectPosition === "bottom" ? "xMidYMax slice"
    : "xMidYMid slice";
  const paused = visible ? "" : "is-paused";

  const dotFill = colorMode === "B" ? "rgb(var(--gold))" : "rgb(var(--glow))";
  const lineStroke = colorMode === "B" ? "rgba(255,255,255,0.85)" : "rgb(var(--glow))";

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Alt katman — desatüre fotoğraf, sabit, animasyonsuz (§2.9) */}
      <img
        src={base}
        alt=""
        aria-hidden="true"
        draggable="false"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="absolute inset-0 h-full w-full select-none object-cover"
        style={{ objectPosition }}
      />

      {/* Üst katman — eklem grafiği. Aynı fit modu, aynı konumlandırma. */}
      {mode === "image" ? (
        <img
          src={overlay}
          alt=""
          aria-hidden="true"
          draggable="false"
          className={`pose-overlay-dots absolute inset-0 h-full w-full select-none object-cover ${
            breathe ? "pose-overlay-breathe" : ""
          } ${paused}`}
          style={{ objectPosition }}
        />
      ) : (
        // viewBox fotoğrafın EN-BOY ORANIYLA birebir aynı olmalı (varsayılan
        // 960x1200). Kare bir viewBox kullanılırsa `slice` ölçeklemesi
        // fotoğrafın object-fit: cover ölçeklemesinden sapar ve noktalar
        // kayar — §2.9.2'nin "aynı fit modu" kuralının tam da kırıldığı yer.
        <svg
          viewBox={`0 0 ${baseWidth} ${baseHeight}`}
          preserveAspectRatio={sliceAlign}
          aria-hidden="true"
          className={`pose-overlay-dots absolute inset-0 h-full w-full ${
            breathe ? "pose-overlay-breathe" : ""
          } ${paused}`}
        >
          <g
            stroke={lineStroke}
            strokeWidth={baseWidth * 0.005}
            strokeLinecap="round"
            fill="none"
          >
            {BONES.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={(RUNNER_JOINTS[a][0] / 100) * baseWidth}
                y1={(RUNNER_JOINTS[a][1] / 100) * baseHeight}
                x2={(RUNNER_JOINTS[b][0] / 100) * baseWidth}
                y2={(RUNNER_JOINTS[b][1] / 100) * baseHeight}
              />
            ))}
          </g>
          <g fill={dotFill}>
            {Object.entries(RUNNER_JOINTS).map(([k, [x, y]]) => (
              <circle
                key={k}
                cx={(x / 100) * baseWidth}
                cy={(y / 100) * baseHeight}
                r={baseWidth * 0.0095}
              />
            ))}
          </g>
        </svg>
      )}
    </div>
  );
}
