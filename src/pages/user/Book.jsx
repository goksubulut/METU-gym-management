import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Icon from "../../components/Icon.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import { useToast } from "../../components/Toast.jsx";
import { MUSCLE_GROUPS, machinesByMuscle } from "../../mock/machines.js";
import { upcomingDates } from "../../utils/dates.js";
import { getAccessToken } from "../../api/client.js";
import {
  createAppointment,
  fetchSlots,
  mapSlotFromApi,
} from "../../api/bookings.js";

const STEPS = ["Tarih & Saat", "Kas Grubu", "Özet"];

// Zaman dilimi grupları (dakika cinsinden)
const TIME_PERIODS = [
  { id: "morning", label: "Sabah", from: 6 * 60, to: 12 * 60 },
  { id: "afternoon", label: "Öğleden Sonra", from: 12 * 60, to: 17 * 60 },
  { id: "evening", label: "Akşam", from: 17 * 60, to: 24 * 60 },
];

function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const MUSCLE_ICONS = {
  chest: "body",
  back: "body",
  shoulders: "body",
  arms: "dumbbell",
  legs: "body",
  core: "body",
  glutes: "body",
  cardio: "flame",
};

function SlotChip({ slot, selected, onSelect }) {
  const isPast = slot.isPast;
  const isFull = slot.isFull || slot.booked >= slot.capacity;
  const disabled = isPast || isFull;
  const remaining = slot.capacity - slot.booked;
  const tight = !disabled && remaining <= Math.ceil(slot.capacity * 0.3);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(slot)}
      className={`flex flex-col items-center justify-center rounded-xl py-2.5 text-xs font-bold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.93] ${
        disabled
          ? "cursor-not-allowed bg-gray-100 text-gray-300"
          : selected
          ? "bg-primary-600 text-white shadow-glow"
          : tight
          ? "border border-amber-200 bg-amber-50 text-amber-800"
          : "border border-gray-200 bg-white text-gray-900 hover:border-emerald-300 hover:bg-emerald-50"
      }`}
    >
      <span className="tabular-nums leading-tight">{slot.time}</span>
      {disabled ? (
        <span className="mt-0.5 text-[9px] font-semibold opacity-60">
          {isPast ? "geçti" : "dolu"}
        </span>
      ) : (
        <span className={`mt-0.5 text-[9px] font-semibold ${selected ? "text-white/70" : tight ? "text-amber-500" : "text-emerald-500"}`}>
          {remaining} yer
        </span>
      )}
    </button>
  );
}

