import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Icon from "../../components/Icon.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import { appointments as mockAppointments } from "../../mock/appointments.js";
import { machineById, MUSCLE_GROUPS } from "../../mock/machines.js";
import { getAccessToken } from "../../api/client.js";
import { fetchMyAppointments, mapAppointmentFromApi } from "../../api/bookings.js";

const labelOf = (id) => MUSCLE_GROUPS.find((m) => m.id === id)?.label || id;

// Navbar'da zaten olan (Makineler, Kas Grubu, Randevu) burada gösterilmez.
const QUICK_ACTIONS = [
  { to: "/appointments", icon: "calendar", title: "Randevularım", desc: "Geçmiş & gelecek", iconBg: "bg-ink-900", iconFg: "text-white" },
  { to: "/exercises", icon: "flame", title: "Egzersizler", desc: "Serbest & ısınma", iconBg: "bg-primary-600", iconFg: "text-white" },
  { to: "/notifications", icon: "bell", title: "Bildirimler", desc: "Duyuru & hatırlatma", iconBg: "bg-primary-50", iconFg: "text-primary-700" },
  { to: "/feedback", icon: "message", title: "Geri Bildirim", desc: "Arıza & öneri", iconBg: "bg-gray-100", iconFg: "text-gray-500" },
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
      <div className="animate-rise mb-6">
        <p className="text-[11px] font-semibold text-gray-400">Merhaba,</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900 leading-tight">
          {profile.name.split(" ")[0]}
        </h1>
      </div>

      {loading ? (
        <Card className="animate-rise overflow-hidden border-0">
          <div className="bg-gray-900 px-5 py-5">
            <Skeleton className="h-2.5 w-24 bg-white/10" />
            <div className="mt-4 flex items-baseline gap-2">
              <Skeleton className="h-9 w-20 bg-white/10" />
              <Skeleton className="h-4 w-28 bg-white/10" />
            </div>
          </div>
          <div className="px-5 py-4">
            <Skeleton className="mb-2 h-2.5 w-20" />
            <div className="mb-3 flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-18 rounded-full" />
            </div>
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-xl" />
              <Skeleton className="h-9 flex-1 rounded-xl" />
            </div>
          </div>
        </Card>
      ) : active ? (
        <Card className="animate-rise overflow-hidden border-0">
          <div className="hero-sheen bg-gray-900 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 px-5 py-5 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-300">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
                </span>
                Yaklaşan Randevu
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="tabular-nums font-display text-4xl font-bold tracking-tight">{active.time}</span>
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
                    <button
                      key={m}
                      type="button"
                      onClick={() => nav(`/machines/${m}`)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                    >
                      <Icon name="dumbbell" size={12} />
                      {machineById(m)?.name ?? m}
                      <Icon name="chevronRight" size={12} className="text-gray-300" />
                    </button>
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

      <div className="mt-5 grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((a, i) => (
          <Card key={a.to} onClick={() => nav(a.to)} className={`animate-rise stagger-${i + 1} p-4`}>
            <div
              className={`mb-3 grid h-11 w-11 place-items-center rounded-xl ${a.iconBg} ${a.iconFg}`}
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
          <Link to="/exercises" className="text-xs font-semibold text-primary-600">
            Tümü
          </Link>
        </div>
        <Card className="flex items-center gap-3 p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600">
            <Icon name="flame" size={19} />
          </div>
          <p className="text-sm text-gray-600">
            Antrenmandan önce 5-10 dk ısınmayı unutma. Kas grubuna özel ısınma listeni
            egzersizler ekranından görebilirsin.
          </p>
        </Card>
      </div>
    </div>
  );
}
