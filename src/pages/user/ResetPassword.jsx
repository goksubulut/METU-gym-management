import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Logo from "../../components/Logo.jsx";
import { Input } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { resetPassword } from "../../api/auth.js";

/** Parola kuralı backend ile aynı: en az 8 karakter, harf + rakam. */
const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;

    if (!PASSWORD_RULE.test(password)) {
      toast("Parola en az 8 karakter olmalı ve harf + rakam içermeli", "error");
      return;
    }
    if (password !== confirm) {
      toast("Parolalar eşleşmiyor", "error");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast("Parolan güncellendi, giriş yapabilirsin", "success");
      nav("/auth");
    } catch (err) {
      toast(err.message ?? "Bağlantı geçersiz veya süresi dolmuş", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col justify-center bg-white px-6 py-10">
      <div className="mb-8 flex flex-col items-center">
        <Logo size={40} />
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900">Yeni parola belirle</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        Hesabın için yeni bir parola seç. Bağlantı 30 dakika geçerlidir.
      </p>

      {token ? (
        <form onSubmit={submit} className="space-y-4">
          <Input
            name="password"
            label="Yeni parola"
            placeholder="••••••••"
            type="password"
            hint="En az 8 karakter, harf ve rakam içermeli"
            required
          />
          <Input name="confirm" label="Yeni parola (tekrar)" placeholder="••••••••" type="password" required />
          <Button full size="lg" type="submit" disabled={loading}>
            {loading ? "Güncelleniyor…" : "Parolayı güncelle"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Geçersiz bağlantı. Lütfen parola sıfırlama isteğini yeniden başlat.
          </div>
          <Link to="/forgot-password" className="block">
            <Button full size="lg" variant="secondary" type="button">
              Sıfırlama iste
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
