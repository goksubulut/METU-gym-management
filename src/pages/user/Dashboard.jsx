import { useCallback, useEffect, useRef, useState } from "react";
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
  { to: "/programs", icon: "clipboard", title: "Programlarım", desc: "Oluştur & yönet", iconBg: "bg-primary-50", iconFg: "text-accent" },
  { to: "/feedback", icon: "message", title: "Geri Bildirim", desc: "Arıza & öneri", iconBg: "bg-gray-100", iconFg: "text-gray-500" },
];

function WaveAppointmentCard({ active, nav }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let time = 0;
    let rafId;

    const waveData = Array.from({ length: 8 }).map(() => ({
      value: Math.random() * 0.5 + 0.1,
      targetValue: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.02 + 0.01,
    }));

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function updateWaveData() {
      waveData.forEach((data) => {
        if (Math.random() < 0.01) data.targetValue = Math.random() * 0.7 + 0.1;
        data.value += (data.targetValue - data.value) * data.speed;
      });
    }

    function draw() {
      ctx.fillStyle = "#0d0d1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      waveData.forEach((data, i) => {
        const freq = data.value * 7;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const nx = (x / canvas.width) * 2 - 1;
          const px = nx + i * 0.04 + freq * 0.03;
          const py = Math.sin(px * 10 + time) * Math.cos(px * 2) * freq * 0.1 * ((i + 1) / 8);
          const y = (py + 1) * (canvas.height / 2);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const intensity = Math.min(1, freq * 0.3);
        ctx.lineWidth = 1 + i * 0.3;
        ctx.strokeStyle = `rgba(${79 + intensity * 100},${70 + intensity * 130},229,0.6)`;
        ctx.shadowColor = `rgba(${79 + intensity * 100},${70 + intensity * 130},229,0.5)`;
        ctx.shadowBlur = 5;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    }

    function animate() {
      time += 0.02;
      updateWaveData();
      draw();
      rafId = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      {/* Wave canvas — sits behind the glass card */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full rounded-2xl" />

      {/* Glass card with gradient border */}
      <div className="card-border animate-float relative z-10 flex flex-col overflow-hidden rounded-2xl">

        {/* Inner preview area */}
        <div className="p-4">
          <div className="gradient-border inner-glow relative h-40 w-full overflow-hidden rounded-xl">
            {/* Animated grid overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(99,88,229,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,88,229,0.5) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-300">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400" />
                </span>
                Yaklaşan Randevu
              </span>
              <div className="flex items-baseline gap-2">
                <span className="tabular-nums font-mono text-4xl font-bold tracking-tight text-white">
                  {active.time}
                </span>
                <span className="text-sm text-white/50">
                  {new Date(`${active.date}T12:00:00`).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Bottom content */}
        <div className="flex flex-col gap-3 p-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Icon name="dumbbell" size={12} />
              METU Spor Merkezi
            </span>
          </div>

          {active.muscleGroups?.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">
                Kas Grupları
              </p>
              <div className="flex flex-wrap gap-1.5">
                {active.muscleGroups.map((g) => (
                  <Badge key={g} tone="primary">{labelOf(g)}</Badge>
                ))}
              </div>
            </div>
          )}

          {active.machines?.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">
                Planlanan Makineler
              </p>
              <div className="flex flex-wrap gap-1.5">
                {active.machines.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => nav(`/machines/${m}`)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 transition-colors hover:border-indigo-400/40 hover:text-white"
                  >
                    <Icon name="dumbbell" size={12} />
                    {machineById(m)?.name ?? m}
                    <Icon name="chevronRight" size={12} className="text-white/30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => nav("/appointments")}
              className="flex-1 rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2.5 text-sm font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/20 active:scale-[0.97]"
            >
              Yönet →
            </button>
            <button
              type="button"
              onClick={() => nav("/machines")}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 active:scale-[0.97]"
            >
              Makinelere Göz At
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <div className="animate-rise mb-6 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold text-gray-400">Merhaba,</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            {profile.name.split(" ")[0]}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => nav("/scan")}
          className="flex items-center gap-1.5 rounded-xl border border-hairline bg-surface px-3.5 py-2 text-sm font-semibold text-content transition-transform active:scale-95"
        >
          <Icon name="qr" size={15} className="text-accent" />
          QR Tara
        </button>
      </div>

      {loading ? (
        <div className="card-border animate-rise flex flex-col overflow-hidden rounded-2xl">
          <div className="p-4">
            <div className="gradient-border inner-glow relative h-40 w-full overflow-hidden rounded-xl px-4 py-4">
              <Skeleton className="h-2.5 w-28 bg-white/10" />
              <div className="absolute bottom-4 left-4 flex items-baseline gap-2">
                <Skeleton className="h-9 w-20 bg-white/10" />
                <Skeleton className="h-4 w-24 bg-white/10" />
              </div>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-6 w-36 rounded-full bg-white/10" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-full bg-white/10" />
              <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
            </div>
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-10 flex-1 rounded-xl bg-white/10" />
              <Skeleton className="h-10 flex-1 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>
      ) : active ? (
        <div className="animate-rise">
          <WaveAppointmentCard active={active} nav={nav} />
        </div>
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
          <Link to="/exercises" className="text-xs font-semibold text-accent">
            Tümü
          </Link>
        </div>
        <Card className="flex items-center gap-3 p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-accent">
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
