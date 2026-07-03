import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Modal from "../../components/Modal.jsx";
import MyAppointmentsSection from "../../components/MyAppointmentsSection.jsx";
import { Input } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { getAccessToken } from "../../api/client.js";
import {
  changePassword,
  deleteAccount,
  fetchMe,
  logout,
  updateEmail,
} from "../../api/auth.js";
import { getAuthUser, initialsFromName } from "../../utils/authUser.js";

export default function Profile() {
  const nav = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState(getAuthUser);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      nav("/auth");
      return;
    }
    try {
      const user = await fetchMe();
      setProfile(user);
      setEmail(user.email);
    } catch {
      const cached = getAuthUser();
      if (cached) {
        setProfile(cached);
        setEmail(cached.email ?? "");
      }
    }
  }, [nav]);

  useEffect(() => {
    load();
  }, [load]);

  const avatar = initialsFromName(profile?.name);

  const saveEmail = async (e) => {
    e.preventDefault();
    if (!email.trim() || email === profile?.email) return;
    setSavingEmail(true);
    try {
      const user = await updateEmail(email.trim());
      setProfile(user);
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

  const doLogout = async () => {
    setActionLoading(true);
    try {
      await logout();
      toast("Çıkış yapıldı", "dark");
      nav("/auth");
    } catch (err) {
      toast(err.message ?? "Çıkış başarısız", "error");
    } finally {
      setActionLoading(false);
      setLogoutOpen(false);
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

  if (!profile) {
    return null;
  }

  return (
    <div className="px-4 py-5 pb-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 grid h-20 w-20 place-items-center rounded-full bg-primary-100 text-2xl font-extrabold text-primary-700">
          {avatar}
        </div>
        <h1 className="text-xl font-extrabold text-gray-900">{profile.name}</h1>
        <p className="text-sm text-gray-400">{profile.email}</p>
      </div>

      <MyAppointmentsSection className="mb-8" />

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
            disabled={savingEmail || !email.trim() || email === profile.email}
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

      <div className="space-y-3 border-t border-gray-100 pt-6">
        <Button variant="outline" full onClick={() => setLogoutOpen(true)}>
          Çıkış Yap
        </Button>
        <Button variant="danger" full onClick={() => setDeleteOpen(true)}>
          Hesabı Sil
        </Button>
      </div>

      <Modal
        open={logoutOpen}
        onClose={() => !actionLoading && setLogoutOpen(false)}
        title="Çıkış yap"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLogoutOpen(false)} disabled={actionLoading}>
              Vazgeç
            </Button>
            <Button onClick={doLogout} disabled={actionLoading}>
              {actionLoading ? "Çıkılıyor…" : "Evet, çıkış yap"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">Oturumun kapatılacak. Devam etmek istiyor musun?</p>
      </Modal>

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
