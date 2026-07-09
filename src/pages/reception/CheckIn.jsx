import { useCallback, useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import Tabs from "../../components/Tabs.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { Input } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { todaysCheckins as mockRows } from "../../mock/appointments.js";
import { machineById, MUSCLE_GROUPS } from "../../mock/machines.js";
import { fetchTodayAppointments, updateReceptionStatus } from "../../api/reception.js";
import { isMockRowId, mergeById } from "../../api/client.js";

const ST = {
  pending: { tone: "yellow", label: "Bekliyor" },
  "checked-in": { tone: "green", label: "Geldi" },
  "no-show": { tone: "red", label: "Gelmedi" },
};
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
    <div className="flex gap-6">
      <div className="flex-1 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Bugünün Check-in'i</h1>
            <p className="text-sm text-gray-400">
              {todayLabel} · {stats.total} randevu
            </p>
          </div>
          <Button variant="outline" onClick={() => { load(); toast("Liste yenilendi"); }}>
            Yenile
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card soft className="p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Toplam</p>
          </Card>
          <Card soft className="p-4 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{stats.arrived}</p>
            <p className="text-xs text-gray-500">Geldi</p>
          </Card>
          <Card soft className="p-4 text-center">
            <p className="text-2xl font-extrabold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Bekliyor</p>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="İsim veya telefon ile ara..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <Tabs
          tabs={hours.map((h) => ({ value: h, label: h === "all" ? "Tüm saatler" : h }))}
          active={hour}
          onChange={setHour}
        />

        {filtered.length === 0 ? (
          <EmptyState icon="search" title="Randevu bulunamadı" />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Saat</th>
                  <th className="px-5 py-3 font-medium">İsim</th>
                  <th className="px-5 py-3 font-medium">Telefon</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                  <th className="px-5 py-3 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`cursor-pointer border-t border-gray-50 hover:bg-primary-50/40 ${
                      selected?.id === r.id ? "bg-primary-50" : ""
                    }`}
                  >
                    <td className="px-5 py-3 font-bold text-gray-900">{r.time}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{r.name}</td>
                    <td className="px-5 py-3 text-gray-500">{r.phone}</td>
                    <td className="px-5 py-3">
                      <Badge tone={ST[r.status].tone}>{ST[r.status].label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {r.status !== "checked-in" ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            checkin(r);
                          }}
                        >
                          Geldi
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600">✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <div className="w-80 shrink-0">
        <div className="sticky top-24">
          {selected ? (
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Randevu Detayı
              </p>
              <p className="mt-1 text-xl font-extrabold text-gray-900">{selected.name}</p>
              <p className="text-sm text-gray-400">{selected.phone}</p>

              <div className="my-4 flex items-center gap-2">
                <Badge tone="primary">{selected.time}</Badge>
                <Badge tone={ST[selected.status].tone}>{ST[selected.status].label}</Badge>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-3 text-sm">
                <div>
                  <p className="mb-1 text-xs font-semibold text-gray-400">Kas Grupları</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.muscleGroups.map((g) => (
                      <Badge key={g} tone="primary">
                        {labelOf(g)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-gray-400">Makineler</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.machines.map((m) => (
                      <Badge key={m} tone="gray">
                        {machineById(m)?.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {selected.status !== "checked-in" ? (
                  <Button full onClick={() => checkin(selected)}>
                    ✓ Gelişi Onayla
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    full
                    onClick={() => {
                      applyStatus(selected.id, "pending");
                      toast("Check-in geri alındı", "error");
                    }}
                  >
                    ↩ Geri Al
                  </Button>
                )}
                {selected.status !== "checked-in" && selected.status !== "no-show" && (
                  <Button
                    variant="ghost"
                    full
                    onClick={() => applyStatus(selected.id, "no-show")}
                  >
                    Gelmedi işaretle
                  </Button>
                )}
                {selected.status === "no-show" && (
                  <Button full onClick={() => checkin(selected)}>
                    Geldi olarak işaretle
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <EmptyState
              icon="clipboard"
              title="Randevu seç"
              description="Detayları ve check-in onayını görmek için tablodan bir kayıt seç."
            />
          )}
        </div>
      </div>
    </div>
  );
}
