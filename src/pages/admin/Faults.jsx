import { useCallback, useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import Modal from "../../components/Modal.jsx";
import Tabs from "../../components/Tabs.jsx";
import { Input, Select } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { faults as mockFaults } from "../../mock/feedback.js";
import { fetchAdminFaults, updateAdminFaultStatus } from "../../api/admin.js";
import { isMockRowId } from "../../api/client.js";

const SEV = { high: { tone: "red", label: "Yüksek" }, medium: { tone: "yellow", label: "Orta" }, low: { tone: "gray", label: "Düşük" } };
const ST = {
  pending: { tone: "gray", label: "Beklemede" },
  open: { tone: "red", label: "Açık" },
  "in-progress": { tone: "yellow", label: "İşlemde" },
  resolved: { tone: "green", label: "Çözüldü" },
};
const STATUS_OPTIONS = [
  { value: "open", label: "Açık" },
  { value: "in-progress", label: "İşlemde" },
  { value: "resolved", label: "Çözüldü" },
];

export default function Faults() {
  const toast = useToast();
  const [list, setList] = useState(mockFaults);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      // API başarılıysa tek kaynak; mock ile birleştirmek kayıtları
      // çiftliyordu (mock ve seed aynı demo verilerini içeriyor).
      const apiRows = await fetchAdminFaults();
      setList(apiRows ?? []);
    } catch {
      setList(mockFaults);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (detail) {
      setEditStatus(detail.status === "pending" ? "" : detail.status);
    }
  }, [detail]);

  const filtered = list.filter(
    (f) =>
      (status === "all" || f.status === status) &&
      (f.machine.toLowerCase().includes(q.toLowerCase()) ||
        f.issue.toLowerCase().includes(q.toLowerCase()))
  );

  const saveStatus = async () => {
    if (!detail || !editStatus) return;
    setSaving(true);
    try {
      if (!isMockRowId(detail.id)) {
        const updated = await updateAdminFaultStatus(detail.id, editStatus);
        setList((l) => l.map((f) => (f.id === detail.id ? updated : f)));
        setDetail(updated);
      } else {
        const updated = { ...detail, status: editStatus };
        setList((l) => l.map((f) => (f.id === detail.id ? updated : f)));
        setDetail(updated);
      }
      toast("Durum güncellendi", "success");
    } catch (err) {
      toast(err.message ?? "Güncelleme başarısız", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Arıza Bildirimleri</h1>
        <p className="text-sm text-gray-400">Bildirimleri filtrele, incele ve durumunu güncelle</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Tabs
          tabs={[
            { value: "all", label: "Tümü" },
            { value: "pending", label: "Beklemede" },
            { value: "open", label: "Açık" },
            { value: "in-progress", label: "İşlemde" },
            { value: "resolved", label: "Çözüldü" },
          ]}
          active={status}
          onChange={setStatus}
        />
        <div className="w-64">
          <Input placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-400">
            <tr>
              <th className="px-5 py-3 font-medium">Makine</th>
              <th className="px-5 py-3 font-medium">Sorun</th>
              <th className="px-5 py-3 font-medium">Öncelik</th>
              <th className="px-5 py-3 font-medium">Tarih</th>
              <th className="px-5 py-3 font-medium">Durum</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-800">{f.machine}</td>
                <td className="max-w-xs truncate px-5 py-3 text-gray-600">{f.issue}</td>
                <td className="px-5 py-3">
                  <Badge tone={SEV[f.severity].tone}>{SEV[f.severity].label}</Badge>
                </td>
                <td className="px-5 py-3 text-gray-500">{f.date}</td>
                <td className="px-5 py-3">
                  <Badge tone={ST[f.status].tone}>{ST[f.status].label}</Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setDetail(f)}
                    className="text-sm font-semibold text-primary-600"
                  >
                    Detay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Arıza Detayı"
        footer={
          detail && (
            <>
              <Button variant="ghost" onClick={() => setDetail(null)}>
                Kapat
              </Button>
              <Button
                onClick={saveStatus}
                disabled={saving || !editStatus || editStatus === detail.status}
              >
                {saving ? "Kaydediliyor…" : "Durumu Kaydet"}
              </Button>
            </>
          )
        }
      >
        {detail && (
          <div className="space-y-3 text-sm">
            <Row label="Makine" value={detail.machine} />
            <Row label="Bildiren" value={detail.reporter} />
            <Row label="Tarih" value={detail.date} />
            <Row label="Öncelik" value={SEV[detail.severity].label} />
            <Select
              label="Durum"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <option value="" disabled>
                {detail.status === "pending" ? "Durum seçin…" : "Durumu değiştir…"}
              </option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            <div>
              <p className="mb-1 text-xs font-semibold text-gray-400">Açıklama</p>
              <p className="rounded-xl bg-gray-50 p-3 text-gray-700">{detail.issue}</p>
            </div>
            <p className="text-xs text-gray-400">
              Yeni bildirimler <b>Beklemede</b> olarak gelir; Açık, İşlemde veya Çözüldü durumunu
              admin belirler.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-50 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
