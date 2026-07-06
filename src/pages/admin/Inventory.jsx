import { useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import Modal from "../../components/Modal.jsx";
import { Input, Select } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { machines as seed, CATEGORIES } from "../../mock/machines.js";
import { fetchMachines, fetchMachineQr } from "../../api/catalog.js";

const empty = { name: "", category: "Makine", location: "", rating: 4.5 };

export default function Inventory() {
  const toast = useToast();
  const [list, setList] = useState(seed);
  const [form, setForm] = useState(null); // null | {machine}
  const [qr, setQr] = useState(null); // {machine, dataUrl?, url?}
  const [del, setDel] = useState(null);

  useEffect(() => {
    fetchMachines()
      .then(setList)
      .catch(() => {});
  }, []);

  /** QR modalını açar; PNG'yi backend'den üretir (FR-QR-2/3). */
  const openQr = async (machine) => {
    setQr({ ...machine });
    try {
      const generated = await fetchMachineQr(machine.id);
      setQr((prev) =>
        prev && prev.id === machine.id
          ? { ...prev, dataUrl: generated.dataUrl, url: generated.url }
          : prev,
      );
    } catch (err) {
      toast(err.message ?? "QR üretilemedi", "error");
    }
  };

  const openNew = () => setForm({ ...empty, id: null });
  const openEdit = (m) => setForm({ ...m });

  const save = () => {
    if (form.id) {
      setList((l) => l.map((m) => (m.id === form.id ? form : m)));
      toast("Makine güncellendi", "success");
    } else {
      setList((l) => [{ ...form, id: "m" + Date.now(), muscles: [], reviews: 0, faults: 0 }, ...l]);
      toast("Makine eklendi", "success");
    }
    setForm(null);
  };

  const remove = () => {
    setList((l) => l.filter((m) => m.id !== del.id));
    setDel(null);
    toast("Makine silindi", "error");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Makine Envanteri</h1>
          <p className="text-sm text-gray-400">{list.length} makine kayıtlı</p>
        </div>
        <Button onClick={openNew}>+ Makine Ekle</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-400">
            <tr>
              <th className="px-5 py-3 font-medium">Makine</th>
              <th className="px-5 py-3 font-medium">Kategori</th>
              <th className="px-5 py-3 font-medium">Konum</th>
              <th className="px-5 py-3 font-medium">Puan</th>
              <th className="px-5 py-3 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-800">{m.name}</td>
                <td className="px-5 py-3">
                  <Badge tone="gray">{m.category}</Badge>
                </td>
                <td className="px-5 py-3 text-gray-500">{m.location}</td>
                <td className="px-5 py-3 font-bold text-primary-600">{m.rating}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3 text-sm font-semibold">
                    <button onClick={() => openQr(m)} className="text-gray-500">QR</button>
                    <button onClick={() => openEdit(m)} className="text-primary-600">Düzenle</button>
                    <button onClick={() => setDel(m)} className="text-red-500">Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Ekle / Düzenle */}
      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Makineyi Düzenle" : "Yeni Makine"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setForm(null)}>İptal</Button>
            <Button onClick={save}>Kaydet</Button>
          </>
        }
      >
        {form && (
          <div className="space-y-3">
            <Input
              label="Makine adı"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Select
              label="Kategori"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.filter((c) => c !== "Tümü").map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Input
              label="Konum"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Örn: Zemin Kat — B3"
            />
          </div>
        )}
      </Modal>

      {/* QR üretme */}
      <Modal open={!!qr} onClose={() => setQr(null)} title="QR Kodu" size="sm">
        {qr && (
          <div className="flex flex-col items-center">
            <div className="grid h-44 w-44 place-items-center rounded-2xl border-4 border-gray-900 bg-white p-2">
              {qr.dataUrl ? (
                <img src={qr.dataUrl} alt={`${qr.name} QR kodu`} className="h-full w-full" />
              ) : (
                <p className="text-xs text-gray-400">QR üretiliyor…</p>
              )}
            </div>
            <p className="mt-3 text-sm font-bold text-gray-900">{qr.name}</p>
            <p className="text-xs text-gray-400">{qr.location}</p>
            <code className="mt-2 rounded-lg bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
              {qr.url ?? `/machine/${qr.id}`}
            </code>
            <p className="mt-2 max-w-[220px] text-center text-[11px] text-gray-400">
              QR bu linki taşır; telefon kamerasıyla okununca makine detayını açar ve
              arıza bildirimi bu makineye scope'lanır.
            </p>
            <a
              href={qr.dataUrl}
              download={`metugym-qr-${qr.id}.png`}
              className={qr.dataUrl ? "" : "pointer-events-none opacity-40"}
            >
              <Button size="sm" className="mt-4">İndir (PNG)</Button>
            </a>
          </div>
        )}
      </Modal>

      {/* Silme onayı */}
      <Modal
        open={!!del}
        onClose={() => setDel(null)}
        title="Makineyi sil"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDel(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={remove}>Sil</Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          <b>{del?.name}</b> envanterden kalıcı olarak silinecek. Emin misin?
        </p>
      </Modal>
    </div>
  );
}
