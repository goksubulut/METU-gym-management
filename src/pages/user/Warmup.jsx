import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Tabs from "../../components/Tabs.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Icon from "../../components/Icon.jsx";
import { useEffect, useState } from "react";
import { warmups } from "../../mock/feedback.js";
import { MUSCLE_GROUPS } from "../../mock/machines.js";
import { fetchMuscleGroupDetail } from "../../api/catalog.js";

/** API cevabındaki warmup/cooldown egzersizlerini mock sözleşmesine çevirir. */
function mapWarmupsFromApi(detail) {
  const toRow = (type) => (e) => ({ name: e.name, duration: e.duration ?? "", type });
  return [
    ...(detail.exercises?.warmup ?? []).map(toRow("Isınma")),
    ...(detail.exercises?.cooldown ?? []).map(toRow("Soğuma")),
  ];
}

export default function Warmup() {
  const { group } = useParams();
  const nav = useNavigate();
  const [active, setActive] = useState(group || "chest");
  const [apiLists, setApiLists] = useState({}); // groupId -> hareket listesi

  // FR-WU-1: seçilen kas grubunun ısınma/soğuma hareketleri API'den;
  // backend kapalıysa mock ile devam edilir.
  useEffect(() => {
    if (apiLists[active]) return;
    fetchMuscleGroupDetail(active)
      .then((detail) =>
        setApiLists((prev) => ({ ...prev, [active]: mapWarmupsFromApi(detail) })),
      )
      .catch(() => {});
  }, [active, apiLists]);

  const list = apiLists[active] ?? warmups[active] ?? [];

  const tabs = MUSCLE_GROUPS.filter((g) => warmups[g.id]).map((g) => ({
    value: g.id,
    label: g.label,
  }));

  return (
    <div className="px-4 py-5">
      <button onClick={() => nav(-1)} className="mb-3 text-sm text-gray-400">
        ← Geri
      </button>
      <h1 className="text-xl font-extrabold text-gray-900">Isınma & Soğuma</h1>
      <p className="mb-4 text-sm text-gray-500">
        Kas grubuna özel hareketler. Antrenman öncesi ve sonrası uygula.
      </p>

      <Tabs tabs={tabs} active={active} onChange={setActive} className="mb-4" />

      {list.length === 0 ? (
        <EmptyState title="Hareket bulunamadı" />
      ) : (
        <div className="space-y-2">
          {list.map((e, i) => (
            <Card key={i} className="flex items-center gap-3 p-3">
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                  e.type === "Isınma" ? "bg-primary-50 text-primary-600" : "bg-blue-50 text-blue-600"
                }`}
              >
                <Icon name={e.type === "Isınma" ? "flame" : "snowflake"} size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{e.name}</p>
                <p className="text-xs text-gray-400">{e.duration}</p>
              </div>
              <Badge tone={e.type === "Isınma" ? "primary" : "blue"}>{e.type}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
