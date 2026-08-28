import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../components/Toast.jsx";
import {
  Eyebrow,
  Figure,
  GlassButton,
  GlassField,
  Panel,
  Placeholder,
  Segmented,
  StatusChip,
  Tag,
} from "../../components/reception/ReceptionUI.jsx";
import { todaysCheckins as mockRows } from "../../mock/appointments.js";
import { machineById, MUSCLE_GROUPS } from "../../mock/machines.js";
import { fetchTodayAppointments, updateReceptionStatus } from "../../api/reception.js";
import { isMockRowId, mergeById } from "../../api/client.js";

const labelOf = (id) => MUSCLE_GROUPS.find((m) => m.id === id)?.label || id;

function sortByTime(rows) {
  return [...rows].sort((a, b) => a.time.localeCompare(b.time));
}

export default function CheckIn() {
  const toast = useToast();
  const [rows, setRows] = useState(mockRows);
  const [q, setQ] = useState("");
  const [hour, setHour] = useState("all");
  const [selected, setSelected] = useState(null);

  const todayLabel = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });

  const load = useCallback(async () => {
    try {
      const apiRows = await fetchTodayAppointments();
      // Gerçek kayıtlar önce; mock demo satırları (c1, c2…) aynı id yoksa eklenir.
      setRows(sortByTime(mergeById(mockRows, apiRows ?? [])));
    } catch {
      setRows(sortByTime(mockRows));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hours = ["all", ...new Set(rows.map((r) => r.time.slice(0, 2) + ":00"))];

  const filtered = rows.filter(
    (r) =>
      (hour === "all" || r.time.startsWith(hour.slice(0, 2))) &&
      (r.name.toLowerCase().includes(q.toLowerCase()) || r.phone.includes(q))
  );

  const applyStatus = async (id, status) => {
    setRows((l) => l.map((r) => (r.id === id ? { ...r, status } : r)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));

    if (!isMockRowId(id)) {
      try {
        const updated = await updateReceptionStatus(id, status);
        setRows((l) => l.map((r) => (r.id === id ? updated : r)));
        setSelected((s) => (s && s.id === id ? updated : s));
      } catch (err) {
        toast(err.message ?? "Durum güncellenemedi", "error");
        load();
      }
    }
  };

  const checkin = (r) => {
    applyStatus(r.id, "checked-in");
    toast(`${r.name} check-in yapıldı`, "success");
  };

  const stats = {
    total: rows.length,
    arrived: rows.filter((r) => r.status === "checked-in").length,
    pending: rows.filter((r) => r.status === "pending").length,
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-7">
        {/* Manşet */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <Eyebrow>{todayLabel}</Eyebrow>
            <h1 className="mt-3 font-display text-[38px] font-medium leading-none tracking-[-0.03em] text-white">
              Check-in
            </h1>
          </div>
          <GlassButton
            onClick={() => {
              load();
              toast("Liste yenilendi");
            }}
          >
            Yenile
          </GlassButton>
        </div>

        {/* Rakamlar — tek panel, ince dikey ayraçlarla bölünmüş gazete künyesi */}
        <Panel quiet className="grid grid-cols-3 divide-x divide-white/10">
          <Figure value={stats.total} label="Toplam" />
          <Figure value={stats.arrived} label="Geldi" />
          <Figure value={stats.pending} label="Bekliyor" />
        </Panel>

        {/* Filtreler */}
        <div className="space-y-4">
          <GlassField
            placeholder="İsim veya telefon ile ara"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="İsim veya telefon ile ara"
          />
          <Segmented
            ariaLabel="Saat filtresi"
            items={hours.map((h) => ({ value: h, label: h === "all" ? "Tüm saatler" : h }))}
            value={hour}
            onChange={setHour}
          />
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <Placeholder
            title="Randevu bulunamadı"
            description="Arama veya saat filtresini değiştirerek tekrar deneyin."
          />
        ) : (
          <Panel className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.12] text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                  <th className="px-6 py-4 font-semibold">Saat</th>
                  <th className="px-6 py-4 font-semibold">Üye</th>
                  <th className="hidden px-6 py-4 font-semibold md:table-cell">Telefon</th>
                  <th className="px-6 py-4 font-semibold">Durum</th>
                  <th className="px-6 py-4 text-right font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`rc-row cursor-pointer border-b border-white/[0.07] last:border-b-0 ${
                      selected?.id === r.id ? "is-active" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="tabular-nums font-display text-[17px] font-semibold tracking-[-0.01em] text-white">
                        {r.time}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[15px] font-semibold text-white">{r.name}</td>
                    <td className="hidden px-6 py-4 text-[13px] font-medium tabular-nums text-white/65 md:table-cell">
                      {r.phone}
                    </td>
                    <td className="px-6 py-4">
                      <StatusChip status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status !== "checked-in" ? (
                        <GlassButton
                          variant="tint"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            checkin(r);
                          }}
                        >
                          Geldi
                        </GlassButton>
                      ) : (
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                          Onaylı
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>

      {/* Detay rayı */}
      <div className="w-full shrink-0 lg:w-[21rem]">
        <div className="lg:sticky lg:top-28">
          {selected ? (
            <Panel className="p-7">
              <Eyebrow>Randevu Detayı</Eyebrow>
              <p className="mt-4 font-display text-[26px] font-medium leading-tight tracking-[-0.02em] text-white">
                {selected.name}
              </p>
              <p className="mt-1.5 text-[13px] font-medium tabular-nums text-white/65">{selected.phone}</p>

              <div className="mt-5 flex items-center gap-3">
                <span className="tabular-nums font-display text-[15px] font-semibold text-white/90">
                  {selected.time}
                </span>
                <span className="h-3.5 w-px bg-white/20" />
                <StatusChip status={selected.status} />
              </div>

              <div className="mt-6 space-y-5 border-t border-white/10 pt-6">
                <div>
                  <Eyebrow className="!tracking-[0.22em]">Kas Grupları</Eyebrow>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selected.muscleGroups.map((g) => (
                      <Tag key={g}>{labelOf(g)}</Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <Eyebrow className="!tracking-[0.22em]">Makineler</Eyebrow>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selected.machines.map((m) => (
                      <Tag key={m}>{machineById(m)?.name}</Tag>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-2.5">
                {selected.status !== "checked-in" ? (
                  <GlassButton variant="solid" full onClick={() => checkin(selected)}>
                    Gelişi Onayla
                  </GlassButton>
                ) : (
                  <GlassButton
                    full
                    onClick={() => {
                      applyStatus(selected.id, "pending");
                      toast("Check-in geri alındı", "error");
                    }}
                  >
                    Geri Al
                  </GlassButton>
                )}
                {selected.status !== "checked-in" && selected.status !== "no-show" && (
                  <GlassButton variant="ghost" full onClick={() => applyStatus(selected.id, "no-show")}>
                    Gelmedi olarak işaretle
                  </GlassButton>
                )}
                {selected.status === "no-show" && (
                  <GlassButton variant="solid" full onClick={() => checkin(selected)}>
                    Geldi olarak işaretle
                  </GlassButton>
                )}
              </div>
            </Panel>
          ) : (
            <Placeholder
              title="Randevu seç"
              description="Detayları ve check-in onayını görmek için listeden bir kayıt seçin."
            />
          )}
        </div>
      </div>
    </div>
  );
}
