import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Tabs from "../../components/Tabs.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Icon from "../../components/Icon.jsx";
import Pagination from "../../components/Pagination.jsx";
import { Input } from "../../components/Input.jsx";
import { MUSCLE_GROUPS } from "../../mock/machines.js";
import { fetchExercises } from "../../api/catalog.js";

const TYPES = [
  { value: "Tümü", label: "Tümü" },
  { value: "FREE", label: "Serbest" },
  { value: "WARMUP", label: "Isınma" },
  { value: "COOLDOWN", label: "Soğuma" },
];

const MUSCLE_TABS = [
  { value: "Tümü", label: "Tümü" },
  ...MUSCLE_GROUPS.map((g) => ({ value: g.id, label: g.label })),
];

const TYPE_ICON = { FREE: "dumbbell", WARMUP: "flame", COOLDOWN: "snowflake" };
const TYPE_LABEL = { FREE: "Serbest", WARMUP: "Isınma", COOLDOWN: "Soğuma" };
const TYPE_COLOR = {
  FREE: "bg-gray-900",
  WARMUP: "bg-primary-600",
  COOLDOWN: "bg-blue-600",
};

const PAGE_SIZE_GRID = 12;
const PAGE_SIZE_LIST = 15;

export default function Exercises() {
  const nav = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [type, setType] = useState("Tümü");
  const [muscle, setMuscle] = useState("Tümü");
  const [q, setQ] = useState("");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchExercises()
      .then(setExercises)
      .catch(() => {});
  }, []);

  // Filtre değişince sayfayı sıfırla
  useEffect(() => { setPage(1); }, [type, muscle, q, view]);

  const filtered = useMemo(
    () =>
      exercises.filter(
        (e) =>
          (type === "Tümü" || e.type === type) &&
          (muscle === "Tümü" || e.muscles.includes(muscle)) &&
          e.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [exercises, type, muscle, q],
  );

  const pageSize = view === "grid" ? PAGE_SIZE_GRID : PAGE_SIZE_LIST;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="px-4 py-5">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-tight text-gray-900">Egzersizler</h1>
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          {[["grid", "grid"], ["list", "list"]].map(([v, i]) => (
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
        <Input placeholder="Egzersiz ara..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Tabs tabs={TYPES} active={type} onChange={setType} className="mb-2" />
      <Tabs tabs={MUSCLE_TABS} active={muscle} onChange={setMuscle} className="mb-4" />

      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="Sonuç bulunamadı"
          description="Arama veya filtreni değiştirmeyi dene."
        />
      ) : view === "grid" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {paged.map((e) => (
              <Card key={e.id} soft onClick={() => nav(`/exercises/${e.id}`)} className="overflow-hidden">
                <div className={`grid h-24 place-items-center ${TYPE_COLOR[e.type] ?? "bg-gray-900"} text-white`}>
                  <Icon name={TYPE_ICON[e.type] ?? "dumbbell"} size={30} strokeWidth={1.5} />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-bold text-gray-900">{e.name}</p>
                  <p className="mb-2 text-[11px] text-gray-400">{TYPE_LABEL[e.type] ?? e.type}</p>
                  <div className="flex flex-wrap gap-1">
                    {e.muscles.slice(0, 2).map((mus) => (
                      <Badge key={mus} tone="primary">
                        {MUSCLE_GROUPS.find((x) => x.id === mus)?.label}
                      </Badge>
                    ))}
                  </div>
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
            {paged.map((e) => (
              <Card key={e.id} onClick={() => nav(`/exercises/${e.id}`)} className="flex items-center gap-3 p-3">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${TYPE_COLOR[e.type] ?? "bg-gray-900"} text-white`}>
                  <Icon name={TYPE_ICON[e.type] ?? "dumbbell"} size={19} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">{e.name}</p>
                  <p className="text-xs text-gray-400">
                    {TYPE_LABEL[e.type] ?? e.type}
                    {e.duration ? ` · ${e.duration}` : ""}
                  </p>
                </div>
                <Icon name="chevronRight" size={16} className="text-gray-300" />
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
