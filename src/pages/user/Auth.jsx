import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Logo from "../../components/Logo.jsx";
import { Input } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [method, setMethod] = useState("phone");
  const nav = useNavigate();
  const toast = useToast();

  const submit = (e) => {
    e.preventDefault();
    toast(mode === "login" ? "Giriş başarılı" : "Kayıt tamamlandı", "success");
    nav("/home");
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

      <div className="mb-4 flex gap-2">
        {[
          ["phone", "📱 Telefon"],
          ["email", "✉️ E-posta"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setMethod(v)}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${
              method === v
                ? "border-primary-600 bg-primary-50 text-primary-700"
                : "border-gray-200 text-gray-500"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "register" && (
          <Input label="Ad Soyad" placeholder="Adın ve soyadın" required />
        )}
        {method === "phone" ? (
          <Input label="Telefon" placeholder="05XX XXX XX XX" type="tel" required />
        ) : (
          <Input label="E-posta" placeholder="ornek@mail.com" type="email" required />
        )}
        <Input label="Şifre" placeholder="••••••••" type="password" required />

        {mode === "login" && (
          <p className="text-right text-xs font-semibold text-primary-600">
            Şifremi unuttum?
          </p>
        )}

        <Button full size="lg" type="submit">
          {mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" /> veya
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="flex justify-center gap-4">
        <button className="grid h-12 w-12 place-items-center rounded-xl border border-gray-200 text-xl">
          🇬
        </button>
        <button className="grid h-12 w-12 place-items-center rounded-xl border border-gray-200 text-xl">
          f
        </button>
      </div>
    </div>
  );
}
