import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import SlotButton from "../../components/SlotButton.jsx";
import Spinner from "../../components/Spinner.jsx";
import { useToast } from "../../components/Toast.jsx";
import { MUSCLE_GROUPS, machinesByMuscle } from "../../mock/machines.js";
import { upcomingDates } from "../../utils/dates.js";
import { getAccessToken } from "../../api/client.js";
import {
  createAppointment,
  fetchSlots,
  mapSlotFromApi,
} from "../../api/bookings.js";

const STEPS = ["Tarih & Saat", "Kas Grubu / Makine", "Özet"];

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
        if (!cancelled) {
          setSlots(data.slots.map(mapSlotFromApi));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast(err.message ?? "Slotlar yüklenemedi", "error");
          setSlots([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dateKey, toast]);

  const suggested = useMemo(
    () => [...new Set(groups.flatMap((g) => machinesByMuscle(g)))],
    [groups]
  );

  const toggle = (arr, set, val) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

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
      <div className="mb-5 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  i <= step ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 ${i < step ? "bg-primary-600" : "bg-gray-200"}`} />
              )}
            </div>
            <span className="mt-1 text-[10px] font-semibold text-gray-500">{s}</span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <h2 className="mb-3 text-lg font-bold text-gray-900">Tarih seç</h2>
          <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
            {dates.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setDateKey(d.key)}
                className={`flex min-w-[56px] flex-col items-center rounded-xl border px-3 py-2 ${
                  dateKey === d.key
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                <span className="text-[11px] font-semibold">{d.day}</span>
                <span className="text-lg font-extrabold">{d.date}</span>
                <span className="text-[10px]">{d.month}</span>
              </button>
            ))}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Saat seç</h2>
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full bg-emerald-500" />Müsait</span>
              <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full bg-amber-500" />Orta</span>
              <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full bg-red-500" />Yoğun</span>
            </div>
          </div>

          {loadingSlots ? (
            <div className="grid place-items-center py-10">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => (
                <SlotButton
                  key={s.id ?? s.time}
                  slot={s}
                  selected={slot?.id === s.id || slot?.time === s.time}
                  onSelect={setSlot}
                />
              ))}
            </div>
          )}

          <Button full size="lg" className="mt-6" disabled={!slot} onClick={() => setStep(1)}>
            Devam
          </Button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900">Kas grubu (opsiyonel)</h2>
          <p className="mb-3 text-sm text-gray-500">
            Çalışmak istediğin kas gruplarını seç ya da bu adımı atla.
          </p>
          <div className="mb-5 flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => toggle(groups, setGroups, g.id)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                  groups.includes(g.id)
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {suggested.length > 0 && (
            <>
              <h3 className="mb-2 text-sm font-bold text-gray-900">Önerilen makineler</h3>
              <div className="mb-5 space-y-2">
                {suggested.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      machines.includes(m.id)
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={machines.includes(m.id)}
                      onChange={() => toggle(machines, setMachines, m.id)}
                      className="h-4 w-4 accent-primary-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.location}</p>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" full onClick={() => setStep(2)}>
              Atla
            </Button>
            <Button full onClick={() => setStep(2)}>
              Devam
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Özet & Onay</h2>
          <Card className="divide-y divide-gray-100">
            <Row label="Tarih">
              {new Date(`${dateKey}T12:00:00`).toLocaleDateString("tr-TR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Row>
            <Row label="Saat">{slot?.time}</Row>
            <Row label="Kas Grupları">
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
            </Row>
            <Row label="Makineler">
              {machines.length ? (
                <div className="flex flex-wrap justify-end gap-1">
                  {machines.map((m) => (
                    <Badge key={m} tone="gray">
                      {suggested.find((x) => x.id === m)?.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400">Belirtilmedi</span>
              )}
            </Row>
          </Card>

          <div className="mt-6 flex gap-2">
            <Button variant="ghost" full onClick={() => setStep(1)}>
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

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-semibold text-gray-900">{children}</span>
    </div>
  );
}
