import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Icon from "../../components/Icon.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import { Stagger, StaggerItem } from "../../components/motion/Stagger.jsx";
import { appointments as mockAppointments } from "../../mock/appointments.js";
import { machineById, MUSCLE_GROUPS } from "../../mock/machines.js";
import { getAccessToken } from "../../api/client.js";
import { fetchMyAppointments, mapAppointmentFromApi } from "../../api/bookings.js";
import { fetchMe } from "../../api/auth.js";
import { getAuthUser } from "../../utils/authUser.js";

const labelOf = (id) => MUSCLE_GROUPS.find((m) => m.id === id)?.label || id;

// Hızlı erişim — bento içinde farklı boyutlarda dizilir (tekdüze grid yok).
// size: "feature" büyük/uzun tile · "compact" küçük · "wide" tam genişlik.
const QUICK_ACTIONS = [
  { to: "/exercises", icon: "flame", title: "Egzersizler", desc: "Serbest & ısınma", size: "feature", accent: true },
  { to: "/appointments", icon: "calendar", title: "Randevularım", desc: "Geçmiş & gelecek", size: "compact" },
  { to: "/programs", icon: "clipboard", title: "Programlarım", desc: "Oluştur & yönet", size: "compact" },
  { to: "/feedback", icon: "message", title: "Geri Bildirim", desc: "Arıza & öneri", size: "wide" },
];

// ── Hero: yaklaşan randevu — en büyük cam konteyner, en güçlü hiyerarşi ──
function AppointmentHero({ active, nav }) {
  const d = new Date(`${active.date}T12:00:00`);
  const dayNum = d.toLocaleDateString("tr-TR", { day: "numeric" });
  const monthShort = d.toLocaleDateString("tr-TR", { month: "short" });
  const weekday = d.toLocaleDateString("tr-TR", { weekday: "long" });
  const muscleCount = active.muscleGroups?.length ?? 0;
  const machineCount = active.machines?.length ?? 0;

  // Randevuya kalan gün — referanstaki üçlü istatistiğin bir ayağı.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((new Date(`${active.date}T00:00:00`) - today) / 86400000);
  const stats = [
    diffDays <= 0
      ? { icon: "clock", value: "Bugün", unit: "randevu günü" }
      : { icon: "calendar", value: String(diffDays), unit: "gün kala" },
    { icon: "body", value: muscleCount, unit: "kas grubu" },
    { icon: "dumbbell", value: machineCount, unit: "makine" },
  ];

  return (
    <div className="relative">
      {/* Kart dışına taşan yumuşak kırmızı hale */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-20%] left-1/2 -z-0 h-32 w-[82%] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(var(--glow) / 0.42), transparent 66%)" }}
      />

      {/* Yatay orta-boy kart: koyu üst, alttan yükselen kırmızı glow */}
      <div className="relative z-10 overflow-hidden rounded-[26px] ring-1 ring-white/10">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #151013 0%, #180a0e 40%, #2c0a12 100%)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 105% at 50% 138%, rgb(var(--glow) / 0.95), rgb(var(--primary-600) / 0.66) 22%, rgb(var(--primary-800) / 0.28) 44%, transparent 62%)",
          }}
        />

        <div className="relative z-10 p-4">
          {/* Üst satır: ikon + başlık | tarih */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/15">
                <Icon name="dumbbell" size={20} />
              </span>
              <div className="leading-tight">
                <p className="text-body font-bold text-white">Yaklaşan Randevu</p>
                <p className="text-caption text-white/60">METU Spor Merkezi</p>
              </div>
            </div>
            <div className="text-right leading-tight">
              <p className="text-body font-bold tabular-nums text-white">
                {dayNum} {monthShort}
              </p>
              <p className="text-caption capitalize text-white/55">{weekday}</p>
            </div>
          </div>

          {/* İstatistik satırı — ikon + rakam + birim */}
          <div className="mt-3 flex items-end gap-6">
            {stats.map((s) => (
              <div key={s.unit}>
                <div className="flex items-center gap-1.5">
                  <Icon name={s.icon} size={15} className="text-glow" />
                  <span className="font-display text-2xl font-bold leading-none tabular-nums text-white">
                    {s.value}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-white/55">{s.unit}</p>
              </div>
            ))}
          </div>

          {/* Parlak kırmızı aksan bandı (referanstaki çubuk) */}
          <div className="mt-3 h-2.5 w-[78%] overflow-hidden rounded-full">
            <div
              className="h-full w-full"
              style={{
                background:
                  "repeating-linear-gradient(115deg, rgb(var(--glow)) 0 10px, rgb(var(--primary-600)) 10px 20px)",
                boxShadow: "0 0 16px rgb(var(--glow) / 0.7)",
              }}
            />
          </div>

          {/* Alt satır: büyük saat | çipler + aksiyonlar */}
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <span className="font-display text-[40px] font-bold leading-[0.9] tracking-tight tabular-nums text-white">
                {active.time}
              </span>
              <p className="mt-0.5 text-caption text-white/60">randevu saati</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => nav("/appointments")}
                className="rounded-full bg-white/22 px-4 py-2 text-caption font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/30 active:scale-95"
              >
                Yönet
              </button>
              <button
                type="button"
                onClick={() => nav("/machines")}
                className="rounded-full bg-black/30 px-4 py-2 text-caption font-bold text-white/85 transition-colors hover:bg-black/40 active:scale-95"
              >
                Makineler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bento hızlı erişim tile'ı ──
