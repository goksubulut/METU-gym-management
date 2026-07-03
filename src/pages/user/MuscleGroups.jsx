import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import BodyDiagram from "../../components/BodyDiagram.jsx";
import { machinesByMuscle } from "../../mock/machines.js";

// Şemadaki bölgelerle birebir eşleşen kas grupları.
// muscle: makine kataloğundaki kaba kas kimliği (eşleştirme için).
const GROUPS = [
  { id: "chest", label: "Göğüs", icon: "🫀", muscle: "chest" },
  { id: "back", label: "Sırt", icon: "🔻", muscle: "back" },
  { id: "shoulders", label: "Omuz", icon: "🎽", muscle: "shoulders" },
  { id: "biceps", label: "Biceps", icon: "💪", muscle: "arms" },
  { id: "triceps", label: "Triceps", icon: "🦾", muscle: "arms" },
  { id: "abs", label: "Karın", icon: "🧊", muscle: "core" },
  { id: "glutes", label: "Kalça", icon: "🍑", muscle: "glutes" },
  { id: "quads", label: "Bacak Ön", icon: "🦵", muscle: "legs" },
  { id: "hamstrings", label: "Bacak Arka", icon: "🦿", muscle: "legs" },
];

const labelOf = (id) => GROUPS.find((g) => g.id === id)?.label || id;

export default function MuscleGroups() {
  const nav = useNavigate();
  const [selected, setSelected] = useState([]);
  const [hovered, setHovered] = useState(null);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  // Seçilen gruplara karşılık gelen makineler (birleşim, tekilleştirilmiş).
  const machines = useMemo(() => {
    const muscles = new Set(
      selected.map((id) => GROUPS.find((g) => g.id === id)?.muscle).filter(Boolean)
    );
    const seen = new Set();
    const out = [];
    muscles.forEach((mu) =>
      machinesByMuscle(mu).forEach((m) => {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          out.push(m);
        }
      })
    );
    return out;
  }, [selected]);

  return (
    <div className="pb-4">
      {/* Üst bar (kırmızı) */}
      <div className="flex items-center justify-between bg-primary-600 px-4 py-3 text-white">
        <h1 className="text-base font-extrabold">Kas Grubu Seç</h1>
        <button
          onClick={() => setSelected([])}
          disabled={selected.length === 0}
          className="text-xs font-semibold text-white/90 disabled:opacity-40"
        >
          Seçimi Temizle
        </button>
      </div>

      <div className="px-4 py-4">
        {/* Vücut şeması — ön + arka yan yana */}
        <Card className="p-3">
          <BodyDiagram
            selected={selected}
            onToggle={toggle}
            hovered={hovered}
            onHover={setHovered}
          />
        </Card>

        {/* Seçili etiketler */}
        <div className="mt-3 min-h-[28px]">
          {selected.length === 0 ? (
            <p className="text-xs text-gray-400">
              Şemaya dokun veya aşağıdan bir kas grubu seç.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((id) => (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700"
                >
                  {labelOf(id)} <span className="text-primary-400">✕</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtre paneli — şema ile senkron */}
        <div className="mt-4">
          <h2 className="mb-2 text-sm font-bold text-gray-900">Kas Grupları</h2>
          <div className="grid grid-cols-2 gap-2">
            {GROUPS.map((g) => {
              const on = selected.includes(g.id);
              return (
                <label
                  key={g.id}
                  onMouseEnter={() => setHovered(g.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
                    on
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200 bg-white hover:border-primary-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(g.id)}
                    className="h-4 w-4 accent-primary-600"
                  />
                  <span className="text-base">{g.icon}</span>
                  <span className="text-sm font-semibold text-gray-700">{g.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Eşleşen makineler — canlı güncellenir */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Eşleşen Makineler</h2>
            <Badge tone="primary">{machines.length}</Badge>
          </div>

          {machines.length === 0 ? (
            <EmptyState
              icon="🏋️"
              title="Kas grubu seç"
              description="Seçtiğin gruba uygun makineler burada listelenir."
            />
          ) : (
            <div className="space-y-2">
              {machines.map((m) => (
                <Card
                  key={m.id}
                  onClick={() => nav(`/machines/${m.id}`)}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-lg">
                    🏋️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.location}</p>
                  </div>
                  <span className="text-sm font-bold text-primary-600">★ {m.rating}</span>
                </Card>
              ))}
            </div>
          )}
        </div>

        {selected.length > 0 && (
          <Button
            full
            size="lg"
            className="mt-5"
            onClick={() =>
              nav("/warmup/" + (GROUPS.find((g) => g.id === selected[0])?.muscle || "chest"))
            }
          >
            Isınma Hareketlerini Gör
          </Button>
        )}
      </div>
    </div>
  );
}
