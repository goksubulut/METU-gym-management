import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Icon from "../../components/Icon.jsx";
import { machineById, machines, MUSCLE_GROUPS } from "../../mock/machines.js";
import { fetchAlternatives } from "../../api/catalog.js";

/** Backend kapalıysa mock'tan aynı mantıkla hesaplanır: kardiyo/kuvvet ayrımı +
 *  önce ince hedef kas örtüşmesi, sonra hedef paylaşma oranı (puan kullanılmaz). */
function mockAlternatives(source) {
  const sourceTargets = source.targetMuscles ?? [];
  const sourceIsCardio = source.muscles.includes("cardio");
  const shared = (m) => (m.targetMuscles ?? []).filter((t) => sourceTargets.includes(t));
  const sharedGroups = (m) => m.muscles.filter((x) => source.muscles.includes(x)).length;
  const ratio = (m) => {
    const total = (m.targetMuscles ?? []).length;
    return total > 0 ? shared(m).length / total : 0;
  };
  const alternativeMachines = machines
    .filter((m) => m.id !== source.id && m.muscles.some((x) => source.muscles.includes(x)))
    .filter((m) => m.muscles.includes("cardio") === sourceIsCardio)
    .sort(
      (a, b) =>
        shared(b).length - shared(a).length ||
        ratio(b) - ratio(a) ||
        sharedGroups(b) - sharedGroups(a) ||
        a.name.localeCompare(b.name),
    );
  const noDirectMatch =
    sourceTargets.length > 0 && alternativeMachines.every((m) => shared(m).length === 0);
  return {
    noDirectMatch,
    alternativeMachines,
    alternativeExercises: [
      { id: "x1", name: "Vücut ağırlığı varyasyonu", instructions: "Ekipmansız, aynı kas grubu" },
      { id: "x2", name: "Dambıl alternatifi", instructions: "Serbest ağırlık rafından" },
      { id: "x3", name: "Kablolu varyasyon", instructions: "Cable istasyonunda" },
    ],
  };
}

export default function Alternatives() {
  const { id } = useParams();
  const nav = useNavigate();
  const source = machineById(id);
  const [result, setResult] = useState(() => (source ? mockAlternatives(source) : null));

  // Gerçek öneri motoru (FR-RC-1..4): ortak kas grubu sayısı + puana göre sıralı.
  useEffect(() => {
    fetchAlternatives(id)
      .then(setResult)
      .catch(() => {});
  }, [id]);

  if (!source || !result)
    return <div className="p-8 text-center text-gray-400">Makine bulunamadı.</div>;

  const alts = result.alternativeMachines;
  const exercises = result.alternativeExercises;

  return (
    <div className="px-4 py-5">
      <button onClick={() => nav(-1)} className="mb-3 text-sm text-gray-400">
        ← Geri
      </button>

      <Card soft className="mb-5 flex items-center gap-3 p-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-primary-600 shadow-sm">
          <Icon name="ban" size={22} />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400">Dolu bulduğun makine</p>
          <p className="text-base font-extrabold text-gray-900">{source.name}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {source.muscles.map((mus) => (
              <Badge key={mus} tone="primary">
                {MUSCLE_GROUPS.find((x) => x.id === mus)?.label}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {result.noDirectMatch && (
        <Card soft className="mb-4 flex gap-3 p-4">
          <Icon name="bulb" size={20} className="mt-0.5 shrink-0 text-primary-600" />
          <div>
            <p className="text-sm font-bold text-gray-900">Birebir muadil yok</p>
            <p className="text-sm text-gray-600">
              Bu makinenin çalıştırdığı kası birebir hedefleyen başka bir makine salonda bulunmuyor.
              Aşağıdaki makineler aynı bölgeyi genel olarak çalıştırır; ayrıca egzersiz
              alternatiflerine göz atman önerilir.
            </p>
          </div>
        </Card>
      )}

      <h2 className="mb-2 text-base font-bold text-gray-900">
        Alternatif makineler
      </h2>
      {/* Liste formatı — kart değil */}
      <ul className="mb-6 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
        {alts.map((m) => (
          <li
            key={m.id}
            onClick={() => nav(`/machines/${m.id}`)}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-gray-900 text-white">
              {m.photoUrl ? (
                <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                <Icon name="dumbbell" size={16} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{m.name}</p>
              <p className="text-xs text-gray-400">{m.location}</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-primary-600">
              <Icon name="star" size={12} className="fill-primary-600" /> {m.rating}
            </span>
            <Icon name="chevronRight" size={14} className="text-gray-300" />
          </li>
        ))}
      </ul>

      <h2 className="mb-2 text-base font-bold text-gray-900">Egzersiz alternatifleri</h2>
      <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
        {exercises.map((e) => (
          <li key={e.id ?? e.name} className="flex items-center gap-3 px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gray-100 text-gray-600">
              <Icon name="body" size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{e.name}</p>
              <p className="text-xs text-gray-400">{e.instructions ?? e.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
