import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Logo from "../../components/Logo.jsx";
import { Input } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import AdminAmbientGlow from "../../components/AdminAmbientGlow.jsx";
import { AdminSurfaceContext } from "../../components/adminSurface.js";
import { login } from "../../api/auth.js";
import { homePathForRole } from "../../utils/authUser.js";

export default function AdminLogin() {
  const nav = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setLoading(true);
    try {
      const { user } = await login(form.email.value, form.password.value);
      if (user.role !== "ADMIN") {
        toast("Bu hesabın yönetici yetkisi yok", "error");
        nav(homePathForRole(user.role));
        return;
      }
      nav("/admin");
    } catch (err) {
      toast(err.message ?? "Giriş başarısız", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminSurfaceContext.Provider value={true}>
    <div className="admin-scope relative grid min-h-screen place-items-center p-6">
      <AdminAmbientGlow />

      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="rounded-pill bg-surface-2/70 px-4 py-1.5 text-xs font-medium text-muted backdrop-blur-sm">
            METU GYM Yönetici Erişimi
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-8">
          <div className="mb-6 flex flex-col items-center">
            <Logo size={40} />
            <p className="mt-2 text-sm text-muted">Yönetici Paneli Girişi</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <Input
              name="email"
              label="E-posta"
              type="email"
              placeholder="admin@metugym.local"
              defaultValue="admin@metugym.local"
              required
            />
            <Input name="password" label="Şifre" type="password" placeholder="••••••••" required />
            <Button full size="lg" type="submit" disabled={loading}>
              {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted">
            Yalnızca yetkili personel. Erişim loglanır.
          </p>
        </div>
      </div>
    </div>
    </AdminSurfaceContext.Provider>
  );
}
