import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import { appointments } from "../../mock/appointments.js";
import { machineById, MUSCLE_GROUPS } from "../../mock/machines.js";
import { currentUser } from "../../mock/user.js";

const labelOf = (id) => MUSCLE_GROUPS.find((m) => m.id === id)?.label || id;

export default function Dashboard() {
  const nav = useNavigate();
  const active = appointments.find((a) => a.status === "upcoming");

  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <p className="text-sm text-gray-400">Merhaba,</p>
        <h1 className="text-2xl font-extrabold text-gray-900">{currentUser.name} 👋</h1>
      </div>

      {/* Aktif randevu kartı */}
      {active ? (
        <Card className="overflow-hidden">
          <div className="bg-primary-600 px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary-100">
                Yaklaşan Randevu
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{active.time}</span>
              <span className="text-sm text-primary-100">
                {new Date(active.date).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="mb-2 text-xs font-semibold text-gray-400">Kas Grupları</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {active.muscleGroups.map((g) => (
                <Badge key={g} tone="primary">
                  {labelOf(g)}
                </Badge>
              ))}
            </div>
            <p className="mb-2 text-xs font-semibold text-gray-400">Planlanan Makineler</p>
            <div className="flex flex-wrap gap-1.5">
              {active.machines.map((m) => (
                <Badge key={m} tone="gray">
                  {machineById(m)?.name}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" full onClick={() => nav("/appointments")}>
                Yönet
              </Button>
              <Button size="sm" full onClick={() => nav("/machines")}>
                Makinelere Göz At
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card soft className="p-5 text-center">
          <p className="text-sm text-gray-500">Yaklaşan randevun yok.</p>
        </Card>
      )}

      {/* Hızlı aksiyonlar */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Card soft onClick={() => nav("/book")} className="p-5">
          <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-primary-600 text-xl text-white">
            ➕
          </div>
          <p className="text-sm font-bold text-gray-900">Randevu Al</p>
          <p className="text-xs text-gray-500">Slot seç, hemen ayır</p>
        </Card>
        <Card soft onClick={() => nav("/machines")} className="p-5">
          <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-gray-900 text-xl text-white">
            🏋️
          </div>
          <p className="text-sm font-bold text-gray-900">Makinelere Göz At</p>
          <p className="text-xs text-gray-500">Katalog & videolar</p>
        </Card>
        <Card soft onClick={() => nav("/muscle-groups")} className="p-5">
          <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-primary-500 text-xl text-white">
            💪
          </div>
          <p className="text-sm font-bold text-gray-900">Kas Grubu Seç</p>
          <p className="text-xs text-gray-500">Şema üzerinden</p>
        </Card>
        <Card soft onClick={() => nav("/feedback")} className="p-5">
          <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-primary-400 text-xl text-white">
            💬
          </div>
          <p className="text-sm font-bold text-gray-900">Geri Bildirim</p>
          <p className="text-xs text-gray-500">Arıza & öneri</p>
        </Card>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">İpuçları</h2>
          <Link to="/machines" className="text-xs font-semibold text-primary-600">
            Tümü
          </Link>
        </div>
        <Card className="flex items-center gap-3 p-4">
          <span className="text-2xl">🔥</span>
          <p className="text-sm text-gray-600">
            Antrenmandan önce 5-10 dk ısınmayı unutma. Kas grubuna özel ısınma listeni
            randevu ekranından görebilirsin.
          </p>
        </Card>
      </div>
    </div>
  );
}
