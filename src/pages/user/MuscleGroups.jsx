import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Icon from "../../components/Icon.jsx";
import BodyDiagram, { MUSCLES } from "../../components/BodyDiagram.jsx";
import { machinesByMuscle } from "../../mock/machines.js";

// Panel bölümleri: ana grup başlığı altında o gruba ait ince kaslar.
// Grup id'leri backend MuscleGroup.id ile birebir aynı.
const SECTIONS = [
  { group: "chest", title: "Göğüs" },
  { group: "back", title: "Sırt" },
  { group: "shoulders", title: "Omuz" },
  { group: "arms", title: "Kol" },
  { group: "core", title: "Karın" },
  { group: "glutes", title: "Kalça" },
  { group: "legs", title: "Bacak" },
];

const muscleEntries = Object.entries(MUSCLES); // [slug, {label, group, color}]

export default function MuscleGroups() {
  const nav = useNavigate();
  const [selected, setSelected] = useState([]); // ince kas slug'ları
  const [hovered, setHovered] = useState(null);
  const [cardio, setCardio] = useState(false);

  const toggle = (slug) =>
    setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  const clearAll = () => {
    setSelected([]);
    setCardio(false);
  };

  // Seçili kaslardan ana gruplar türetilir; makine eşleşmesi grup bazlıdır.
  const activeGroups = useMemo(() => {
    const groups = new Set(selected.map((slug) => MUSCLES[slug].group));
    if (cardio) groups.add("cardio");
    return [...groups];
  }, [selected, cardio]);

  const machines = useMemo(() => {
    const seen = new Set();
    const out = [];
    activeGroups.forEach((g) =>
      machinesByMuscle(g).forEach((m) => {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          out.push(m);
        }
      }),
    );
    return out;
  }, [activeGroups]);

  const hasSelection = selected.length > 0 || cardio;

  return (
    <div className="pb-4">
      {/* Üst bar */}
      <div className="hero-sheen flex items-center justify-between bg-gray-900 bg-gradient-to-r from-ink-900 to-ink-800 px-4 py-4 text-white">
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight">Kas Haritası</h1>
          <p className="text-[11px] text-white/50">Çalıştırmak istediğin kasa dokun</p>
        </div>
        <button
          onClick={clearAll}
          disabled={!hasSelection}
          className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30"
        >
          Temizle
        </button>
      </div>

      <div className="px-4 py-4">
        {/* Vücut şeması — ön + arka yan yana */}
        <Card className="animate-rise p-3">
          <BodyDiagram
            selected={selected}
            onToggle={toggle}
            hovered={hovered}
            onHover={setHovered}
          />
        </Card>

        {/* Seçili kas etiketleri */}
        <div className="mt-3 min-h-[28px]">
          {!hasSelection ? (
            <p className="text-xs text-gray-400">
              Haritaya dokun veya aşağıdan kas seç. Her kas kendi rengiyle işaretlenir.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((slug) => (
                <button
                  key={slug}
                  onClick={() => toggle(slug)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-card"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: MUSCLES[slug].color[0] }}
                  />
                  {MUSCLES[slug].label}
                  <Icon name="x" size={11} className="text-gray-400" />
                </button>
              ))}
              {cardio && (
                <button
                  onClick={() => setCardio(false)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-card"
                >
                  <span className="h-2 w-2 rounded-full bg-primary-500" />
                  Kardiyo
                  <Icon name="x" size={11} className="text-gray-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Kas seçim paneli — gruplara ayrılmış ince kas çipleri */}
        <div className="animate-rise-late mt-5 space-y-4">
          {SECTIONS.map((section) => (
            <div key={section.group}>
              <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                {section.title}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {muscleEntries
                  .filter(([, m]) => m.group === section.group)
                  .map(([slug, m]) => {
                    const on = selected.includes(slug);
                    return (
                      <button
                        key={slug}
                        onClick={() => toggle(slug)}
                        onMouseEnter={() => setHovered(slug)}
                        onMouseLeave={() => setHovered(null)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                          on
                            ? "border-transparent text-white shadow-card"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                        style={on ? { background: m.color[1] } : undefined}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: on ? "rgba(255,255,255,.75)" : m.color[0] }}
                        />
                        {m.label}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Kardiyo — haritada bölgesi yok, ayrı seçim */}
          <div>
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
              Kondisyon
            </h2>
            <button
              onClick={() => setCardio((c) => !c)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                cardio
                  ? "border-transparent bg-primary-600 text-white shadow-glow"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <Icon name="flame" size={13} />
              Kardiyo
            </button>
          </div>
        </div>

        {/* Eşleşen makineler — canlı güncellenir */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Eşleşen Makineler</h2>
            <Badge tone="primary">{machines.length}</Badge>
          </div>

          {machines.length === 0 ? (
            <EmptyState
              icon="body"
              title="Kas seç"
              description="Seçtiğin kasları çalıştıran makineler burada listelenir."
            />
          ) : (
            <div className="space-y-2">
              {machines.map((m) => (
                <Card
                  key={m.id}
                  onClick={() => nav(`/machines/${m.id}`)}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gray-900 text-white">
                    <Icon name="dumbbell" size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{m.name}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                      <Icon name="mapPin" size={11} />
                      {m.location}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-bold text-primary-600">
                    <Icon name="star" size={14} className="fill-primary-600" />
                    {m.rating}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>

        {hasSelection && (
          <Button
            full
            size="lg"
            className="mt-5"
            onClick={() =>
              nav("/warmup/" + (selected.length ? MUSCLES[selected[0]].group : "cardio"))
            }
          >
            <Icon name="flame" size={18} />
            Isınma Hareketlerini Gör
          </Button>
        )}
      </div>
    </div>
  );
}
