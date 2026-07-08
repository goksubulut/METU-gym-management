import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Logo from "../../components/Logo.jsx";
import { Input } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { requestPasswordReset } from "../../api/auth.js";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(e.target.email.value.trim());
      // Bilgi sızmaması için kayıtlı olsun olmasın aynı sonuç gösterilir.
      setSent(true);
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

      <h1 className="text-2xl font-extrabold text-gray-900">Parolanı mı unuttun?</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        Hesabına ait e-postayı gir; sıfırlama bağlantısını gönderelim.
      </p>

      {sent ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
            Eğer bu e-posta sistemde kayıtlıysa, parola sıfırlama bağlantısı gönderildi.
            Gelen kutunu (ve spam klasörünü) kontrol et. Bağlantı 30 dakika geçerlidir.
          </div>
          <Link to="/auth" className="block">
            <Button full size="lg" variant="secondary" type="button">
              Girişe dön
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input name="email" label="E-posta" placeholder="ornek@example.com" type="email" required />
          <Button full size="lg" type="submit" disabled={loading}>
            {loading ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"}
          </Button>
          <Link to="/auth" className="block text-center text-sm font-semibold text-primary-600">
            Girişe dön
          </Link>
        </form>
      )}
    </div>
  );
}
