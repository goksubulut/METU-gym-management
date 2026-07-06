import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Icon from "../../components/Icon.jsx";
import Spinner from "../../components/Spinner.jsx";
import { appointments as mockAppointments } from "../../mock/appointments.js";
import { machineById, MUSCLE_GROUPS } from "../../mock/machines.js";
import { getAccessToken } from "../../api/client.js";
import { fetchMyAppointments, mapAppointmentFromApi } from "../../api/bookings.js";

const labelOf = (id) => MUSCLE_GROUPS.find((m) => m.id === id)?.label || id;

const QUICK_ACTIONS = [
  { to: "/book", icon: "plus", title: "Randevu Al", desc: "Slot seç, hemen ayır", tone: "bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow" },
  { to: "/machines", icon: "dumbbell", title: "Makineler", desc: "Katalog & videolar", tone: "bg-gray-900" },
  { to: "/exercises", icon: "flame", title: "Egzersizler", desc: "Serbest, ısınma & soğuma", tone: "bg-gray-900" },
  { to: "/muscle-groups", icon: "body", title: "Kas Haritası", desc: "Anatomiden seç", tone: "bg-gray-900" },
  { to: "/feedback", icon: "message", title: "Geri Bildirim", desc: "Arıza & öneri", tone: "bg-gray-900" },
];

function getProfile() {
  try {
    const raw = localStorage.getItem("authUser");
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { name: "Misafir" };
}

function pickNextUpcoming(rows) {
  return rows
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => {
      const da = `${a.date}T${a.time}`;
      const db = `${b.date}T${b.time}`;
      return da.localeCompare(db);
    })[0];
}

export default function Dashboard() {
  const nav = useNavigate();
  const location = useLocation();
  const [profile] = useState(getProfile);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      setActive(pickNextUpcoming(mockAppointments));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const apiRows = await fetchMyAppointments();
      const mapped = apiRows.map(mapAppointmentFromApi);
      setActive(pickNextUpcoming(mapped.length ? mapped : mockAppointments));
    } catch {
      setActive(pickNextUpcoming(mockAppointments));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, location.pathname]);

  return (
    <div className="px-4 py-5">
      <div className="animate-rise mb-5">
        <p className="text-sm text-gray-400">Merhaba,</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900">
          {profile.name}
        </h1>
      </div>

      {loading ? (
        <Card soft className="animate-rise p-8">
          <Spinner label="Randevular yükleniyor…" />
        </Card>
      ) : active ? (
        <Card className="animate-rise overflow-hidden border-0">
          <div className="hero-sheen bg-gray-900 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 px-5 py-5 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-300">
                <Icon name="calendar" size={13} />
                Yaklaşan Randevu
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70">
                Onaylı
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold tracking-tight">{active.time}</span>
              <span className="text-sm text-white/60">
                {new Date(`${active.date}T12:00:00`).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>
          <div className="px-5 py-4">
            {active.muscleGroups?.length > 0 && (
              <>
                <p className="mb-2 text-xs font-semibold text-gray-400">Kas Grupları</p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {active.muscleGroups.map((g) => (
                    <Badge key={g} tone="primary">
                      {labelOf(g)}
                    </Badge>
                  ))}
                </div>
              </>
            )}
            {active.machines?.length > 0 && (
              <>
                <p className="mb-2 text-xs font-semibold text-gray-400">Planlanan Makineler</p>
                <div className="flex flex-wrap gap-1.5">
                  {active.machines.map((m) => (
                    <Badge key={m} tone="gray">
                      {machineById(m)?.name}
                    </Badge>
                  ))}
                </div>
              </>
            )}
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
        <Card soft className="animate-rise p-5 text-center">
          <p className="text-sm text-gray-500">Yaklaşan randevun yok.</p>
          <Button size="sm" className="mt-3" onClick={() => nav("/book")}>
            Randevu Al
          </Button>
        </Card>
      )}

      <div className="animate-rise-late mt-5 grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((a) => (
          <Card key={a.to} onClick={() => nav(a.to)} className="p-4">
            <div
              className={`mb-3 grid h-11 w-11 place-items-center rounded-xl text-white ${a.tone}`}
            >
              <Icon name={a.icon} size={20} />
            </div>
            <p className="text-sm font-bold text-gray-900">{a.title}</p>
            <p className="text-xs text-gray-500">{a.desc}</p>
          </Card>
        ))}
      </div>

      <div className="animate-rise-late mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">İpuçları</h2>
          <Link to="/muscle-groups" className="text-xs font-semibold text-primary-600">
            Tümü
          </Link>
        </div>
        <Card className="flex items-center gap-3 p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600">
            <Icon name="flame" size={19} />
          </div>
          <p className="text-sm text-gray-600">
            Antrenmandan önce 5-10 dk ısınmayı unutma. Kas grubuna özel ısınma listeni
            kas grubu ekranından görebilirsin.
          </p>
        </Card>
      </div>
    </div>
  );
}
