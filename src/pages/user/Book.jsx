import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Calendar, CheckCircle, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../../components/Button.jsx";
import Badge from "../../components/Badge.jsx";
import Icon from "../../components/Icon.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import Spinner from "../../components/Spinner.jsx";
import { useToast } from "../../components/Toast.jsx";
import MachineSelectCard from "../../components/ui/machine-select-card.jsx";
import Bucket from "../../components/ui/bucket.jsx";
import { MUSCLES } from "../../components/BodyDiagram.jsx";
import { MUSCLE_GROUPS, machinesByMuscle, machineById } from "../../mock/machines.js";
import { upcomingDates } from "../../utils/dates.js";
import { getAccessToken } from "../../api/client.js";
import { createAppointment, fetchSlots, mapSlotFromApi } from "../../api/bookings.js";
import { fetchMachines } from "../../api/catalog.js";
import { sortByTargetMatch, slugsForGroup } from "../../utils/targetMatch.js";

const TIME_PERIODS = [
  { id: "morning", label: "Sabah", from: 6 * 60, to: 12 * 60 },
  { id: "afternoon", label: "Öğleden Sonra", from: 12 * 60, to: 17 * 60 },
  { id: "evening", label: "Akşam", from: 17 * 60, to: 24 * 60 },
];

// Fine-grained sections (same structure as MuscleGroups.jsx)
const SECTIONS = [
  { group: "chest", title: "Göğüs" },
  { group: "back", title: "Sırt" },
  { group: "shoulders", title: "Omuz" },
  { group: "arms", title: "Kol" },
  { group: "core", title: "Karın" },
  { group: "glutes", title: "Kalça" },
  { group: "legs", title: "Bacak" },
];

const MUSCLE_ENTRIES = Object.entries(MUSCLES);

function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isAvailable(s) {
  return !s.isPast && !(s.isFull || s.booked >= s.capacity);
}

function occupancyPct(s) {
  if (!s.capacity || s.booked == null) return null;
  return Math.min(100, Math.round((s.booked / s.capacity) * 100));
}

function occupancyStyle(pct) {
  if (pct <= 50) return { bar: "bg-available", text: "text-available dark:text-available" };
  if (pct <= 80) return { bar: "bg-busy", text: "text-busy dark:text-busy" };
  return { bar: "bg-primary-600", text: "text-accent" };
}

