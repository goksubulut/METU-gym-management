import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Modal from "../../components/Modal.jsx";
import Icon from "../../components/Icon.jsx";
import { Input } from "../../components/Input.jsx";
import MenuSelect from "../../components/MenuSelect.jsx";
import { useToast } from "../../components/Toast.jsx";
import {
  changePassword,
  deleteAccount,
  fetchMe,
  logout,
  updateEmail,
  updateProfile,
} from "../../api/auth.js";
import { getAccessToken } from "../../api/client.js";
import { getAuthUser } from "../../utils/authUser.js";
import {
  ageFromBirthDate,
  daysInMonth,
  GENDER_LABELS,
  joinBirthDate,
  splitBirthDate,
} from "../../utils/profile.js";

const MONTHS = [
  { value: "01", label: "Ocak" },
  { value: "02", label: "Şubat" },
  { value: "03", label: "Mart" },
  { value: "04", label: "Nisan" },
  { value: "05", label: "Mayıs" },
  { value: "06", label: "Haziran" },
  { value: "07", label: "Temmuz" },
  { value: "08", label: "Ağustos" },
  { value: "09", label: "Eylül" },
  { value: "10", label: "Ekim" },
  { value: "11", label: "Kasım" },
  { value: "12", label: "Aralık" },
];

const THIS_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: THIS_YEAR - 12 - 1920 + 1 }, (_, i) => {
  const y = String(THIS_YEAR - 12 - i);
  return { value: y, label: y };
});

const GENDER_OPTIONS = [
  { value: "", label: "Seçilmedi" },
  ...Object.entries(GENDER_LABELS).map(([value, label]) => ({ value, label })),
];

export default function AccountSettings() {
  const nav = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState(getAuthUser);
  const [email, setEmail] = useState(profile?.email ?? "");
  const [gender, setGender] = useState(profile?.gender ?? "");
  // Doğum tarihi parçaları ayrı tutulur; birleşik ISO değeri yalnızca üçü de
  // dolunca üretilir. (Aksi halde kısmi seçimler kaybolur ve tarih girilemez.)
  const [birthParts, setBirthParts] = useState(() => splitBirthDate(profile?.birthDate));
  const [heightCm, setHeightCm] = useState(profile?.heightCm != null ? String(profile.heightCm) : "");
  const [weightKg, setWeightKg] = useState(profile?.weightKg != null ? String(profile.weightKg) : "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const applyUser = (user) => {
    setProfile(user);
    setEmail(user.email ?? "");
    setGender(user.gender ?? "");
    setBirthParts(splitBirthDate(user.birthDate));
    setHeightCm(user.heightCm != null ? String(user.heightCm) : "");
    setWeightKg(user.weightKg != null ? String(user.weightKg) : "");
  };

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      nav("/auth");
      return;
    }
    try {
      applyUser(await fetchMe());
    } catch {
      const cached = getAuthUser();
      if (cached) applyUser(cached);
    }
  }, [nav]);

  useEffect(() => {
    load();
  }, [load]);

  const savePersonal = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const birthDate = joinBirthDate(birthParts.year, birthParts.month, birthParts.day);
      const payload = {
        gender: gender || undefined,
        birthDate: birthDate || undefined,
        ...(heightCm !== "" ? { heightCm: Number(heightCm) } : {}),
        ...(weightKg !== "" ? { weightKg: Number(weightKg) } : {}),
      };
      applyUser(await updateProfile(payload));
      toast("Kişisel bilgiler güncellendi", "success");
    } catch (err) {
      toast(err.message ?? "Bilgiler güncellenemedi", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveEmail = async (e) => {
    e.preventDefault();
    if (!email.trim() || email === profile?.email) return;
    setSavingEmail(true);
    try {
      applyUser(await updateEmail(email.trim()));
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

  const parts = birthParts;
  const maxDay = daysInMonth(parts.month || 1, parts.year || THIS_YEAR);
  const dayOptions = Array.from({ length: maxDay }, (_, i) => {
    const d = String(i + 1).padStart(2, "0");
    return { value: d, label: String(i + 1) };
  });
  const age = ageFromBirthDate(joinBirthDate(parts.year, parts.month, parts.day));

  const setBirthPart = (part, value) => {
    setBirthParts((prev) => {
      const next = { ...prev, [part]: value };
      const cap = daysInMonth(next.month || 1, next.year || THIS_YEAR);
      if (next.day && Number(next.day) > cap) next.day = String(cap).padStart(2, "0");
      return next;
    });
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
        <h2 className="mb-3 text-sm font-bold text-gray-900">Kişisel bilgiler</h2>
        <form onSubmit={savePersonal} className="space-y-3">
          <MenuSelect
            label="Cinsiyet"
            value={gender}
            onChange={setGender}
            options={GENDER_OPTIONS}
            placeholder="Seçilmedi"
          />
          <div>
            <span className="mb-1.5 block text-sm font-medium text-content">Doğum tarihi</span>
            <div className="grid grid-cols-3 gap-2">
              <MenuSelect
                value={parts.day}
                onChange={(v) => setBirthPart("day", v)}
                options={dayOptions}
                placeholder="Gün"
              />
              <MenuSelect
                value={parts.month}
                onChange={(v) => setBirthPart("month", v)}
                options={MONTHS}
                placeholder="Ay"
              />
              <MenuSelect
                value={parts.year}
                onChange={(v) => setBirthPart("year", v)}
                options={YEAR_OPTIONS}
                placeholder="Yıl"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              {age != null ? `Yaş: ${age}` : "Yaş doğum tarihinden hesaplanır"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Boy (cm)"
              type="number"
              inputMode="numeric"
              min={100}
              max={250}
              step={1}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="178"
            />
            <Input
              label="Kilo (kg)"
              type="number"
              inputMode="decimal"
              min={30}
              max={300}
              step={0.1}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="72.5"
            />
          </div>
          <Button type="submit" size="sm" full disabled={savingProfile}>
            {savingProfile ? "Kaydediliyor…" : "Bilgileri Kaydet"}
          </Button>
        </form>
      </Card>

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
