import { useCallback, useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Button from "../../components/Button.jsx";
import Modal from "../../components/Modal.jsx";
import { Input, Select, Textarea } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import {
  announcements as mockSeed,
  CATEGORY_LABELS,
  CATEGORY_TONES,
} from "../../mock/announcements.js";
import {
  categoryToApi,
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  fetchAdminAnnouncements,
  updateAdminAnnouncement,
} from "../../api/announcements.js";
import { isMockRowId } from "../../api/client.js";

const EMPTY_FORM = { title: "", body: "", category: "general", isActive: true };

export default function AnnouncementsAdmin() {
  const toast = useToast();
  const [list, setList] = useState(mockSeed);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [delId, setDelId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      // API başarılıysa tek kaynak; mock ile birleştirmek kayıtları çiftliyordu.
      const apiRows = await fetchAdminAnnouncements();
      setList(apiRows ?? []);
    } catch {
      setList(mockSeed);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      title: row.title,
      body: row.body,
      category: row.category,
      isActive: row.isActive !== false,
    });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast("Başlık ve metin gerekli", "error");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      category: categoryToApi(form.category),
      isActive: form.isActive,
    };
    try {
      if (editId && !isMockRowId(editId)) {
        const updated = await updateAdminAnnouncement(editId, payload);
        setList((l) => l.map((r) => (r.id === editId ? updated : r)));
      } else if (!editId) {
        const created = await createAdminAnnouncement(payload);
        setList((l) => [created, ...l]);
      } else {
        setList((l) =>
          l.map((r) =>
            r.id === editId
              ? { ...r, ...form, date: new Date().toISOString().slice(0, 10) }
              : r,
          ),
        );
      }
      toast(editId ? "Duyuru güncellendi" : "Duyuru paylaşıldı", "success");
      setFormOpen(false);
    } catch (err) {
      toast(err.message ?? "Kaydedilemedi", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!delId) return;
    setSaving(true);
    try {
      if (!isMockRowId(delId)) {
        await deleteAdminAnnouncement(delId);
      }
      setList((l) => l.filter((r) => r.id !== delId));
      toast("Duyuru silindi", "dark");
      setDelId(null);
    } catch (err) {
      toast(err.message ?? "Silinemedi", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row) => {
    if (isMockRowId(row.id)) {
      setList((l) =>
        l.map((r) => (r.id === row.id ? { ...r, isActive: !r.isActive } : r)),
      );
      return;
    }
    try {
      const updated = await updateAdminAnnouncement(row.id, { isActive: !row.isActive });
      setList((l) => l.map((r) => (r.id === row.id ? updated : r)));
    } catch (err) {
      toast(err.message ?? "Güncellenemedi", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Duyurular</h1>
          <p className="text-sm text-gray-400">Üyelere bildirim olarak gösterilir</p>
        </div>
        <Button onClick={openCreate}>+ Duyuru Paylaş</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-400">
            <tr>
              <th className="px-5 py-3 font-medium">Başlık</th>
              <th className="px-5 py-3 font-medium">Kategori</th>
              <th className="px-5 py-3 font-medium">Tarih</th>
              <th className="px-5 py-3 font-medium">Durum</th>
              <th className="px-5 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="max-w-xs truncate px-5 py-3 font-semibold text-gray-800">
                  {a.title}
                </td>
                <td className="px-5 py-3">
                  <Badge tone={CATEGORY_TONES[a.category] ?? "gray"}>
                    {CATEGORY_LABELS[a.category]}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-gray-500">{a.date}</td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(a)}
                    className="text-xs font-semibold text-primary-600"
                  >
                    {a.isActive !== false ? "Yayında" : "Gizli"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(a)}
                    className="mr-3 text-primary-600"
                  >
                    Düzenle
                  </button>
                  <button type="button" onClick={() => setDelId(a.id)} className="text-red-600">
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        title={editId ? "Duyuruyu Düzenle" : "Yeni Duyuru"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saving}>
              Vazgeç
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Kaydediliyor…" : editId ? "Güncelle" : "Paylaş"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Başlık"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Select
            label="Kategori"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="general">Duyuru</option>
            <option value="price">Fiyat Güncellemesi</option>
            <option value="event">Etkinlik</option>
          </Select>
          <Textarea
            label="Metin"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={5}
            required
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 accent-primary-600"
            />
            Üyelere göster (yayında)
          </label>
        </div>
      </Modal>

      <Modal
        open={!!delId}
        onClose={() => !saving && setDelId(null)}
        title="Duyuruyu sil"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDelId(null)} disabled={saving}>
              Vazgeç
            </Button>
            <Button variant="danger" onClick={remove} disabled={saving}>
              Evet, sil
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">Bu duyuru kalıcı olarak silinecek.</p>
      </Modal>
    </div>
  );
}
