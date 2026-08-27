import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Tabs from "../../components/Tabs.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Icon from "../../components/Icon.jsx";
import Pagination from "../../components/Pagination.jsx";
import { Input } from "../../components/Input.jsx";
import { machines as mockMachines, CATEGORIES, MUSCLE_GROUPS } from "../../mock/machines.js";
import { MUSCLES } from "../../components/BodyDiagram.jsx";
import { fetchMachines } from "../../api/catalog.js";

const PAGE_SIZE_GRID = 12;
const PAGE_SIZE_LIST = 15;

/** Makine adı, kategori, konum ve kas grubu/hedef kas etiketlerinde arama. */
function machineMatchesQuery(machine, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const groupLabels = (machine.muscles ?? []).map(
    (id) => MUSCLE_GROUPS.find((g) => g.id === id)?.label ?? id,
  );
  const targetLabels = (machine.targetMuscles ?? []).map(
    (id) => MUSCLES[id]?.label ?? id,
  );
  const haystack = [machine.name, machine.category, machine.location, ...groupLabels, ...targetLabels]
    .join(" ")
    .toLocaleLowerCase("tr-TR");
  return haystack.includes(q);
}

export default function Machines() {
  const nav = useNavigate();
  const [machines, setMachines] = useState(mockMachines);
  const [cat, setCat] = useState("Tümü");
  const [q, setQ] = useState("");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchMachines()
      .then(setMachines)
      .catch(() => {});
  }, []);

  // Filtre değişince sayfayı sıfırla
  useEffect(() => { setPage(1); }, [cat, q, view]);

  const filtered = useMemo(
    () =>
      machines.filter(
        (m) => (cat === "Tümü" || m.category === cat) && machineMatchesQuery(m, q),
      ),
    [machines, cat, q],
  );

  const pageSize = view === "grid" ? PAGE_SIZE_GRID : PAGE_SIZE_LIST;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="px-4 py-5">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-tight text-gray-900">Makineler</h1>
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          {[["grid", "grid"], ["list", "list"]].map(([v, i]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`grid h-8 w-8 place-items-center rounded-md ${
                view === v ? "bg-surface text-accent shadow-sm" : "text-gray-400"
              }`}
            >
              <Icon name={i} size={15} />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <Input
          placeholder="Makine veya kas grubu ara (örn. göğüs, bacak)..."
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
        <>
          <div className="grid grid-cols-2 gap-3">
            {paged.map((m) => (
              <Card
                key={m.id}
                onClick={() => nav(`/machines/${m.id}`)}
                className="group overflow-hidden !rounded-[22px] p-0"
              >
                <div className="relative h-36 overflow-hidden">
                  {m.photoUrl ? (
                    <img
                      src={m.photoUrl}
                      alt={m.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-ink-800 to-ink-950 text-white/70">
                      <Icon name="dumbbell" size={34} strokeWidth={1.4} />
                    </div>
                  )}
                  {/* Okunurluk için alt karartma */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                  {/* Puan — cam pill (iOS) */}
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[11px] font-bold text-white ring-1 ring-white/20 backdrop-blur-md">
                    <Icon name="star" size={11} className="fill-glow text-glow" />
                    {m.rating}
                  </span>
                  {/* Video — cam pill */}
                  {m.hasVideo && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-md">
                      <Icon name="video" size={10} /> video
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-bold text-content">{m.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{m.category}</p>
                </div>
              </Card>
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={pageSize}
            onPage={setPage}
          />
        </>
      ) : (
        <>
          <div className="space-y-2">
            {paged.map((m) => (
              <Card key={m.id} onClick={() => nav(`/machines/${m.id}`)} className="flex items-center gap-3 p-2.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-ink-800 to-ink-950 text-white/80 ring-1 ring-white/10">
                  {m.photoUrl ? (
                    <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <Icon name="dumbbell" size={20} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-content">{m.name}</p>
                  <p className="text-xs text-muted">
                    {m.category} · {m.location}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-xs font-bold text-content ring-1 ring-white/10">
                  <Icon name="star" size={13} className="fill-glow text-glow" /> {m.rating}
                </span>
              </Card>
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={pageSize}
            onPage={setPage}
          />
        </>
      )}
    </div>
  );
}
