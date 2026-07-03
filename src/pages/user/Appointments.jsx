import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Tabs from "../../components/Tabs.jsx";
import Modal from "../../components/Modal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { useToast } from "../../components/Toast.jsx";
import { appointments as seed } from "../../mock/appointments.js";
import { machineById, MUSCLE_GROUPS } from "../../mock/machines.js";
import { currentUser } from "../../mock/user.js";

const labelOf = (id) => MUSCLE_GROUPS.find((m) => m.id === id)?.label || id;
const STATUS = {
  upcoming: { tone: "green", label: "Yaklaşan" },
  completed: { tone: "gray", label: "Tamamlandı" },
  cancelled: { tone: "red", label: "İptal" },
};

export default function Appointments() {
  const nav = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("upcoming");
  const [list, setList] = useState(seed);
  const [cancelId, setCancelId] = useState(null);

  const filtered = list.filter((a) =>
    tab === "upcoming" ? a.status === "upcoming" : a.status !== "upcoming"
  );

  const doCancel = () => {
    setList((l) => l.map((a) => (a.id === cancelId ? { ...a, status: "cancelled" } : a)));
    setCancelId(null);
    toast("Randevu iptal edildi", "error");
  };

  return (
    <div className="px-4 py-5">
      {/* Profil kartı */}
      <Card className="mb-5 flex items-center gap-4 p-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-100 text-xl font-extrabold text-primary-700">
          {currentUser.avatar}
        </div>
        <div className="flex-1">
          <p className="text-lg font-extrabold text-gray-900">{currentUser.name}</p>
          <p className="text-sm text-gray-400">{currentUser.email}</p>
          <p className="text-xs text-gray-400">Üyelik: {currentUser.memberSince}</p>
        </div>
        <button className="text-sm font-semibold text-primary-600">Düzenle</button>
      </Card>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          ["Toplam", list.length],
          ["Yaklaşan", list.filter((a) => a.status === "upcoming").length],
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

      {filtered.length === 0 ? (
        <EmptyState
          icon="📅"
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
                    {new Date(a.date).toLocaleDateString("tr-TR", {
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
                {a.machines.map((m) => (
                  <Badge key={m} tone="gray">
                    {machineById(m)?.name}
                  </Badge>
                ))}
              </div>
              {a.status === "upcoming" && (
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" full onClick={() => nav("/book")}>
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
