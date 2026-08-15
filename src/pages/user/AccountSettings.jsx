import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Modal from "../../components/Modal.jsx";
import Icon from "../../components/Icon.jsx";
import { Input } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import {
  changePassword,
  deleteAccount,
  logout,
  updateEmail,
} from "../../api/auth.js";
import { getAuthUser } from "../../utils/authUser.js";

export default function AccountSettings() {
  const nav = useNavigate();
  const toast = useToast();
  const [profile] = useState(getAuthUser);
  const [email, setEmail] = useState(profile?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const saveEmail = async (e) => {
    e.preventDefault();
    if (!email.trim() || email === profile?.email) return;
    setSavingEmail(true);
    try {
      await updateEmail(email.trim());
      toast("E-posta güncellendi", "success");
    } catch (err) {
      toast(err.message ?? "E-posta güncellenemedi", "error");
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("Yeni parolalar eşleşmiyor", "error");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast("Parola güncellendi. Güvenlik için yeniden giriş yapın.", "success");
      await logout();
      nav("/auth");
    } catch (err) {
      toast(err.message ?? "Parola güncellenemedi", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const doDelete = async () => {
    setActionLoading(true);
    try {
      await deleteAccount();
      toast("Hesabın silindi", "dark");
      nav("/auth");
    } catch (err) {
      toast(err.message ?? "Hesap silinemedi", "error");
    } finally {
      setActionLoading(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="px-4 py-5 pb-8">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => nav(-1)}
          className="grid h-9 w-9 place-items-center rounded-xl text-gray-500 hover:bg-surface-2 active:scale-95 transition-transform"
        >
          <Icon name="chevronLeft" size={20} />
        </button>
        <h1 className="text-xl font-extrabold text-gray-900">Hesap Ayarları</h1>
      </div>

      <Card className="mb-4 p-4">
        <h2 className="mb-3 text-sm font-bold text-gray-900">E-posta</h2>
        <form onSubmit={saveEmail} className="space-y-3">
          <Input
            label="E-posta adresi"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            size="sm"
            full
            disabled={savingEmail || !email.trim() || email === profile?.email}
          >
            {savingEmail ? "Kaydediliyor…" : "E-postayı Güncelle"}
          </Button>
        </form>
      </Card>

      <Card className="mb-4 p-4">
        <h2 className="mb-3 text-sm font-bold text-gray-900">Parola</h2>
        <form onSubmit={savePassword} className="space-y-3">
          <Input
            label="Mevcut parola"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Input
            label="Yeni parola"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Input
            label="Yeni parola (tekrar)"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Button type="submit" size="sm" full disabled={savingPassword}>
            {savingPassword ? "Güncelleniyor…" : "Parolayı Güncelle"}
          </Button>
        </form>
      </Card>

      <div className="border-t border-gray-100 pt-6">
        <Button variant="danger" full onClick={() => setDeleteOpen(true)}>
          Hesabı Sil
        </Button>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => !actionLoading && setDeleteOpen(false)}
        title="Hesabı sil"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={actionLoading}>
              Vazgeç
            </Button>
            <Button variant="danger" onClick={doDelete} disabled={actionLoading}>
              {actionLoading ? "Siliniyor…" : "Evet, hesabımı sil"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Bu işlem geri alınamaz. Randevuların, puanların ve bildirimlerin kalıcı olarak silinecek.
        </p>
      </Modal>
    </div>
  );
}
