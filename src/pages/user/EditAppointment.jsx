import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Badge from "../../components/Badge.jsx";
import Modal from "../../components/Modal.jsx";
import SlotButton from "../../components/SlotButton.jsx";
import Spinner from "../../components/Spinner.jsx";
import Icon from "../../components/Icon.jsx";
import { useToast } from "../../components/Toast.jsx";
import { MUSCLE_GROUPS, machinesByMuscle, machineById } from "../../mock/machines.js";
import { bookingDates } from "../../utils/dates.js";
import { getAccessToken } from "../../api/client.js";
import { fetchMachines } from "../../api/catalog.js";
import {
  fetchAppointment,
  fetchSlots,
  mapAppointmentFromApi,
  mapSlotFromApi,
  updateAppointment,
} from "../../api/bookings.js";

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function machineLabel(id, catalog, details) {
  return catalog.find((m) => m.id === id)?.name ?? details?.find((m) => m.id === id)?.name ?? machineById(id)?.name ?? id;
}

export default function EditAppointment() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [original, setOriginal] = useState(null);
  const [reservedSlotId, setReservedSlotId] = useState(null);
  const [catalog, setCatalog] = useState([]);

  const [dateKey, setDateKey] = useState("");
  const [slot, setSlot] = useState(null);
  const [groups, setGroups] = useState([]);
  const [machines, setMachines] = useState([]);
  const [machineDetails, setMachineDetails] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const dates = useMemo(() => bookingDates(14, original?.date), [original?.date]);

  const loadAppointment = useCallback(async () => {
    if (!getAccessToken()) {
      toast("Düzenlemek için giriş yapmalısın", "error");
      nav("/auth");
      return;
    }
    setLoading(true);
    try {
      const raw = await fetchAppointment(id);
      const appt = mapAppointmentFromApi(raw);
      if (appt.status !== "upcoming" && appt.status !== "no-show") {
        toast("Bu randevu düzenlenemez", "error");
        nav(-1);
        return;
      }
      setOriginal(appt);
      setReservedSlotId(appt.slotId);
      setDateKey(appt.date);
      setGroups(appt.muscleGroups);
      setMachines(appt.machines);
      setMachineDetails(appt.machineDetails ?? []);
    } catch (err) {
      toast(err.message ?? "Randevu yüklenemedi", "error");
      nav(-1);
    } finally {
      setLoading(false);
    }
  }, [id, nav, toast]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  useEffect(() => {
    fetchMachines()
      .then(setCatalog)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!dateKey) return;
    let cancelled = false;
    setLoadingSlots(true);
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
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dateKey, toast]);

  useEffect(() => {
    if (!original || dateKey !== original.date || slot) return;
    const current = slots.find((s) => s.id === original.slotId);
    if (current) setSlot(current);
  }, [slots, original, dateKey, slot]);

  const suggested = useMemo(() => {
    const fromGroups = groups.flatMap((g) => machinesByMuscle(g));
    const ids = new Set([...machines, ...fromGroups.map((m) => m.id)]);
    return [...ids].map((mid) => catalog.find((c) => c.id === mid) ?? machineById(mid)).filter(Boolean);
  }, [groups, machines, catalog]);

  const hasChanges =
    original &&
    (slot?.id !== original.slotId ||
      JSON.stringify([...machines].sort()) !== JSON.stringify([...original.machines].sort()) ||
      JSON.stringify([...groups].sort()) !== JSON.stringify([...original.muscleGroups].sort()));

  const canSave =
    Boolean(slot && hasChanges) &&
    (original?.status !== "no-show" || slot.id !== original.slotId);

  const exitWithoutSave = () => {
    setCancelOpen(false);
    nav(-1);
  };

  const requestBack = () => {
    if (hasChanges) setCancelOpen(true);
    else exitWithoutSave();
  };

  const save = async () => {
    if (!slot?.id || !original) return;
    setSubmitting(true);
    try {
      const updated = await updateAppointment(id, {
        slotId: slot.id,
        machineIds: machines,
        muscleGroupIds: groups,
      });
      toast("Randevu güncellendi", "success");
      nav("/profile", { replace: true, state: { appointmentUpdated: mapAppointmentFromApi(updated) } });
    } catch (err) {
      toast(err.message ?? "Güncelleme başarısız", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const removeMachine = (machineId) => {
    setMachines((m) => m.filter((x) => x !== machineId));
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 pb-8">
      <button type="button" onClick={requestBack} className="mb-3 text-sm text-gray-400">
        ← Geri
      </button>
      <h1 className="mb-1 text-xl font-extrabold text-gray-900">Randevuyu Düzenle</h1>
      <p className="mb-5 text-sm text-gray-500">
        {original?.status === "no-show"
          ? "Gelmedi olarak işaretlendi — yeni tarih ve saat seçerek randevunu yenile."
          : "Tarih, saat ve planını güncelle. Yeşil = şu anki seçim."}
      </p>

      <h2 className="mb-3 text-base font-bold text-gray-900">Tarih</h2>
      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        {dates.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => {
              setDateKey(d.key);
              if (d.key !== original?.date) setSlot(null);
            }}
            className={`flex min-w-[56px] flex-col items-center rounded-xl border px-3 py-2 transition-colors ${
              dateKey === d.key
                ? "border-emerald-600 bg-emerald-600 text-white"
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
        <h2 className="text-base font-bold text-gray-900">Saat</h2>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <i className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Seçili
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block h-2 w-2 rounded-full bg-red-500" />
            Dolu / geçmiş
          </span>
        </div>
      </div>

      {loadingSlots ? (
        <div className="grid place-items-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-4 gap-2">
          {slots.map((s) => (
            <SlotButton
              key={s.id ?? s.time}
              slot={s}
              selected={slot?.id === s.id}
              onSelect={setSlot}
              reservedSlotId={dateKey === original?.date ? reservedSlotId : undefined}
              selectedVariant="green"
            />
          ))}
        </div>
      )}

      <h2 className="mb-2 text-base font-bold text-gray-900">Seçili makineler</h2>
      {machines.length === 0 ? (
        <p className="mb-4 text-sm text-gray-400">Henüz makine seçilmedi.</p>
      ) : (
        <div className="mb-4 space-y-2">
          {machines.map((mid) => (
            <div
              key={mid}
              className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {machineLabel(mid, catalog, machineDetails)}
                </p>
                <p className="text-xs text-gray-500">
                  {catalog.find((c) => c.id === mid)?.location ?? machineById(mid)?.location ?? ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeMachine(mid)}
                className="grid h-8 w-8 place-items-center rounded-full text-red-600 hover:bg-red-100"
                aria-label="Makineyi kaldır"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-2 text-base font-bold text-gray-900">Kas grubu (opsiyonel)</h2>
      <p className="mb-3 text-sm text-gray-500">Kas grubu seçerek makine ekleyebilirsin.</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {MUSCLE_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroups((prev) => toggle(prev, g.id))}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
              groups.includes(g.id)
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-gray-200 text-gray-600"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {suggested.length > 0 && (
        <>
          <h3 className="mb-2 text-sm font-bold text-gray-900">Makine ekle</h3>
          <div className="mb-6 space-y-2">
            {suggested.map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  machines.includes(m.id)
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={machines.includes(m.id)}
                  onChange={() => setMachines((prev) => toggle(prev, m.id))}
                  className="h-4 w-4 accent-emerald-600"
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

      {groups.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {groups.map((g) => (
            <Badge key={g} tone="green">
              {MUSCLE_GROUPS.find((x) => x.id === g)?.label}
            </Badge>
          ))}
        </div>
      )}

      <div className="sticky bottom-24 flex gap-2 border-t border-gray-100 bg-[#f7f7f8] pt-4">
        <Button variant="ghost" full onClick={() => setCancelOpen(true)} disabled={submitting}>
          Vazgeç
        </Button>
        <Button full onClick={save} disabled={submitting || !canSave}>
          {submitting ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Değişiklikler kaydedilmedi"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Düzenlemeye dön
            </Button>
            <Button variant="danger" onClick={exitWithoutSave}>
              Evet, çık
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Kaydetmeden çıkmak istiyor musun? Yaptığın değişiklikler silinecek.
        </p>
      </Modal>
    </div>
  );
}
