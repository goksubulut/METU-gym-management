import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Badge from "../../components/Badge.jsx";
import Icon from "../../components/Icon.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import { useToast } from "../../components/Toast.jsx";
import { MUSCLE_GROUPS, machinesByMuscle } from "../../mock/machines.js";
import { upcomingDates } from "../../utils/dates.js";
import { getAccessToken } from "../../api/client.js";
import { createAppointment, fetchSlots, mapSlotFromApi } from "../../api/bookings.js";

const TIME_PERIODS = [
  { id: "morning", label: "Sabah", from: 6 * 60, to: 12 * 60 },
  { id: "afternoon", label: "Öğleden Sonra", from: 12 * 60, to: 17 * 60 },
  { id: "evening", label: "Akşam", from: 17 * 60, to: 24 * 60 },
];

function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isAvailable(s) {
  return !s.isPast && !(s.isFull || s.booked >= s.capacity);
}

export default function Book() {
  const nav = useNavigate();
  const toast = useToast();
  const dates = useMemo(() => upcomingDates(7), []);

  const [dateKey, setDateKey] = useState(null);
  const [slot, setSlot] = useState(null);
  const [groups, setGroups] = useState([]);
  const [machines, setMachines] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!getAccessToken()) {
      toast("Randevu almak için giriş yapmalısın", "error");
      nav("/auth");
    }
  }, [nav, toast]);

  useEffect(() => {
    if (!dateKey) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSlot(null);
    setStep(1);
    fetchSlots(dateKey)
      .then((data) => {
        if (!cancelled) setSlots(data.slots.map(mapSlotFromApi));
      })
      .catch((err) => {
        if (!cancelled) {
          toast(err.message ?? "Slotlar yüklenemedi", "error");
          setSlots([]);
        }
      })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [dateKey, toast]);

  // Sadece rezerve edilebilir slotlar, dönemlere göre gruplandırılmış
  const availablePeriods = useMemo(
    () =>
      TIME_PERIODS.map((p) => ({
        ...p,
        slots: slots.filter(
          (s) => isAvailable(s) && toMin(s.time) >= p.from && toMin(s.time) < p.to,
        ),
      })).filter((p) => p.slots.length > 0),
    [slots],
  );

  const hasAnyAvailable = availablePeriods.length > 0;

  const machinesByGroup = useMemo(
    () =>
      groups
        .map((g) => ({
          id: g,
          label: MUSCLE_GROUPS.find((x) => x.id === g)?.label ?? g,
          list: machinesByMuscle(g),
        }))
        .filter((grp) => grp.list.length > 0),
    [groups],
  );

  const toggleGroup = (id) =>
    setGroups((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  const toggleMachine = (id) =>
    setMachines((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  const goToStep2 = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirm = async () => {
    if (!slot?.id) return;
    setSubmitting(true);
    try {
      await createAppointment({
        slotId: slot.id,
        machineIds: machines.length ? machines : undefined,
        muscleGroupIds: groups.length ? groups : undefined,
      });
      toast("Randevun oluşturuldu", "success");
      nav("/appointments");
    } catch (err) {
      toast(err.message ?? "Randevu oluşturulamadı", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDate = dates.find((d) => d.key === dateKey);

  // ── Step 2: Kas grubu + Onayla ──────────────────────────────────────────
  if (step === 2 && slot) {
    return (
      <div className="px-4 py-5 pb-10">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <Icon name="chevronLeft" size={16} />
          Geri
        </button>

        <div className="mb-6 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
          <Icon name="calendar" size={16} className="shrink-0 text-primary-600" />
          <span className="text-sm font-semibold text-gray-900">
            {selectedDate?.day} {selectedDate?.date} {selectedDate?.month}
          </span>
          <span className="text-gray-300">·</span>
          <span className="tabular-nums text-sm font-bold text-primary-600">{slot.time}</span>
        </div>

        <h1 className="mb-1 font-display text-xl font-bold tracking-tight text-gray-900">
          Kas Grubu Seç
        </h1>
        <p className="mb-5 text-sm text-gray-400">Opsiyonel — istersen boş bırakabilirsin.</p>

        <div className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => toggleGroup(g.id)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors active:scale-[0.96] ${
                groups.includes(g.id)
                  ? "border-primary-600 bg-primary-50 text-primary-800"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {machinesByGroup.length > 0 && (
          <div className="mt-5 space-y-4">
            <p className="text-xs font-bold text-gray-400">Makine ekle</p>
            {machinesByGroup.map(({ id, label, list }) => (
              <div key={id}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  {label}
                </p>
                <div className="space-y-2">
                  {list.map((m) => (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                        machines.includes(m.id)
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-100 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={machines.includes(m.id)}
                        onChange={() => toggleMachine(m.id)}
                        className="h-4 w-4 accent-primary-600"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-400">{m.location}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
            <div>
              <p className="text-xs text-gray-400">Seçilen randevu</p>
              <p className="tabular-nums text-sm font-bold text-gray-900">
                {selectedDate?.day} {selectedDate?.date} {selectedDate?.month},{" "}
                {slot.time}
              </p>
            </div>
            {groups.length > 0 && (
              <div className="flex flex-wrap justify-end gap-1">
                {groups.slice(0, 2).map((g) => (
                  <Badge key={g} tone="primary">
                    {MUSCLE_GROUPS.find((x) => x.id === g)?.label}
                  </Badge>
                ))}
                {groups.length > 2 && (
                  <Badge tone="gray">+{groups.length - 2}</Badge>
                )}
              </div>
            )}
          </div>
          <Button full size="lg" onClick={confirm} disabled={submitting}>
            {submitting ? "Kaydediliyor…" : "Randevuyu Onayla"}
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 1: Tarih + Saat ─────────────────────────────────────────────────
  return (
    <div className="px-4 py-5 pb-10">
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight text-gray-900">
        Randevu Al
      </h1>

      {/* Tarih şeridi */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Tarih</h2>
        <div className="grid grid-cols-4 gap-2">
          {dates.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDateKey(d.key)}
              className={`flex flex-col items-center rounded-2xl border py-3 transition-colors active:scale-[0.95] ${
                dateKey === d.key
                  ? "border-primary-600 bg-primary-600 text-white"
                  : d.isToday
                  ? "border-primary-200 bg-primary-50 text-gray-900"
                  : "border-gray-100 bg-white text-gray-600"
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                dateKey === d.key ? "text-white/70" : "text-gray-400"
              }`}>
                {d.day}
              </span>
              <span className="mt-0.5 text-lg font-extrabold leading-none">{d.date}</span>
              <span className={`mt-0.5 text-[10px] ${dateKey === d.key ? "text-white/60" : "text-gray-400"}`}>
                {d.month}
              </span>
              {d.isToday && dateKey !== d.key && (
                <span className="mt-1 h-1 w-1 rounded-full bg-primary-600" />
              )}
            </button>
          ))}
        </div>
      </section>

      {!dateKey && (
        <p className="mt-10 text-center text-sm text-gray-400">
          Bir tarih seçerek müsait saatleri gör.
        </p>
      )}

      {/* Saat grid — sadece müsait slotlar */}
      {dateKey && (
        <section className="animate-rise mt-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Saat</h2>

          {loadingSlots ? (
            <div className="space-y-5">
              {[4, 3].map((count, gi) => (
                <div key={gi}>
                  <Skeleton className="mb-3 h-3 w-20" />
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: count }).map((_, i) => (
                      <Skeleton key={i} className="h-10 rounded-xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : !hasAnyAvailable ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 py-10 text-center">
              <p className="text-sm font-medium text-gray-400">Bu gün için müsait saat kalmadı.</p>
              <p className="mt-1 text-xs text-gray-300">Başka bir tarih seçmeyi dene.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {availablePeriods.map((period) => (
                <div key={period.id}>
                  <p className="mb-2.5 text-xs font-semibold text-gray-400">{period.label}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {period.slots.map((s) => {
                      const isSelected = slot?.id === s.id || slot?.time === s.time;
                      return (
                        <button
                          key={s.id ?? s.time}
                          type="button"
                          onClick={() => setSlot(isSelected ? null : s)}
                          className={`rounded-xl py-2.5 text-sm font-bold tabular-nums transition-[background-color,border-color,transform,box-shadow] duration-150 active:scale-[0.94] ${
                            isSelected
                              ? "bg-primary-600 text-white shadow-glow"
                              : "border border-gray-200 bg-white text-gray-800 hover:border-primary-300 hover:bg-primary-50"
                          }`}
                        >
                          {s.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {slot && (
        <div className="animate-rise mt-8">
          <div className="mb-3 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5">
            <span className="text-xs text-gray-500">Seçilen saat</span>
            <span className="tabular-nums text-sm font-bold text-gray-900">
              {selectedDate?.day} {selectedDate?.date} {selectedDate?.month} · {slot.time}
            </span>
          </div>
          <Button full size="lg" onClick={goToStep2}>
            Devam Et
            <Icon name="chevronRight" size={18} />
          </Button>
        </div>
      )}
    </div>
  );
}
