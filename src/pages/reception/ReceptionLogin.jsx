import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast.jsx";
import {
  Eyebrow,
  GlassButton,
  GlassField,
  Panel,
  ReceptionShell,
} from "../../components/reception/ReceptionUI.jsx";
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
    <ReceptionShell className="grid place-items-center p-6">
      <Panel className="w-full max-w-md p-9">
        <div className="flex items-center gap-3.5">
          <img
            src="/images/metumotion.jpg"
            alt="METU Motion"
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/30"
          />
          <div className="leading-none">
            <p className="font-display text-[15px] font-semibold tracking-[-0.01em] text-white">
              METU Motion
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-white/75">
              ODTÜ Spor Merkezi
            </p>
          </div>
        </div>

        <div className="mt-9">
          <Eyebrow>Resepsiyon</Eyebrow>
          <h1 className="mt-3 font-display text-[30px] font-medium leading-none tracking-[-0.03em] text-white">
            Vardiya girişi
          </h1>
          <p className="mt-3 text-[13px] font-medium leading-relaxed text-white/80">
            Check-in masasını açmak için resepsiyon hesabınızla oturum açın.
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <GlassField
            name="email"
            label="E-posta"
            type="email"
            placeholder="reception@metugym.local"
            defaultValue="reception@metugym.local"
            required
          />
          <GlassField
            name="password"
            label="Şifre"
            type="password"
            placeholder="••••••••"
            required
          />
          <GlassButton variant="solid" size="lg" full type="submit" disabled={loading}>
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </GlassButton>
        </form>

        <p className="mt-7 border-t border-white/30 pt-5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">
          Vardiya başında giriş yapmayı unutmayın
        </p>
      </Panel>
    </ReceptionShell>
  );
}
