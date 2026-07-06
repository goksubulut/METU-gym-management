// İnteraktif anatomik kas haritası (ön + arka).
// Vücut modeli: react-native-body-highlighter v3.2.0 — MIT, Copyright (c) HichamELBSI.
// Path verisi: src/lib/body-data.js (kas-haritasi projesinden entegre edildi).
//
// Seçim İNCE TANELİDİR: her kas (quadriceps, calves, biceps...) ayrı seçilir ve
// kendi anatomik palet rengiyle boyanır. Kas → ana grup eşlemesi (makine
// kataloğu için) MUSCLES tablosundadır ve backend MuscleGroup.svgRegionCode
// sözleşmesiyle birebir aynıdır.

import { useState } from "react";
import { BODY_DATA } from "../lib/body-data.js";

/** Kas kataloğu: slug → {Türkçe ad, ana grup, seçim rengi [dolgu, kontur]}. */
export const MUSCLES = {
  chest: { label: "Göğüs (Pektoral)", group: "chest", color: ["#F0A868", "#B5713C"] },
  trapezius: { label: "Trapez", group: "back", color: ["#EF9A9A", "#A94444"] },
  "upper-back": { label: "Üst Sırt", group: "back", color: ["#B39DDB", "#6A4E9C"] },
  "lower-back": { label: "Bel (Erektör)", group: "back", color: ["#F48FB1", "#A85A78"] },
  deltoids: { label: "Omuz (Deltoid)", group: "shoulders", color: ["#81C784", "#4C7A4E"] },
  biceps: { label: "Biceps", group: "arms", color: ["#64B5F6", "#436F9E"] },
  triceps: { label: "Triceps", group: "arms", color: ["#F2AB9E", "#AE5546"] },
  forearm: { label: "Ön Kol", group: "arms", color: ["#AED581", "#6E8F46"] },
  abs: { label: "Karın (Abs)", group: "core", color: ["#E57373", "#A03A3A"] },
  obliques: { label: "Yan Karın (Oblik)", group: "core", color: ["#4FC3F7", "#3E6FA0"] },
  gluteal: { label: "Kalça (Gluteus)", group: "glutes", color: ["#9FA8DA", "#4E58A4"] },
  quadriceps: { label: "Ön Bacak (Quadriceps)", group: "legs", color: ["#7986CB", "#4E74AC"] },
  hamstring: { label: "Arka Bacak (Hamstring)", group: "legs", color: ["#4DD0E1", "#3B858F"] },
  adductors: { label: "İç Bacak (Adduktor)", group: "legs", color: ["#BA68C8", "#7C4E8A"] },
  abductors: { label: "Dış Bacak (Abduktor)", group: "legs", color: ["#FFB74D", "#B07A2A"] },
  calves: { label: "Baldır (Calf)", group: "legs", color: ["#CE93D8", "#8E4E84"] },
  tibialis: { label: "Kaval (Tibialis)", group: "legs", color: ["#4DB6AC", "#3F837C"] },
};

// Kas olmayan gövde parçaları (tıklanamaz) — ten/saç tonları
const BODY_PART_COLORS = {
  hair: ["#D9D2C7", "#B3AA9B"],
  head: ["#EBD1BC", "#C6A588"],
  neck: ["#EBD1BC", "#C6A588"],
  hands: ["#EBD1BC", "#C6A588"],
  feet: ["#EBD1BC", "#C6A588"],
  ankles: ["#EBD1BC", "#C6A588"],
  knees: ["#EBD1BC", "#C6A588"],
};

// Seçili olmayan kas: kartın beyaz zemininden net ayrışan nötr gri-bej.
const MUSCLE_BASE = ["#D6D0C8", "#9E9384"];

// Kaynak path verisinde (body-data.js) "abductors" için ayrı bir SVG bölgesi yok —
// sadece "adductors" var. Kalça abduktorleri (gluteus medius/minimus) anatomik olarak
// kalça/gluteal bölgesiyle aynı alanda olduğundan, seçili/hover olduğunda "gluteal"
// bölgesi abductors'ın rengiyle boyanır; böylece "Dış Bacak" çipi artık diyagramda
// görünür bir karşılık bulur (önceden hiçbir path'te data-muscle="abductors" yoktu).
const REGION_ALIASES = { gluteal: "abductors" };

function musclePaths(part) {
  return [...(part.path.common || []), ...(part.path.left || []), ...(part.path.right || [])];
}

function Muscle({ part, selected, hovered, onToggle, onHover }) {
  const ownMuscle = MUSCLES[part.slug];
  const aliasSlug = REGION_ALIASES[part.slug];
  const aliasActive = aliasSlug && (selected.includes(aliasSlug) || hovered === aliasSlug);
  const activeSlug = aliasActive ? aliasSlug : part.slug;
  const muscle = aliasActive ? MUSCLES[aliasSlug] : ownMuscle;
  const bodyColor = BODY_PART_COLORS[part.slug];

  let fill;
  let stroke;
  let fillOpacity = 1;
  if (muscle) {
    const isSelected = selected.includes(activeSlug);
    const isHovered = hovered === activeSlug;
    if (isSelected) [fill, stroke] = muscle.color;
    else if (isHovered) {
      [fill, stroke] = muscle.color;
      fillOpacity = 0.45;
    } else [fill, stroke] = MUSCLE_BASE;
  } else {
    [fill, stroke] = bodyColor || ["#E3DACD", "#C6A588"];
  }

  const interactive = ownMuscle
    ? {
        onClick: () => onToggle(part.slug),
        onMouseEnter: () => onHover(part.slug),
        onMouseLeave: () => onHover(null),
        style: { cursor: "pointer", transition: "fill .15s ease, fill-opacity .15s ease" },
      }
    : { pointerEvents: "none" };

  return musclePaths(part).map((d, i) => (
    <path
      key={i}
      d={d}
      data-muscle={ownMuscle ? part.slug : undefined}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeWidth="1"
      {...interactive}
    />
  ));
}

function Figure({ label, view, selected, hovered, onToggle, onHover }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <svg viewBox={view.viewBox} className="w-full max-w-[150px]" xmlns="http://www.w3.org/2000/svg">
        {view.outline && (
          <path d={view.outline} fill="none" stroke="#8A7B66" strokeWidth="2.5" pointerEvents="none" />
        )}
        {view.parts.map((part) => (
          <Muscle
            key={part.slug}
            part={part}
            selected={selected}
            hovered={hovered}
            onToggle={onToggle}
            onHover={onHover}
          />
        ))}
      </svg>
      <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
    </div>
  );
}

export default function BodyDiagram({ selected = [], onToggle, hovered, onHover }) {
  const [gender, setGender] = useState("male");
  const body = BODY_DATA[gender];

  return (
    <div>
      <div className="mb-3 flex justify-center">
        <div className="flex rounded-full bg-gray-100 p-0.5">
          {[
            ["male", "Erkek"],
            ["female", "Kadın"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setGender(value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                gender === value
                  ? "bg-white text-gray-900 shadow-card"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-3 rounded-2xl bg-gradient-to-b from-white to-[#f2eee8] p-3">
        <Figure
          label="Ön"
          view={body.front}
          selected={selected}
          hovered={hovered}
          onToggle={onToggle}
          onHover={onHover}
        />
        <Figure
          label="Arka"
          view={body.back}
          selected={selected}
          hovered={hovered}
          onToggle={onToggle}
          onHover={onHover}
        />
      </div>
    </div>
  );
}