function MachineRow({ machine, checked, onToggle }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
      checked ? "border-primary-600 bg-primary-50" : "border-gray-200 bg-white"
    }`}>
      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-gray-900 text-white">
        {machine.photoUrl ? (
          <img src={machine.photoUrl} alt={machine.name} className="h-full w-full object-cover" />
        ) : (
          <Icon name="dumbbell" size={16} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{machine.name}</p>
        <p className="text-xs text-gray-400">{machine.location}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 accent-primary-600"
      />
    </label>
  );
}

export default function Book() {
  const nav = useNavigate();
  const toast = useToast();
  const dates = useMemo(() => upcomingDates(7), []);
  const [step, setStep] = useState(0);
  const [dateKey, setDateKey] = useState(dates[0].key);
  const [slot, setSlot] = useState(null);
  const [groups, setGroups] = useState([]);
  const [machines, setMachines] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      toast("Randevu almak için giriş yapmalısın", "error");
      nav("/auth");
    }
  }, [nav, toast]);

  useEffect(() => {
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

  const suggestedByGroup = useMemo(
    () =>
      groups
        .map((gid) => ({
          id: gid,
          label: MUSCLE_GROUPS.find((g) => g.id === gid)?.label ?? gid,
          list: machinesByMuscle(gid),
        }))
        .filter((g) => g.list.length > 0),
    [groups]
  );

  const allSuggested = useMemo(
    () => [...new Map(suggestedByGroup.flatMap((g) => g.list).map((m) => [m.id, m])).values()],
    [suggestedByGroup]
  );

  const toggleGroup = (id) =>
    setGroups((g) => g.includes(id) ? g.filter((x) => x !== id) : [...g, id]);

  const toggleMachine = (id) =>
    setMachines((m) => m.includes(id) ? m.filter((x) => x !== id) : [...m, id]);

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

  return (
    <div className="px-4 py-5">
      {/* Adım göstergesi */}
      <div className="mb-6 flex items-center gap-1">
        {STEPS.map((s, idx) => (
          <div key={s} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                idx < step
                  ? "bg-primary-600 text-white"
                  : idx === step
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}>
                {idx < step ? <Icon name="check" size={12} /> : idx + 1}
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-px flex-1 ${idx < step ? "bg-primary-600" : "bg-gray-200"}`} />
              )}
            </div>
            <span className="mt-1 text-[10px] font-medium text-gray-400">{s}</span>
          </div>
        ))}
      </div>

      {/* ─── Adım 0: Tarih & Saat ─── */}
      {step === 0 && (
        <div>
          {/* Tarih seçimi */}
          <h2 className="mb-3 text-base font-bold text-gray-900">Tarih</h2>
          <div className="mb-5 grid grid-cols-7 gap-1.5">
            {dates.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setDateKey(d.key)}
                className={`flex flex-col items-center rounded-xl border px-1 py-2 transition-colors ${
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

          {/* Saat seçimi */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Saat</h2>
            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <i className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />Müsait
              </span>
              <span className="flex items-center gap-1">
                <i className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />Yoğun
              </span>
            </div>
          </div>

          {loadingSlots ? (
            <div className="space-y-4">
              {[4, 3].map((count, gi) => (
                <div key={gi}>
                  <Skeleton className="mb-2.5 h-3 w-24" />
                  <div className="grid grid-cols-4 gap-2">
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
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">{period.label}</span>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {periodSlots.map((s) => (
                        <SlotChip
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

          <Button full size="lg" className="mt-6" disabled={!slot} onClick={() => setStep(1)}>
            Devam
          </Button>
        </div>
      )}

      {/* ─── Adım 1: Kas Grubu & Makine ─── */}
      {step === 1 && (
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900">Çalışacağın kas grubunu seç</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              İstersen bu adımı geçebilirsin — seçim opsiyoneldir.
            </p>
          </div>

          {/* Kas grubu grid */}
          <div className="mb-6 grid grid-cols-4 gap-2">
            {MUSCLE_GROUPS.map((g) => {
              const on = groups.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGroup(g.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-colors ${
                    on
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Icon name={MUSCLE_ICONS[g.id] ?? "dumbbell"} size={18} strokeWidth={on ? 2.2 : 1.8} />
                  <span className="text-[11px] font-semibold leading-tight text-center px-1">
                    {g.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Önerilen makineler — kas grubuna göre ayrı bölümler */}
          {suggestedByGroup.length > 0 && (
            <div className="space-y-5">
              {suggestedByGroup.map(({ id, label, list }) => (
                <div key={id}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">{label} için önerilen</span>
                    <div className="h-px flex-1 bg-gray-100" />
                  </div>
                  <div className="space-y-2">
                    {list.map((m) => (
                      <MachineRow
                        key={m.id}
                        machine={m}
                        checked={machines.includes(m.id)}
                        onToggle={() => toggleMachine(m.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <Button variant="outline" full onClick={() => setStep(2)}>
              Atla
            </Button>
            <Button full onClick={() => setStep(2)}>
              Devam
            </Button>
          </div>
        </div>
      )}

      {/* ─── Adım 2: Özet ─── */}
      {step === 2 && (
        <div>
          <h2 className="mb-4 text-base font-bold text-gray-900">Özet & Onay</h2>
          <Card className="divide-y divide-gray-100">
            <SummaryRow label="Tarih">
              {new Date(`${dateKey}T12:00:00`).toLocaleDateString("tr-TR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </SummaryRow>
            <SummaryRow label="Saat">{slot?.time}</SummaryRow>
            <SummaryRow label="Kas Grupları">
              {groups.length ? (
                <div className="flex flex-wrap justify-end gap-1">
                  {groups.map((g) => (
                    <Badge key={g} tone="primary">
                      {MUSCLE_GROUPS.find((x) => x.id === g)?.label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400">Belirtilmedi</span>
              )}
            </SummaryRow>
            <SummaryRow label="Makineler">
              {machines.length ? (
                <div className="flex flex-wrap justify-end gap-1">
                  {machines.map((m) => (
                    <Badge key={m} tone="gray">
                      {allSuggested.find((x) => x.id === m)?.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400">Belirtilmedi</span>
              )}
            </SummaryRow>
          </Card>

          <div className="mt-6 flex gap-2">
            <Button variant="outline" full onClick={() => setStep(1)}>
              Geri
            </Button>
            <Button full onClick={confirm} disabled={submitting}>
              {submitting ? "Kaydediliyor…" : "Randevuyu Onayla"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5">
      <span className="shrink-0 text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-semibold text-gray-900">{children}</span>
    </div>
  );
}
