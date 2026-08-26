// METU MOTION §2.8 — Kas Bölgesi Highlight Sistemi
//
// Mevcut BodyDiagram.jsx'ten AYRI bir bileşendir ve bilinçli olarak öyle:
// BodyDiagram her kası kendi anatomik paletiyle boyar (öğretici amaç, 5 ekranda
// kullanılıyor); bu bileşen ise spec §1.1'in tek-aksan kuralına uyar —
// seçili bölge --color-glow-red, seçilmemiş --color-surface-muted.
//
// Mimari (§2.8):
//   1. Her kas bölgesi ayrı bir <path>, benzersiz data-muscle id'siyle.
//   2. İki görsel state: inactive / active — SADECE fill/filter/transform.
//   3. selectedMuscles Set'i tek gerçek kaynak; path'in `d`'si hiç değişmez.
//   4. Ön ve arka path setleri İKİSİ DE render edilir, flip sırasında yalnızca
//      görünürlük değişir — hiçbir path yeniden çizilmez/parse edilmez (§5.4).

import { BODY_DATA } from "../lib/body-data.js";
import { MUSCLES } from "./BodyDiagram.jsx";

/** Bir bölgenin tüm path parçaları (ortak + sol + sağ). */
function partPaths(part) {
  return [...(part.path.common || []), ...(part.path.left || []), ...(part.path.right || [])];
}

/** Bir görünümdeki seçilebilir kas slug'ları (MUSCLES kataloğunda karşılığı olanlar). */
export function selectableMuscles(gender, view) {
  return BODY_DATA[gender][view].parts
    .filter((p) => MUSCLES[p.slug])
    .map((p) => p.slug);
}

function View({ gender, view, selected, onToggle, hidden }) {
  const data = BODY_DATA[gender][view];
  return (
    <svg
      viewBox={data.viewBox}
      className="h-full w-full"
      style={{ display: hidden ? "none" : "block" }}
      xmlns="http://www.w3.org/2000/svg"
      role="group"
      aria-label={view === "front" ? "Ön görünüm kas haritası" : "Arka görünüm kas haritası"}
    >
      {data.outline && (
        <path
          d={data.outline}
          fill="none"
          stroke="rgb(var(--border-subtle))"
          strokeWidth="2.5"
          pointerEvents="none"
        />
      )}
      {data.parts.map((part) => {
        const muscle = MUSCLES[part.slug];
        const active = muscle && selected.has(part.slug);
        return partPaths(part).map((d, i) => (
          <path
            key={`${part.slug}-${i}`}
            d={d}
            data-muscle={muscle ? part.slug : undefined}
            className={
              muscle
                ? `muscle-region is-selectable ${active ? "is-active" : ""}`
                : "body-inert"
            }
            onClick={muscle ? () => onToggle(part.slug) : undefined}
          />
        ));
      })}
    </svg>
  );
}

export default function MuscleSilhouette({
  gender = "male",
  view = "front",
  selected,               // Set<string>
  onToggle,
  className = "",
}) {
  return (
    <div className={className}>
      {/* İki görünüm de DOM'da — flip sırasında sadece display değişir (§5.4) */}
      <View gender={gender} view="front" selected={selected} onToggle={onToggle} hidden={view !== "front"} />
      <View gender={gender} view="back"  selected={selected} onToggle={onToggle} hidden={view !== "back"} />
    </div>
  );
}
