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

function SlotRow({ slot, selected, onSelect }) {
  const isPast = slot.isPast;
  const isFull = slot.isFull || slot.booked >= slot.capacity;
  const disabled = isPast || isFull;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(slot)}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] ${
        disabled
          ? "cursor-not-allowed bg-gray-50 text-gray-300"
          : selected
          ? "bg-primary-600 text-white shadow-glow"
          : "border border-gray-100 bg-white text-gray-900 hover:border-primary-200 hover:bg-primary-50"
      }`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
          disabled ? "border-gray-200" : selected ? "border-white" : "border-gray-300"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
      </span>
      <span className="tabular-nums text-sm font-bold">{slot.time}</span>
      {disabled && (
        <span className="ml-auto text-xs font-semibold opacity-60">
          {isPast ? "Geçti" : "Dolu"}
        </span>
      )}
    </button>
  );
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
  const [showGroups, setShowGroups] = useState(false);

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

  const suggestedMachines = useMemo(
    () => [
      ...new Map(
        groups.flatMap((g) => machinesByMuscle(g)).map((m) => [m.id, m]),
      ).values(),
    ],
    [groups],
  );

  const toggleGroup = (id) =>
    setGroups((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  const toggleMachine = (id) =>
    setMachines((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

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

  return (
    <div className="px-4 py-5 pb-10">
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight text-gray-900">
        Randevu Al
      </h1>

      {/* 1 — Tarih */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-gray-900">Tarih</h2>
        <div className="grid grid-cols-7 gap-1">
          {dates.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDateKey(d.key)}
              className={`flex flex-col items-center rounded-xl border px-1 py-2 transition-colors active:scale-[0.95] ${
                dateKey === d.key
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <span className={`text-[10px] font-semibold ${dateKey === d.key ? "text-white/80" : "text-gray-400"}`}>
                {d.day}
              </span>
              <span className="text-base font-extrabold leading-tight">{d.date}</span>
              <span className={`text-[9px] ${dateKey === d.key ? "text-white/70" : "text-gray-400"}`}>
                {d.month}
              </span>
              {d.isToday && (
                <span className={`mt-0.5 h-1 w-1 rounded-full ${dateKey === d.key ? "bg-white/60" : "bg-primary-600"}`} />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Başlangıç ipucu */}
      {!dateKey && (
        <p className="mt-8 text-center text-sm text-gray-400">
          Yukarıdan bir tarih seçerek başla.
        </p>
      )}

      {/* 2 — Saat (tarih seçilince açılır) */}
      {dateKey && (
        <section className="animate-rise mt-8">
          <h2 className="mb-3 text-sm font-bold text-gray-900">
            Saat
            {selectedDate && (
              <span className="ml-2 font-normal text-gray-400">
                — {selectedDate.day} {selectedDate.date} {selectedDate.month}
              </span>
            )}
          </h2>

          {loadingSlots ? (
            <div className="space-y-5">
              {[3, 2].map((count, gi) => (
                <div key={gi}>
                  <Skeleton className="mb-2 h-3 w-28" />
                  <div className="space-y-2">
                    {Array.from({ length: count }).map((_, i) => (
                      <Skeleton key={i} className="h-14 rounded-xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 py-8 text-center">
              <p className="text-sm text-gray-400">Bu tarih için uygun slot yok.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {TIME_PERIODS.map((period) => {
                const periodSlots = slots.filter(
                  (s) => toMin(s.time) >= period.from && toMin(s.time) < period.to,
                );
                if (periodSlots.length === 0) return null;
                return (
                  <div key={period.id}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">{period.label}</span>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                      {periodSlots.map((s) => (
                        <SlotRow
                          key={s.id ?? s.time}
                          slot={s}
                          selected={slot?.id === s.id || slot?.time === s.time}
                          onSelect={setSlot}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 3 — Kas grubu (saat seçilince açılır, opsiyonel) */}
      {slot && (
        <section className="animate-rise mt-8">
          <button
            type="button"
            onClick={() => setShowGroups((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
          >
            <span className="flex items-center gap-2">
              <Icon name="body" size={16} />
              Kas grubu ekle
              {groups.length > 0 ? (
                <Badge tone="primary">{groups.length} seçildi</Badge>
              ) : (
                <span className="text-xs font-normal text-gray-400">opsiyonel</span>
              )}
            </span>
            <Icon
              name="chevronRight"
              size={15}
              className={`text-gray-400 transition-transform duration-200 ${showGroups ? "rotate-90" : ""}`}
            />
          </button>

          {showGroups && (
            <div className="animate-rise mt-3">
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGroup(g.id)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                      groups.includes(g.id)
                        ? "border-primary-600 bg-primary-50 text-primary-800"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {suggestedMachines.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-gray-400">Makine ekle</p>
                  {suggestedMachines.map((m) => (
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
              )}
            </div>
          )}
        </section>
      )}

      {/* 4 — Özet & Onayla */}
      {slot && (
        <div className="animate-rise mt-8">
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
      )}
    </div>
  );
}
