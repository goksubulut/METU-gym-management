import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Tabs from "../../components/Tabs.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Icon from "../../components/Icon.jsx";
import { Input } from "../../components/Input.jsx";
import { machines as mockMachines, CATEGORIES } from "../../mock/machines.js";
import { fetchMachines } from "../../api/catalog.js";

export default function Machines() {
  const nav = useNavigate();
  const [machines, setMachines] = useState(mockMachines);
  const [cat, setCat] = useState("Tümü");
  const [q, setQ] = useState("");
  const [view, setView] = useState("grid");

  // Katalog API'den yüklenir; backend kapalıysa mock ile devam edilir.
  useEffect(() => {
    fetchMachines()
      .then(setMachines)
      .catch(() => {});
  }, []);

  const filtered = machines.filter(
    (m) =>
      (cat === "Tümü" || m.category === cat) &&
      m.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="px-4 py-5">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-tight text-gray-900">Makineler</h1>
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          {[
            ["grid", "grid"],
            ["list", "list"],
          ].map(([v, i]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`grid h-8 w-8 place-items-center rounded-md ${
                view === v ? "bg-white text-primary-600 shadow-sm" : "text-gray-400"
              }`}
            >
              <Icon name={i} size={15} />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <Input
          placeholder="Makine ara..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Tabs tabs={CATEGORIES} active={cat} onChange={setCat} className="mb-4" />

      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="Sonuç bulunamadı"
          description="Arama veya filtreni değiştirmeyi dene."
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((m) => (
            <Card key={m.id} soft onClick={() => nav(`/machines/${m.id}`)} className="overflow-hidden">
              <div className="hero-sheen relative grid h-24 place-items-center overflow-hidden bg-gray-900 bg-gradient-to-br from-ink-800 to-ink-950 text-white/85">
                {m.photoUrl ? (
                  <img src={m.photoUrl} alt={m.name} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <Icon name="dumbbell" size={34} strokeWidth={1.4} />
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold text-gray-900">{m.name}</p>
                <p className="mb-2 text-[11px] text-gray-400">{m.category}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-bold text-primary-600">
                    <Icon name="star" size={12} className="fill-primary-600" /> {m.rating}
                  </span>
                  {m.hasVideo && (
                    <Badge tone="gray">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="video" size={11} /> video
                      </span>
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <Card key={m.id} onClick={() => nav(`/machines/${m.id}`)} className="flex items-center gap-3 p-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gray-900 text-white">
                {m.photoUrl ? (
                  <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />
                ) : (
                  <Icon name="dumbbell" size={20} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-400">
                  {m.category} · {m.location}
                </p>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-primary-600">
                <Icon name="star" size={14} className="fill-primary-600" /> {m.rating}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
