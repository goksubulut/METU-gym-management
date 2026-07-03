// Anatomik ön + arka vücut şeması. Referans gövde çizimi SVG path olarak yeniden çizildi.
// Her kas grubu tıklanabilir bölge. Renkler kırmızı temaya bağlı.

const BASE = "#E8E9EC";
const STROKE = "#2E3350";
const SEL = "#dc2626"; // primary-600 (seçili)
const HOVER = "#fca5a5"; // primary-300 (hover önizleme)
const MIRROR = "matrix(-1 0 0 1 300 0)";

// Dış kontur (açık) + gövde dolgusu (kapalı)
// NOT: Gövde/kol/omuz kısmı korundu; yalnızca bacak (kalça altı) konturu,
// iki bacağı net ayıran ters-V boşluğu için yeniden çizildi.
const CONT =
  "M150,14 C132,12 120,24 118,44 C116,58 123,73 132,81 C138,87 137,97 131,105 C116,109 100,112 86,122 C74,130 66,147 64,167 C62,190 63,214 66,236 C68,258 64,282 61,302 C60,312 61,318 63,322 C54,326 47,341 50,355 C52,363 62,363 68,355 C73,347 74,335 76,321 C79,303 83,283 88,259 C92,235 96,213 100,193 C106,211 111,253 110,291 C109,309 103,321 98,333 C94,351 84,388 85,420 C86,450 96,466 104,486 C99,508 91,536 94,562 C96,582 101,596 106,604 C99,610 98,621 102,629 C106,635 120,635 124,629 C126,621 125,609 124,601 C120,560 118,524 119,496 C120,472 124,448 130,418 C136,392 143,368 150,352";
const FILL = CONT + " L150,14 Z";

// Kas bölgeleri (sol taraf / merkez)
const D = {
  delt: "M86,122 C73,130 65,147 64,167 C74,177 90,175 98,163 C102,148 100,130 96,124 C93,121 89,121 86,122 Z",
  biceps: "M63,166 C60,190 61,218 68,242 C80,250 96,246 98,226 C98,203 92,181 84,167 C78,160 68,159 63,166 Z",
  pec: "M147,118 C126,113 105,119 95,132 C91,145 97,161 111,168 C127,174 142,167 147,153 C149,142 149,129 147,118 Z",
  abs: "M134,180 C143,177 157,177 166,180 C169,208 169,252 164,286 C159,300 150,306 150,306 C150,306 141,300 136,286 C131,252 131,208 134,180 Z",
  obl: "M126,214 C122,240 124,270 132,292 C135,280 135,242 133,218 C131,212 128,210 126,214 Z",
  // Ön uyluk (quad): geniş konturu dolduran dolgun kas kütlesi, dize kademeli daralır.
  quad: "M133,362 C117,358 102,364 92,390 C89,420 95,450 105,470 C111,478 121,476 126,462 C130,432 131,402 132,382 C132,375 133,368 133,362 Z",
  // Ön alt bacak (baldır/incik): dizin altında dolgun, ayak bileğine incelen bölge.
  shin: "M118,490 C107,489 99,500 97,524 C96,548 100,570 107,586 C111,591 116,588 117,578 C118,548 117,512 116,494 C116,491 117,490 118,490 Z",
  trap: "M150,103 C135,105 114,113 96,125 C112,140 132,158 150,178 C168,158 188,140 204,125 C186,113 165,105 150,103 Z",
  lat: "M100,168 C86,175 79,190 82,206 C88,232 100,262 118,285 C124,272 125,244 122,214 C119,190 112,172 106,166 C104,165 102,166 100,168 Z",
  lowback: "M134,284 C142,282 158,282 166,284 C168,300 165,318 158,330 C150,335 150,335 142,330 C135,318 132,300 134,284 Z",
  // Gluteus: yan yana iki ayrı oval, ortada dikey ince ayrım (cleft).
  glute: "M146,332 C133,330 121,337 117,351 C113,367 116,384 128,390 C137,393 144,390 146,381 C147,365 147,348 146,332 Z",
  // Hamstring (arka uyluk): geniş konturu dolduran dolgun form (silüetin içinde kalır).
  ham: "M134,396 C117,393 100,402 91,424 C89,448 96,470 105,486 C111,491 117,488 119,477 C121,452 124,426 128,404 C130,399 132,396 134,396 Z",
  // Arka alt bacak (baldır): geniş konturu dolduran dolgun form (silüetin içinde kalır).
  calf: "M119,496 C106,495 98,506 96,528 C95,552 100,574 108,588 C112,592 117,589 118,578 C119,548 118,514 117,498 C117,496 118,496 119,496 Z",
};
// Uyluk-baldır ayrımı, quad ve shin şekillerinin arasındaki gri boşlukla sağlanır;
// ayrı bir diz çizgisi çizilmez (çakışan/çapraz çizgi artefaktını önlemek için).
const ABS_LINES = "M134,206 H166 M134,233 H166 M133,260 H167 M150,180 V306";

