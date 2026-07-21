import { useCallback, useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import Modal from "../../components/Modal.jsx";
import { Input, Select, Textarea } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { MUSCLES } from "../../components/BodyDiagram.jsx";
import { machines as seed, CATEGORIES, MUSCLE_GROUPS } from "../../mock/machines.js";
import { fetchMachineQr } from "../../api/catalog.js";
import {
  createAdminMachine,
  deleteAdminMachine,
  deleteAdminMachinePhoto,
  deleteAdminMachineQr,
  fetchAdminMachines,
  updateAdminMachine,
  uploadAdminMachinePhoto,
  uploadAdminMachineQr,
} from "../../api/admin.js";

const TARGET_OPTIONS = Object.entries(MUSCLES).map(([id, m]) => ({
  id,
  label: m.label,
}));

const EMPTY = {
  name: "",
  category: "Makine",
  location: "",
  description: "",
  tips: "",
  muscles: [],
  targetMuscles: [],
  isActive: true,
  photoUrl: null,
  photoFile: null,
  removePhoto: false,
};

function toggleIn(list, id) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function ChipToggle({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
        selected
          ? "border-primary-500 bg-primary-50 text-primary-700"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

export default function Inventory() {
  const toast = useToast();
  const [list, setList] = useState(seed);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [qr, setQr] = useState(null);
  const [del, setDel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [qrBusy, setQrBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchAdminMachines();
      setList(rows ?? []);
    } catch {
      setList(seed);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!form?.photoFile) {
      setFilePreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(form.photoFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form?.photoFile]);

  const openQr = async (machine) => {
    setQr({
      ...machine,
      custom: Boolean(machine.qrImageUrl),
      dataUrl: machine.qrImageUrl || undefined,
    });
    try {
      const generated = await fetchMachineQr(machine.id);
      setQr((prev) =>
        prev && prev.id === machine.id
          ? {
              ...prev,
              dataUrl: generated.dataUrl,
              url: generated.url,
              custom: generated.custom === true,
            }
          : prev,
      );
    } catch (err) {
      toast(err.message ?? "QR üretilemedi", "error");
    }
  };

  const replaceQrPng = async (file) => {
    if (!qr?.id || !file) return;
    setQrBusy(true);
    try {
      const updated = await uploadAdminMachineQr(qr.id, file);
      setList((l) => l.map((m) => (m.id === updated.id ? updated : m)));
      const refreshed = await fetchMachineQr(qr.id);
      setQr((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              dataUrl: refreshed.dataUrl,
              url: refreshed.url,
              custom: refreshed.custom === true,
            }
          : prev,
      );
      toast("QR PNG güncellendi", "success");
    } catch (err) {
      toast(err.message ?? "QR yüklenemedi", "error");
    } finally {
      setQrBusy(false);
    }
  };

  const clearCustomQr = async () => {
    if (!qr?.id) return;
    setQrBusy(true);
    try {
      const updated = await deleteAdminMachineQr(qr.id);
      setList((l) => l.map((m) => (m.id === updated.id ? updated : m)));
      const refreshed = await fetchMachineQr(qr.id);
      setQr((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              dataUrl: refreshed.dataUrl,
              url: refreshed.url,
              custom: false,
            }
          : prev,
      );
      toast("Özel QR silindi — otomatik üretime dönüldü", "success");
    } catch (err) {
      toast(err.message ?? "QR silinemedi", "error");
    } finally {
      setQrBusy(false);
    }
  };

  const openNew = () => {
    setEditId(null);
    setForm({ ...EMPTY });
  };

  const openEdit = (m) => {
    setEditId(m.id);
    setForm({
      name: m.name ?? "",
      category: m.category ?? "Makine",
      location: m.location ?? "",
      description: m.description ?? "",
      tips: m.tips ?? "",
      muscles: [...(m.muscles ?? [])],
      targetMuscles: [...(m.targetMuscles ?? [])],
      isActive: m.isActive !== false,
      photoUrl: m.photoUrl ?? null,
      photoFile: null,
      removePhoto: false,
    });
  };

  const previewUrl = form?.photoFile
    ? filePreview
    : form?.removePhoto
      ? null
      : form?.photoUrl ?? null;

  const save = async () => {
    if (!form?.name?.trim() || !form?.location?.trim()) {
      toast("Ad ve konum gerekli", "error");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      location: form.location.trim(),
      description: form.description?.trim() || undefined,
      tips: form.tips?.trim() || undefined,
      muscleGroupIds: form.muscles,
      targetMuscles: form.targetMuscles,
      isActive: form.isActive,
    };
    try {
      let saved;
      if (editId) {
        saved = await updateAdminMachine(editId, payload);
      } else {
        saved = await createAdminMachine(payload);
      }

      if (form.removePhoto && editId && saved.photoUrl) {
        saved = await deleteAdminMachinePhoto(saved.id);
      } else if (form.photoFile) {
        saved = await uploadAdminMachinePhoto(saved.id, form.photoFile);
      }

      setList((l) => {
        const exists = l.some((m) => m.id === saved.id);
        return exists ? l.map((m) => (m.id === saved.id ? saved : m)) : [saved, ...l];
      });
      toast(editId ? "Makine güncellendi" : "Makine eklendi", "success");
      setForm(null);
      setEditId(null);
    } catch (err) {
      toast(err.message ?? "Kaydedilemedi", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!del) return;
    setRemoving(true);
    try {
      await deleteAdminMachine(del.id);
      setList((l) =>
        l.map((m) => (m.id === del.id ? { ...m, isActive: false } : m)),
      );
      setDel(null);
      toast("Makine pasife alındı", "success");
    } catch (err) {
      toast(err.message ?? "Silinemedi", "error");
    } finally {
      setRemoving(false);
    }
  };

  const activeCount = list.filter((m) => m.isActive !== false).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Makine Envanteri</h1>
          <p className="text-sm text-gray-400">
            {loading ? "Yükleniyor…" : `${activeCount} aktif / ${list.length} toplam`}
          </p>
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
              <th className="px-5 py-3 font-medium">Kaslar</th>
              <th className="px-5 py-3 font-medium">Puan</th>
              <th className="px-5 py-3 font-medium">Durum</th>
              <th className="px-5 py-3 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr
                key={m.id}
                className={`border-t border-gray-50 hover:bg-gray-50 ${
                  m.isActive === false ? "opacity-55" : ""
                }`}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {m.photoUrl ? (
                        <img
                          src={m.photoUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[10px] text-gray-400">
                          —
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-gray-800">{m.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge tone="gray">{m.category}</Badge>
                </td>
                <td className="px-5 py-3 text-gray-500">{m.location}</td>
                <td className="px-5 py-3 text-xs text-gray-500">
                  {(m.muscles ?? []).length
                    ? (m.muscles ?? [])
                        .map((id) => MUSCLE_GROUPS.find((g) => g.id === id)?.label ?? id)
                        .join(", ")
                    : "—"}
                </td>
                <td className="px-5 py-3 font-bold text-primary-600">
                  {m.rating || "—"}
                </td>
                <td className="px-5 py-3">
                  <Badge tone={m.isActive === false ? "red" : "green"}>
                    {m.isActive === false ? "Pasif" : "Aktif"}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3 text-sm font-semibold">
                    <button type="button" onClick={() => openQr(m)} className="text-gray-500">
                      QR
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      className="text-primary-600"
                    >
                      Düzenle
                    </button>
                    {m.isActive !== false && (
                      <button
                        type="button"
                        onClick={() => setDel(m)}
                        className="text-red-500"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal
        open={!!form}
        onClose={() => {
          if (!saving) {
            setForm(null);
            setEditId(null);
          }
        }}
        title={editId ? "Makineyi Düzenle" : "Yeni Makine"}
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              disabled={saving}
              onClick={() => {
                setForm(null);
                setEditId(null);
              }}
            >
              İptal
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </>
        }
      >
        {form && (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <div className="grid gap-3 sm:grid-cols-2">
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
            </div>
            <Input
              label="Konum"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Örn: Zemin Kat — B3"
            />

            <div>
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Fotoğraf</span>
              <div className="flex flex-wrap items-start gap-4">
                <div className="h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
                  {previewUrl ? (
                    <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-gray-400">
                      Yok
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer">
                    <span className="inline-flex h-10 items-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      Dosya seç
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setForm({
                          ...form,
                          photoFile: file,
                          removePhoto: false,
                        });
                      }}
                    />
                  </label>
                  {(form.photoUrl || form.photoFile) && !form.removePhoto && (
                    <button
                      type="button"
                      className="text-left text-xs font-semibold text-red-500"
                      onClick={() =>
                        setForm({
                          ...form,
                          photoFile: null,
                          removePhoto: Boolean(form.photoUrl),
                        })
                      }
                    >
                      Fotoğrafı kaldır
                    </button>
                  )}
                  <p className="text-[11px] text-gray-400">JPEG / PNG / WebP, max 5 MB</p>
                </div>
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-gray-700">
                Kas grupları
              </span>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((g) => (
                  <ChipToggle
                    key={g.id}
                    selected={form.muscles.includes(g.id)}
                    onClick={() =>
                      setForm({ ...form, muscles: toggleIn(form.muscles, g.id) })
                    }
                  >
                    {g.label}
                  </ChipToggle>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-gray-700">
                Hedef kaslar
              </span>
              <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-xl border border-gray-100 p-2">
                {TARGET_OPTIONS.map((t) => (
                  <ChipToggle
                    key={t.id}
                    selected={form.targetMuscles.includes(t.id)}
                    onClick={() =>
                      setForm({
                        ...form,
                        targetMuscles: toggleIn(form.targetMuscles, t.id),
                      })
                    }
                  >
                    {t.label}
                  </ChipToggle>
                ))}
              </div>
            </div>

            <Textarea
              label="Açıklama"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
            <Textarea
              label="İpuçları"
              value={form.tips}
              onChange={(e) => setForm({ ...form, tips: e.target.value })}
              rows={2}
            />

            {editId && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600"
                />
                Aktif (katalogda görünsün)
              </label>
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!qr} onClose={() => !qrBusy && setQr(null)} title="QR Kodu" size="sm">
        {qr && (
          <div className="flex flex-col items-center">
            <div className="grid h-44 w-44 place-items-center rounded-2xl border-4 border-gray-900 bg-white p-2">
              {qr.dataUrl ? (
                <img src={qr.dataUrl} alt={`${qr.name} QR kodu`} className="h-full w-full object-contain" />
              ) : (
                <p className="text-xs text-gray-400">QR üretiliyor…</p>
              )}
            </div>
            <p className="mt-3 text-sm font-bold text-gray-900">{qr.name}</p>
            <p className="text-xs text-gray-400">{qr.location}</p>
            <code className="mt-2 rounded-lg bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
              {qr.url ?? `/machine/${qr.id}`}
            </code>
            <Badge tone={qr.custom ? "primary" : "gray"} className="mt-2">
              {qr.custom ? "Özel PNG" : "Otomatik üretilen"}
            </Badge>
            <p className="mt-2 max-w-[240px] text-center text-[11px] text-gray-400">
              Deep-link her zaman aynı kalır. İstersen baskı için kendi QR PNG&apos;ni
              yükleyebilirsin.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <label className={qrBusy ? "pointer-events-none opacity-50" : "cursor-pointer"}>
                <span className="inline-flex h-9 items-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  {qrBusy ? "Yükleniyor…" : "PNG yükle"}
                </span>
                <input
                  type="file"
                  accept="image/png"
                  className="hidden"
                  disabled={qrBusy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) replaceQrPng(file);
                  }}
                />
              </label>
              {qr.custom && (
                <Button size="sm" variant="ghost" disabled={qrBusy} onClick={clearCustomQr}>
                  Özel QR&apos;ı sil
                </Button>
              )}
              <a
                href={qr.dataUrl}
                download={`metugym-qr-${qr.id}.png`}
                className={qr.dataUrl && !qrBusy ? "" : "pointer-events-none opacity-40"}
              >
                <Button size="sm">İndir (PNG)</Button>
              </a>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!del}
        onClose={() => !removing && setDel(null)}
        title="Makineyi pasife al"
        footer={
          <>
            <Button variant="ghost" disabled={removing} onClick={() => setDel(null)}>
              Vazgeç
            </Button>
            <Button variant="danger" disabled={removing} onClick={remove}>
              {removing ? "İşleniyor…" : "Pasife al"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          <b>{del?.name}</b> katalogdan gizlenecek (soft-delete). İlişkili randevu ve arıza
          kayıtları korunur. Daha sonra düzenlemeden tekrar aktif edebilirsin.
        </p>
      </Modal>
    </div>
  );
}
