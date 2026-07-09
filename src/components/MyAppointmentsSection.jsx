import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "./Button.jsx";
import Card from "./Card.jsx";
import Badge from "./Badge.jsx";
import Tabs from "./Tabs.jsx";
import Modal from "./Modal.jsx";
import EmptyState from "./EmptyState.jsx";
import Spinner from "./Spinner.jsx";
import Icon from "./Icon.jsx";
import { useToast } from "./Toast.jsx";
import { appointments as mockSeed } from "../mock/appointments.js";
import { machineById, MUSCLE_GROUPS } from "../mock/machines.js";
import { getAccessToken } from "../api/client.js";
import {
  cancelAppointment,
  fetchMyAppointments,
  mapAppointmentFromApi,
} from "../api/bookings.js";

const labelOf = (id) => MUSCLE_GROUPS.find((m) => m.id === id)?.label || id;
const STATUS = {
  upcoming: { tone: "green", label: "Yaklaşan" },
  "no-show": { tone: "red", label: "Gelmedi" },
  completed: { tone: "gray", label: "Tamamlandı" },
  cancelled: { tone: "red", label: "İptal" },
};

const isAppointmentPast = (a) => new Date(`${a.date}T${a.time}:00`) < new Date();

/** Yaklaşan sekme: gelecek BOOKED + henüz slotu gelmemiş NO_SHOW. Geçmiş no-show → Geçmiş. */
const isUpcomingTab = (a) =>
  a.status === "upcoming" || (a.status === "no-show" && !isAppointmentPast(a));

const isEditable = (status) => status === "upcoming" || status === "no-show";

export default function MyAppointmentsSection({ className = "" }) {
  const nav = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [tab, setTab] = useState("upcoming");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      setList(mockSeed);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const apiRows = await fetchMyAppointments();
      const mapped = apiRows.map(mapAppointmentFromApi);
      setList(mapped.length ? mapped : mockSeed);
    } catch {
      setList(mockSeed);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, location.key]);

  const filtered = list.filter((a) =>
    tab === "upcoming" ? isUpcomingTab(a) : !isUpcomingTab(a),
  );

  const doCancel = async () => {
    const target = list.find((a) => a.id === cancelId);
    if (target?.fromApi) {
      try {
        await cancelAppointment(cancelId);
      } catch (err) {
        toast(err.message ?? "İptal başarısız", "error");
        setCancelId(null);
        return;
      }
    }
    setList((l) => l.map((a) => (a.id === cancelId ? { ...a, status: "cancelled" } : a)));
    setCancelId(null);
    toast("Randevu iptal edildi", "error");
  };

  return (
    <div className={className}>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          ["Toplam", list.length],
          ["Yaklaşan", list.filter(isUpcomingTab).length],
          ["Tamamlanan", list.filter((a) => a.status === "completed").length],
        ].map(([l, v]) => (
          <Card key={l} soft className="p-3 text-center">
            <p className="text-xl font-extrabold text-primary-600">{v}</p>
            <p className="text-[11px] text-gray-500">{l}</p>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-base font-bold text-gray-900">Randevularım</h2>
      <Tabs
        tabs={[
          { value: "upcoming", label: "Yaklaşan" },
          { value: "past", label: "Geçmiş" },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-4"
      />

      {loading ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="calendar"
          title={tab === "upcoming" ? "Yaklaşan randevun yok" : "Geçmiş kaydı yok"}
          action={
            tab === "upcoming" && (
              <Button size="sm" onClick={() => nav("/book")}>
                Randevu Al
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-gray-900">{a.time}</span>
                  <span className="text-sm text-gray-400">
                    {new Date(`${a.date}T12:00:00`).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
                <Badge tone={STATUS[a.status].tone}>{STATUS[a.status].label}</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {a.muscleGroups.map((g) => (
                  <Badge key={g} tone="primary">
                    {labelOf(g)}
                  </Badge>
                ))}
              </div>

              {a.machines?.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    Seçili makineler
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {a.machines.map((m) => {
                      const machine = machineById(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => nav(`/machines/${m}`)}
                          className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-left transition-colors hover:border-primary-200 hover:bg-primary-50"
                        >
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gray-900 text-white">
                            <Icon name="dumbbell" size={15} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-gray-900">
                              {machine?.name ?? m}
                            </span>
                            {machine?.location && (
                              <span className="block truncate text-[11px] text-gray-400">
                                {machine.location}
                              </span>
                            )}
                          </span>
                          <Icon name="chevronRight" size={14} className="shrink-0 text-gray-300" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {isEditable(a.status) && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    full
                    onClick={() => {
                      if (!a.fromApi) {
                        toast("Demo randevu düzenlenemez", "error");
                        return;
                      }
                      nav(`/appointments/${a.id}/edit`);
                    }}
                  >
                    Düzenle
                  </Button>
                  <Button variant="danger" size="sm" full onClick={() => setCancelId(a.id)}>
                    İptal Et
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Randevuyu iptal et"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelId(null)}>
              Vazgeç
            </Button>
            <Button variant="danger" onClick={doCancel}>
              Evet, iptal et
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Bu randevuyu iptal etmek istediğine emin misin? Slot başkalarına açılacak.
        </p>
      </Modal>
    </div>
  );
}
