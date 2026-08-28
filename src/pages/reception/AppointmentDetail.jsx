import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../components/Toast.jsx";
import {
  Eyebrow,
  GlassButton,
  Panel,
  StatusChip,
  Tag,
} from "../../components/reception/ReceptionUI.jsx";
import { todaysCheckins as mockRows } from "../../mock/appointments.js";
import { machineById, MUSCLE_GROUPS } from "../../mock/machines.js";
import { fetchReceptionAppointment, updateReceptionStatus } from "../../api/reception.js";
import { isMockRowId } from "../../api/client.js";

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
      <button
        onClick={() => nav("/reception")}
        className="mb-7 text-[10px] font-bold uppercase tracking-[0.22em] text-white/75 transition-colors duration-fast hover:text-white/85"
      >
        ← Check-in listesi
      </button>

      <Panel className="overflow-hidden">
        {/* Künye — isim solda, saat sağda; ayrım renk değil boşluk ve çizgi */}
        <div className="flex items-start justify-between gap-6 border-b border-white/30 px-8 pb-7 pt-8">
          <div className="min-w-0">
            <Eyebrow>Randevu</Eyebrow>
            <p className="mt-3.5 truncate font-display text-[30px] font-medium leading-none tracking-[-0.03em] text-white">
              {row.name}
            </p>
            <p className="mt-2.5 text-[13px] font-medium tabular-nums text-white/80">{row.phone}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="tabular-nums font-display text-[38px] font-medium leading-none tracking-[-0.03em] text-white">
              {row.time}
            </p>
            <div className="mt-3.5 flex justify-end">
              <StatusChip status={status} />
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-8 py-7 sm:grid-cols-2">
          <div>
            <Eyebrow className="!tracking-[0.22em]">Kas Grupları</Eyebrow>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {row.muscleGroups.map((g) => (
                <Tag key={g}>{labelOf(g)}</Tag>
              ))}
            </div>
          </div>
          <div>
            <Eyebrow className="!tracking-[0.22em]">Planlanan Makineler</Eyebrow>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {row.machines.map((m) => (
                <Tag key={m}>{machineById(m)?.name}</Tag>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-white/30 px-8 py-6">
          {status !== "checked-in" ? (
            <GlassButton
              variant="go"
              className="flex-1"
              onClick={() => {
                applyStatus("checked-in");
                toast(`${row.name} gelişi onaylandı`, "success");
              }}
            >
              Gelişi Onayla
            </GlassButton>
          ) : (
            <GlassButton
              className="flex-1"
              onClick={() => {
                applyStatus("pending");
                toast("Yanlış işaretleme geri alındı", "error");
              }}
            >
              Geri Al
            </GlassButton>
          )}
          {status !== "checked-in" && status !== "no-show" && (
            <GlassButton variant="ghost" onClick={() => applyStatus("no-show")}>
              Gelmedi
            </GlassButton>
          )}
        </div>
      </Panel>
    </div>
  );
}
