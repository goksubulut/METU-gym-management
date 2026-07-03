import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Icon from "../../components/Icon.jsx";
import { machineById, machines, MUSCLE_GROUPS } from "../../mock/machines.js";

export default function Alternatives() {
  const { id } = useParams();
  const nav = useNavigate();
  const source = machineById(id);
  if (!source)
    return <div className="p-8 text-center text-gray-400">Makine bulunamadı.</div>;

  // Aynı kas grubunu çalıştıran diğer makineler = alternatif.
  const alts = machines.filter(
    (m) => m.id !== source.id && m.muscles.some((x) => source.muscles.includes(x))
  );

  // Egzersiz alternatifleri (makinesiz).
  const exercises = [
    { name: "Vücut ağırlığı varyasyonu", note: "Ekipmansız, aynı kas grubu" },
    { name: "Dambıl alternatifi", note: "Serbest ağırlık rafından" },
    { name: "Kablolu varyasyon", note: "Cable istasyonunda" },
  ];

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
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gray-900 text-white">
              <Icon name="dumbbell" size={16} />
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
          <li key={e.name} className="flex items-center gap-3 px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gray-100 text-gray-600">
              <Icon name="body" size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{e.name}</p>
              <p className="text-xs text-gray-400">{e.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