// ── Step indicator (steps 2–4) ────────────────────────────────────────────────
function StepIndicator({ step }) {
  const labels = ["Kaslar", "Makine", "Onayla"];
  const active = step - 2;

  return (
    <div className="mb-6 flex items-center">
      {labels.map((label, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <div
              className={[
                "h-px flex-1 transition-colors duration-300",
                i <= active ? "bg-primary-600" : "bg-surface-3",
              ].join(" ")}
            />
          )}
          <div className="flex flex-col items-center gap-1">
            <div
              className={[
                "h-2.5 w-2.5 rounded-full transition-all duration-200",
                i < active
                  ? "bg-primary-600"
                  : i === active
                  ? "bg-primary-600 ring-[3px] ring-primary-600/25"
                  : "bg-surface-3",
              ].join(" ")}
            />
            <span
              className={[
                "text-[10px] font-bold",
                i === active ? "text-accent" : "text-faint",
              ].join(" ")}
            >
              {label}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

// ── Date + slot summary banner ────────────────────────────────────────────────
function DateSlotBanner({ selectedDate, slot }) {
  return (
    <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-surface-2 px-4 py-3">
      <Icon name="calendar" size={15} className="shrink-0 text-accent" />
      <span className="text-sm font-semibold text-content">
        {selectedDate?.day} {selectedDate?.date} {selectedDate?.month}
      </span>
      <span className="text-muted">·</span>
      <span className="tabular-nums text-sm font-bold text-accent">{slot.time}</span>
    </div>
  );
}

function SelectionCount({ count, label }) {
  if (!count) return null;
  return (
    <p className="mb-5 text-sm font-semibold text-accent">
      {count} {label}
    </p>
  );
}

export default function Book() {
  const nav = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const dates = useMemo(() => upcomingDates(7), []);

  // Capture pre-loaded IDs from "Bu program ile randevu al" navigation
  const preloadedMachineIds = useRef(location.state?.machineIds ?? []).current;
  const musclesDerivedRef = useRef(false);

  const [step, setStep] = useState(1);
  const [dateKey, setDateKey] = useState(null);
  const [slot, setSlot] = useState(null);

  // Fine-grained muscle slugs (e.g. "biceps", "quadriceps")
  const [muscleSlugs, setMuscleSlugs] = useState([]);

  const [machines, setMachines] = useState(() => location.state?.machineIds ?? []);
  const [orderedMachines, setOrderedMachines] = useState([]);
  const [apiMachines, setApiMachines] = useState(null);

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 4 bucket → step 5 transition
  const [submitting, setSubmitting] = useState(false);
  const [bucketDone, setBucketDone] = useState(false);
  const [appointmentResult, setAppointmentResult] = useState(null);
  const [appointmentError, setAppointmentError] = useState(null);

  // Broad groups derived from selected fine-grained slugs
  const broadGroups = useMemo(
    () => [...new Set(muscleSlugs.map((s) => MUSCLES[s]?.group).filter(Boolean))],
    [muscleSlugs],
  );

  useEffect(() => {
    if (!getAccessToken()) {
      toast("Randevu almak için giriş yapmalısın", "error");
      nav("/auth");
    }
  }, [nav, toast]);

  useEffect(() => {
    fetchMachines().then(setApiMachines).catch(() => {});
  }, []);

  // Derive muscleSlugs from pre-selected machines once API data loads
  useEffect(() => {
    if (!apiMachines || !preloadedMachineIds.length || musclesDerivedRef.current) return;
    musclesDerivedRef.current = true;
    const machineObjects = preloadedMachineIds
      .map((id) => apiMachines.find((m) => m.id === id))
      .filter(Boolean);
    const broadGroupIds = [...new Set(machineObjects.flatMap((m) => m.muscles ?? []))];
    const slugs = Object.entries(MUSCLES)
      .filter(([, info]) => broadGroupIds.includes(info.group))
      .map(([slug]) => slug);
    if (slugs.length > 0) setMuscleSlugs(slugs);
  }, [apiMachines]);

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
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [dateKey]);

  // When bucket finishes + API resolves → go to step 5
  useEffect(() => {
    if (step !== 4 || !bucketDone) return;
    if (appointmentError) {
      toast(appointmentError, "error");
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (appointmentResult !== null) {
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step, bucketDone, appointmentResult, appointmentError, toast]);

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

  const machinesByGroup = useMemo(() => {
    if (broadGroups.length === 0) return [];
    const byGroup = (g) =>
      apiMachines
        ? apiMachines.filter((m) => m.muscles.includes(g))
        : machinesByMuscle(g);
    return broadGroups
      .map((g) => ({
        id: g,
        label: SECTIONS.find((s) => s.group === g)?.title
          ?? MUSCLE_GROUPS.find((x) => x.id === g)?.label
          ?? g,
        list: sortByTargetMatch(byGroup(g), slugsForGroup(muscleSlugs, g, MUSCLES)),
      }))
      .filter((grp) => grp.list.length > 0);
  }, [broadGroups, apiMachines, muscleSlugs]);

  const toggleMuscleSlug = (slug) => {
    setMuscleSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
    setMachines([]); // reset machine selection on muscle change
  };

  const toggleMachine = (id) =>
    setMachines((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  const goToStep = (n) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Enter step 4: convert IDs → objects, fire API call
  const startBucketStep = () => {
    const find = (id) => (apiMachines?.find((m) => m.id === id)) || machineById(id);
    const ordered = machines.map(find).filter(Boolean);
    setOrderedMachines(ordered);
    setBucketDone(false);
    setAppointmentResult(null);
    setAppointmentError(null);
    setSubmitting(true);

    createAppointment({
      slotId: slot.id,
      machineIds: machines.length ? machines : undefined,
      muscleGroupIds: broadGroups.length ? broadGroups : undefined,
      targetMuscles: muscleSlugs.length ? muscleSlugs : undefined,
    })
      .then((res) => setAppointmentResult(res ?? "__ok__"))
      .catch((err) => setAppointmentError(err.message ?? "Randevu oluşturulamadı"))
      .finally(() => setSubmitting(false));

    goToStep(4);
  };

  const selectedDate = dates.find((d) => d.key === dateKey);
  const machineNames = orderedMachines.map((m) => m.name);

  // ── STEP 5: Summary ────────────────────────────────────────────────────────
  if (step === 5) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-4 py-5 pb-10"
      >
        {/* Success header */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
            className="grid h-20 w-20 place-items-center rounded-full bg-primary-600/15"
          >
            <CheckCircle size={38} className="text-primary-600" strokeWidth={1.6} />
          </motion.div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-content">
              Randevun Oluşturuldu!
            </h1>
            <p className="mt-1 text-sm text-muted">Antrenmanın seni bekliyor.</p>
          </div>
        </div>

        {/* Date / time card */}
        <div className="mb-4 rounded-2xl border border-hairline bg-surface p-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-600/10">
              <Calendar size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-content">
                {selectedDate?.day}, {selectedDate?.date} {selectedDate?.month}
              </p>
              <p className="text-xs text-muted">Saat {slot?.time}</p>
            </div>
          </div>
        </div>

        {/* Machine list */}
        {orderedMachines.length > 0 && (
          <div className="mb-4 rounded-2xl border border-hairline bg-surface p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
              Antrenman Planı
            </p>
            <div className="space-y-2.5">
              {orderedMachines.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 font-mono text-[11px] font-bold text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-content">{m.name}</p>
                    {m.location && (
                      <p className="flex items-center gap-1 text-[11px] text-muted">
                        <MapPin size={10} />
                        {m.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Muscle badges */}
        {muscleSlugs.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {muscleSlugs.map((slug) => (
              <Badge key={slug} tone="primary">
                {MUSCLES[slug]?.label ?? slug}
              </Badge>
            ))}
          </div>
        )}

        <Button full size="lg" onClick={() => nav("/appointments")}>
          Randevularıma Git
          <ArrowRight size={18} />
        </Button>

        <button
          type="button"
          onClick={() => nav("/")}
          className="mt-3 w-full py-2 text-center text-sm font-medium text-muted"
        >
          Ana sayfaya dön
        </button>
      </motion.div>
    );
  }

  // ── STEP 4: Bucket animation ───────────────────────────────────────────────
  if (step === 4 && slot) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-10">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-faint">
          Antrenman Programı
        </p>
        <h1 className="mb-8 text-center font-display text-xl font-bold tracking-tight text-content">
          {bucketDone && submitting
            ? "Randevu kaydediliyor..."
            : "Oluşturuluyor..."}
        </h1>

        <Bucket items={machineNames} onComplete={() => setBucketDone(true)} />

        {/* Waiting for API after bucket finishes */}
        {bucketDone && submitting && (
          <div className="mt-8">
            <Spinner />
          </div>
        )}

        {/* Error fallback (shown momentarily before redirect to step 3) */}
        {appointmentError && (
          <p className="mt-6 text-center text-sm font-medium text-accent">
            {appointmentError}
          </p>
        )}
      </div>
    );
  }

  // ── STEP 3: Machine selection ───────────────────────────────────────────────
  if (step === 3 && slot) {
    return (
      <div className="px-4 py-5 pb-10">
        <button
          type="button"
          onClick={() => goToStep(2)}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted"
        >
          <Icon name="chevronLeft" size={16} />
          Geri
        </button>

        <StepIndicator step={3} />

        <h1 className="mb-1 font-display text-xl font-bold tracking-tight text-content">
          Makinelerini Seç
        </h1>
        <p className="mb-5 text-sm text-muted">
          Opsiyonel — istersen boş bırakabilirsin.
        </p>

        <SelectionCount count={machines.length} label="makine seçildi" />

        {machinesByGroup.length === 0 ? (
          <div className="rounded-2xl border border-hairline bg-surface px-5 py-10 text-center">
            <Icon name="dumbbell" size={32} className="mx-auto mb-3 text-faint" />
            <p className="text-sm font-semibold text-content">
              Makine listesi için kas seç
            </p>
            <p className="mt-1 text-xs text-muted">
              Geri dönüp en az bir kas seçebilir veya direkt devam edebilirsin.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {machinesByGroup.map(({ id, label, list }) => (
              <div key={id}>
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="text-xs font-bold text-muted">{label} için</span>
                  <div className="h-px flex-1 bg-surface-3" />
                  <Badge tone="primary">{list.length}</Badge>
                </div>
                <div className="space-y-2">
                  {list.map((m) => (
                    <MachineSelectCard
                      key={m.id}
                      machine={m}
                      selected={machines.includes(m.id)}
                      onToggle={toggleMachine}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Button full size="lg" onClick={startBucketStep}>
            Devam Et
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP 2: Fine-grained muscle selection ──────────────────────────────────
  if (step === 2 && slot) {
    return (
      <div className="px-4 py-5 pb-10">
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted"
        >
          <Icon name="chevronLeft" size={16} />
          Geri
        </button>

        <StepIndicator step={2} />

        <DateSlotBanner selectedDate={selectedDate} slot={slot} />

        <h1 className="mb-1 font-display text-xl font-bold tracking-tight text-content">
          Kas Seç
        </h1>
        <p className="mb-5 text-sm text-muted">
          Antrenmanında çalışmak istediğin kasları seç. Opsiyonel.
        </p>

        <SelectionCount count={muscleSlugs.length} label="kas seçildi" />

        <div className="space-y-5">
          {SECTIONS.map(({ group, title }) => {
            const sectionMuscles = MUSCLE_ENTRIES.filter(
              ([, info]) => info.group === group,
            );
            return (
              <div key={group}>
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted">
                    {title}
                  </span>
                  <div className="h-px flex-1 bg-surface-3" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {sectionMuscles.map(([slug, info]) => {
                    const selected = muscleSlugs.includes(slug);
                    return (
                      <motion.button
                        key={slug}
                        type="button"
                        whileTap={{ scale: 0.91 }}
                        onClick={() => toggleMuscleSlug(slug)}
                        className={[
                          "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors duration-200",
                          selected
                            ? "border-primary-600 bg-primary-600/15 text-accent"
                            : "border-hairline bg-surface text-muted",
                        ].join(" ")}
                      >
                        {info.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <Button full size="lg" onClick={() => goToStep(3)}>
            Devam Et
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP 1: Date + Time ─────────────────────────────────────────────────────
  return (
    <div className="px-4 py-5 pb-10">
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight text-content">
        Randevu Al
      </h1>

      {/* Date strip */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Tarih</h2>
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
                  ? "border-primary-200 bg-primary-600/10 text-content"
                  : "border-hairline bg-surface text-muted"
              }`}
            >
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  dateKey === d.key ? "text-white/70" : "text-faint"
                }`}
              >
                {d.day}
              </span>
              <span className="mt-0.5 text-lg font-extrabold leading-none">{d.date}</span>
              <span
                className={`mt-0.5 text-[10px] ${
                  dateKey === d.key ? "text-white/60" : "text-faint"
                }`}
              >
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
        <p className="mt-10 text-center text-sm text-muted">
          Bir tarih seçerek müsait saatleri gör.
        </p>
      )}

      {/* Time grid */}
      {dateKey && (
        <section className="animate-rise mt-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted">Saat</h2>

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
            <div className="rounded-2xl border border-hairline bg-surface py-10 text-center">
              <p className="text-sm font-medium text-muted">
                Bu gün için müsait saat kalmadı.
              </p>
              <p className="mt-1 text-xs text-faint">Başka bir tarih seçmeyi dene.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {availablePeriods.map((period) => (
                <div key={period.id}>
                  <p className="mb-2.5 text-xs font-semibold text-muted">{period.label}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {period.slots.map((s) => {
                      const isSelected = slot?.id === s.id || slot?.time === s.time;
                      const pct = occupancyPct(s);
                      const oStyle = pct != null ? occupancyStyle(pct) : null;
                      return (
                        <button
                          key={s.id ?? s.time}
                          type="button"
                          onClick={() => setSlot(isSelected ? null : s)}
                          className={`flex flex-col overflow-hidden rounded-xl text-sm font-bold tabular-nums transition-[background-color,border-color,transform,box-shadow] duration-150 active:scale-[0.94] ${
                            isSelected
                              ? "bg-primary-600 text-white shadow-cta"
                              : "border border-hairline bg-surface text-content"
                          }`}
                        >
                          <span className="py-2.5 text-center leading-none">{s.time}</span>
                          {pct != null && (
                            <>
                              <span className={`pb-1.5 text-center text-[10px] font-semibold leading-none ${isSelected ? "text-white/70" : oStyle.text}`}>
                                %{pct}
                              </span>
                              <div className={`h-1 w-full ${isSelected ? "bg-white/20" : "bg-surface-3"}`}>
                                <div
                                  className={`h-full transition-[width] duration-500 ${isSelected ? "bg-white/60" : oStyle.bar}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </>
                          )}
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
          <div className="mb-3 flex items-center justify-between rounded-xl bg-surface-2 px-4 py-2.5">
            <span className="text-xs text-muted">Seçilen saat</span>
            <span className="tabular-nums text-sm font-bold text-content">
              {selectedDate?.day} {selectedDate?.date} {selectedDate?.month} · {slot.time}
            </span>
          </div>
          <Button full size="lg" onClick={() => goToStep(2)}>
            Devam Et
            <ArrowRight size={18} />
          </Button>
        </div>
      )}
    </div>
  );
}