const FRONT = [
  { group: "shoulders", d: D.delt, mirror: true },
  { group: "chest", d: D.pec, mirror: true },
  { group: "biceps", d: D.biceps, mirror: true },
  { group: "abs", d: D.abs },
  { group: "abs", d: D.obl, mirror: true },
  { group: "quads", d: D.quad, mirror: true },
  { group: "quads", d: D.shin, mirror: true },
];

const BACK = [
  { group: "shoulders", d: D.delt, mirror: true },
  { group: "back", d: D.trap },
  { group: "back", d: D.lat, mirror: true },
  { group: "back", d: D.lowback },
  { group: "triceps", d: D.biceps, mirror: true },
  { group: "glutes", d: D.glute, mirror: true },
  { group: "hamstrings", d: D.ham, mirror: true },
  { group: "hamstrings", d: D.calf, mirror: true },
];

function colorFor(group, selected, hovered) {
  if (selected.includes(group)) return SEL;
  if (hovered === group) return HOVER;
  return BASE;
}

function Region({ r, selected, hovered, onToggle, onHover }) {
  const fill = colorFor(r.group, selected, hovered);
  const props = {
    d: r.d,
    fill,
    stroke: STROKE,
    strokeWidth: 1.3,
    strokeLinejoin: "round",
    style: { transition: "fill .18s ease", cursor: "pointer" },
    onClick: () => onToggle(r.group),
    onMouseEnter: () => onHover(r.group),
    onMouseLeave: () => onHover(null),
  };
  return (
    <>
      <path {...props} />
      {r.mirror && <path {...props} transform={MIRROR} />}
    </>
  );
}

function Figure({ label, regions, showAbs, selected, hovered, onToggle, onHover }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <svg viewBox="0 0 300 690" className="w-full max-w-[190px]">
        {/* gövde dolgusu */}
        <path d={FILL} fill={BASE} />
        <path d={FILL} fill={BASE} transform={MIRROR} />
        {/* kas bölgeleri */}
        {regions.map((r, i) => (
          <Region
            key={i}
            r={r}
            selected={selected}
            hovered={hovered}
            onToggle={onToggle}
            onHover={onHover}
          />
        ))}
        {/* karın hatları */}
        {showAbs && (
          <path d={ABS_LINES} fill="none" stroke={STROKE} strokeWidth="1.1" />
        )}
        {/* dış kontur (tıklamayı engellemesin) */}
        <path d={CONT} fill="none" stroke={STROKE} strokeWidth="2" pointerEvents="none" />
        <path
          d={CONT}
          fill="none"
          stroke={STROKE}
          strokeWidth="2"
          pointerEvents="none"
          transform={MIRROR}
        />
      </svg>
      <span className="mt-1 text-xs font-semibold text-gray-400">{label}</span>
    </div>
  );
}

export default function BodyDiagram({ selected = [], onToggle, hovered, onHover }) {
  return (
    <div className="flex justify-center gap-2">
      <Figure
        label="Ön"
        regions={FRONT}
        showAbs
        selected={selected}
        hovered={hovered}
        onToggle={onToggle}
        onHover={onHover}
      />
      <Figure
        label="Arka"
        regions={BACK}
        selected={selected}
        hovered={hovered}
        onToggle={onToggle}
        onHover={onHover}
      />
    </div>
  );
}
