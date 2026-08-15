import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Modal from "../../components/Modal.jsx";
import Icon from "../../components/Icon.jsx";
import AppointmentHeatmap from "../../components/AppointmentHeatmap.jsx";
import { useToast } from "../../components/Toast.jsx";
import { getAccessToken } from "../../api/client.js";
import { fetchMe, logout } from "../../api/auth.js";
import { getAuthUser, initialsFromName } from "../../utils/authUser.js";

export default function Profile() {
  const nav = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState(getAuthUser);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      nav("/auth");
      return;
    }
    try {
      const user = await fetchMe();
      setProfile(user);
    } catch {
      const cached = getAuthUser();
      if (cached) setProfile(cached);
    }
  }, [nav]);

  useEffect(() => {
    load();
  }, [load]);

  const avatar = initialsFromName(profile?.name);

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

  if (!profile) return null;

  return (
    <div className="px-4 py-5 pb-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 grid h-20 w-20 place-items-center rounded-full bg-primary-100 text-2xl font-extrabold text-accent">
          {avatar}
        </div>
        <h1 className="text-xl font-extrabold text-gray-900">{profile.name}</h1>
        <p className="text-sm text-gray-400">{profile.email}</p>
      </div>

      <AppointmentHeatmap />

      <div className="mb-4 space-y-3">
        <Card
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => nav("/appointments")}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-accent">
              <Icon name="calendar" size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Randevularım</p>
              <p className="text-xs text-gray-400">Geçmiş ve yaklaşan randevular</p>
            </div>
          </div>
          <Icon name="chevronRight" size={18} className="text-gray-300" />
        </Card>

        <Card
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => nav("/account-settings")}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-accent">
              <Icon name="settings" size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Hesap Ayarları</p>
              <p className="text-xs text-gray-400">E-posta, parola ve hesap yönetimi</p>
            </div>
          </div>
          <Icon name="chevronRight" size={18} className="text-gray-300" />
        </Card>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <Button variant="outline" full onClick={() => setLogoutOpen(true)}>
          Çıkış Yap
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
    </div>
  );
}
