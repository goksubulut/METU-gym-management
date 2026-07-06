import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Logo from "../../components/Logo.jsx";
import { Input } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { login } from "../../api/auth.js";
import { homePathForRole } from "../../utils/authUser.js";

export default function ReceptionLogin() {
  const nav = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setLoading(true);
    try {
      const { user } = await login(form.email.value, form.password.value);
      if (user.role !== "RECEPTION" && user.role !== "ADMIN") {
        toast("Bu hesabın resepsiyon yetkisi yok", "error");
        nav(homePathForRole(user.role));
        return;
      }
      nav("/reception");
    } catch (err) {
      toast(err.message ?? "Giriş başarısız", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-primary-600 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-pop">
        <div className="mb-6 flex flex-col items-center">
          <Logo size={40} />
          <p className="mt-2 text-sm text-gray-400">Resepsiyon / Check-in Girişi</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input
            name="email"
            label="E-posta"
            type="email"
            placeholder="reception@metugym.local"
            defaultValue="reception@metugym.local"
            required
          />
          <Input name="password" label="Şifre" type="password" placeholder="••••••••" required />
          <Button full size="lg" type="submit" disabled={loading}>
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-400">
          Vardiya başında giriş yapmayı unutmayın.
        </p>
      </div>
    </div>
  );
}
