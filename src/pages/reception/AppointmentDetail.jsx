import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import { useToast } from "../../components/Toast.jsx";
import { todaysCheckins as mockRows } from "../../mock/appointments.js";
import { machineById, MUSCLE_GROUPS } from "../../mock/machines.js";
import { fetchReceptionAppointment, updateReceptionStatus } from "../../api/reception.js";
import { isMockRowId } from "../../api/client.js";

const ST = {
  pending: { tone: "yellow", label: "Bekliyor" },
  "checked-in": { tone: "green", label: "Geldi" },
  "no-show": { tone: "red", label: "Gelmedi" },
};
const labelOf = (id) => MUSCLE_GROUPS.find((m) => m.id === id)?.label || id;

export default function AppointmentDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const mockBase = mockRows.find((r) => r.id === id) || mockRows[0];
  const [row, setRow] = useState(mockBase);
  const [status, setStatus] = useState(mockBase.status);

  useEffect(() => {
    if (isMockRowId(id)) return;
    fetchReceptionAppointment(id)
      .then((data) => {
        setRow(data);
        setStatus(data.status);
      })
      .catch(() => {});
  }, [id]);

  const applyStatus = async (next) => {
    setStatus(next);
    setRow((r) => ({ ...r, status: next }));
    if (!isMockRowId(row.id)) {
      try {
        const updated = await updateReceptionStatus(row.id, next);
        setRow(updated);
        setStatus(updated.status);
      } catch (err) {
        toast(err.message ?? "Durum güncellenemedi", "error");
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => nav("/reception")} className="mb-4 text-sm text-gray-400">
        ← Check-in listesine dön
      </button>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between bg-primary-600 px-6 py-5 text-white">
          <div>
            <p className="text-xs uppercase tracking-wide text-primary-100">Randevu</p>
            <p className="text-2xl font-extrabold">{row.name}</p>
            <p className="text-sm text-primary-100">{row.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold">{row.time}</p>
            <Badge tone={ST[status].tone} className="!bg-white/20 !text-white">
              {ST[status].label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6">
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-400">Kas Grupları</p>
            <div className="flex flex-wrap gap-1.5">
              {row.muscleGroups.map((g) => (
                <Badge key={g} tone="primary">
                  {labelOf(g)}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-400">Planlanan Makineler</p>
            <div className="flex flex-wrap gap-1.5">
              {row.machines.map((m) => (
                <Badge key={m} tone="gray">
                  {machineById(m)?.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          {status !== "checked-in" ? (
            <Button
              full
              onClick={() => {
                applyStatus("checked-in");
                toast(`${row.name} gelişi onaylandı`, "success");
              }}
            >
              Gelişi Onayla
            </Button>
          ) : (
            <Button
              variant="outline"
              full
              onClick={() => {
                applyStatus("pending");
                toast("Yanlış işaretleme geri alındı", "error");
              }}
            >
              ↩ Geri Al (yanlış işaretledim)
            </Button>
          )}
          {status !== "checked-in" && (
            <Button variant="ghost" onClick={() => applyStatus("no-show")}>
              Gelmedi
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
