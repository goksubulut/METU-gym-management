import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Logo from "../../components/Logo.jsx";
import { Input } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { login, register } from "../../api/auth.js";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email.value, form.password.value);
        toast("Giriş başarılı", "success");
      } else {
        await register(form.name.value, form.email.value, form.phone?.value, form.password.value);
        toast("Kayıt tamamlandı", "success");
      }
      nav("/home");
    } catch (err) {
      toast(err.message ?? "İşlem başarısız", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col justify-center bg-white px-6 py-10">
      <div className="mb-8 flex flex-col items-center">
        <Logo size={40} />
      </div>

      <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
        {[
          ["login", "Giriş Yap"],
          ["register", "Kayıt Ol"],
        ].map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setMode(v)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              mode === v ? "bg-white text-primary-600 shadow-sm" : "text-gray-500"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900">
        {mode === "login" ? "Tekrar hoş geldin!" : "Aramıza katıl"}
      </h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        {mode === "login"
          ? "Randevu almak için giriş yapman gerekiyor."
          : "Birkaç bilgiyle hesabını oluştur."}
      </p>

      <form onSubmit={submit} className="space-y-4">
        {mode === "register" && (
          <>
            <Input name="name" label="Ad Soyad" placeholder="Adın ve soyadın" required />
            <Input name="phone" label="Telefon (opsiyonel)" placeholder="05XX XXX XX XX" type="tel" />
          </>
        )}
        <Input
          name="email"
          label="E-posta"
          placeholder="gyeduernest@gmail.com"
          type="email"
          defaultValue={mode === "login" ? "gyeduernest@gmail.com" : ""}
          required
        />
        <Input name="password" label="Şifre" placeholder="••••••••" type="password" required />

        {mode === "login" && (
          <p className="text-xs text-gray-400">
            Demo: <b>gyeduernest@gmail.com</b> / <b>user1234</b>
          </p>
        )}

        <Button full size="lg" type="submit" disabled={loading}>
          {loading ? "Bekle…" : mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
        </Button>
      </form>
    </div>
  );
}