function ActionTile({ action, nav }) {
  const { size, accent, icon, title, desc } = action;
  const base =
    "glass-card glass-card--interactive relative flex rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50";
  const iconChip = accent
    ? "bg-primary-600 text-white"
    : "bg-white/10 text-white";

  if (size === "feature") {
    return (
      <button
        type="button"
        onClick={() => nav(action.to)}
        className={`${base} row-span-2 min-h-[168px] flex-col justify-between overflow-hidden p-4 text-left`}
      >
        {accent && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle, rgb(var(--glow) / 0.28), transparent 65%)" }}
          />
        )}
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${iconChip}`}>
          <Icon name={icon} size={24} />
        </span>
        <div>
          <p className="text-body font-bold text-content">{title}</p>
          <p className="mt-0.5 text-caption text-muted">{desc}</p>
        </div>
      </button>
    );
  }

  if (size === "wide") {
    return (
      <button
        type="button"
        onClick={() => nav(action.to)}
        className={`${base} col-span-2 items-center gap-3 p-3.5 text-left`}
      >
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconChip}`}>
          <Icon name={icon} size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-body font-bold text-content">{title}</p>
          <p className="text-caption text-muted">{desc}</p>
        </div>
        <Icon name="chevron-right" size={18} className="ml-auto text-faint" />
      </button>
    );
  }

  // compact
  return (
    <button
      type="button"
      onClick={() => nav(action.to)}
      className={`${base} h-[78px] items-center gap-3 p-3.5 text-left`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconChip}`}>
        <Icon name={icon} size={19} />
      </span>
      <div className="min-w-0">
        <p className="text-body font-bold leading-tight text-content">{title}</p>
        <p className="truncate text-caption text-muted">{desc}</p>
      </div>
    </button>
  );
}

function getProfile() {
  return getAuthUser() ?? { name: "Misafir" };
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
  const [profile, setProfile] = useState(getProfile);
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
      const [apiRows, me] = await Promise.all([
        fetchMyAppointments(),
        fetchMe().catch(() => getAuthUser()),
      ]);
      if (me) setProfile(me);
      const mapped = apiRows.map(mapAppointmentFromApi);
      // Giriş yapmış gerçek hesap: yalnızca kendi randevuları (mock fallback yok).
      setActive(pickNextUpcoming(mapped));
    } catch {
      setActive(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, location.pathname]);

  const firstName = profile.name.split(" ")[0];

  return (
    <Stagger className="px-screen pb-8 pt-6">
      {/* 1 — Başlık: geniş negatif boşluk, güçlü hiyerarşi */}
      <StaggerItem>
        <p className="text-caption font-semibold uppercase tracking-[0.18em] text-glow/90">
          {firstName ? `Merhaba, ${firstName}` : "METU Motion"}
        </p>
        <h1 className="mt-2 text-[30px] font-extrabold leading-[1.05] tracking-tight text-content">
          Kampüste Güçlen
        </h1>
        <p className="mt-1.5 text-body text-muted">Bugünün antrenmanı seni bekliyor.</p>
      </StaggerItem>

      {/* HERO: yaklaşan randevu (en büyük konteyner) */}
      <StaggerItem className="mt-6">
        {loading ? (
          <div className="glass-panel rounded-[30px] p-6">
            <Skeleton className="h-2.5 w-32 bg-white/10" />
            <Skeleton className="mt-6 h-12 w-28 bg-white/10" />
            <div className="mt-6 flex gap-3">
              <Skeleton className="h-10 flex-1 bg-white/10" />
              <Skeleton className="h-10 flex-1 bg-white/10" />
              <Skeleton className="h-10 flex-1 bg-white/10" />
            </div>
          </div>
        ) : active ? (
          <AppointmentHero active={active} nav={nav} />
        ) : (
          <Card soft className="p-6 text-center">
            <p className="text-body text-muted">Yaklaşan randevun yok.</p>
            <Button size="sm" className="mt-3" onClick={() => nav("/book")}>
              Randevu Al
            </Button>
          </Card>
        )}
      </StaggerItem>

      {/* 4 — Hızlı erişim: asimetrik bento */}
      <StaggerItem className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-body font-bold text-content">Öne Çıkan Antrenmanlar</h2>
          <Link to="/exercises" className="text-caption font-semibold text-glow">
            Tümünü Gör
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <ActionTile key={a.to} action={a} nav={nav} />
          ))}
        </div>
      </StaggerItem>

      {/* 5 — QR kısayolu + ısınma ipucu (geniş cam kart) */}
      <StaggerItem className="mt-6">
        <div className="glass-card flex items-center gap-3.5 rounded-[22px] p-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-600/15 text-glow">
            <Icon name="flame" size={20} />
          </div>
          <p className="text-caption leading-relaxed text-muted">
            Antrenmandan önce 5-10 dk ısın. Makinenin QR'ını okutarak kullanım
            videosuna anında ulaş.
          </p>
          <button
            type="button"
            onClick={() => nav("/scan")}
            aria-label="QR tara"
            className="glass-tile ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full text-white transition-transform active:scale-95"
          >
            <Icon name="qr" size={18} />
          </button>
        </div>
      </StaggerItem>
    </Stagger>
  );
}
