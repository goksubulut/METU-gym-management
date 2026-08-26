// METU MOTION — Onboarding adım 4/4: "Hesabını Oluştur"
//
// Önceki adımlarda toplanan cinsiyet ve doğum tarihi burada hesapla birlikte
// kaydedilir; kayıt başarılıysa kullanıcı zaten giriş yapmış olur (register()
// access + refresh token döndürür), uygulama doğrudan açılır.
//
// Splash'teki "Giriş Yap" ise bu akışı atlayıp /auth'a gider.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressDots from "../../../components/ProgressDots.jsx";
import PillButton from "../../../components/PillButton.jsx";
import Icon from "../../../components/Icon.jsx";
import { Stagger, StaggerItem } from "../../../components/motion/Stagger.jsx";
import { useToast } from "../../../components/Toast.jsx";
import { register } from "../../../api/auth.js";
import { homePathForRole } from "../../../utils/authUser.js";
import { onboardingToRegisterPayload } from "../../../utils/profile.js";
import {
  readOnboarding, saveOnboarding, completeOnboarding, ONBOARDING_TOTAL,
} from "../../../utils/onboarding.js";

const FIELDS = [
  { name: "name", label: "Ad Soyad", type: "text", autoComplete: "name", placeholder: "Adın ve soyadın" },
  { name: "email", label: "E-posta", type: "email", autoComplete: "email", placeholder: "ornek@metu.edu.tr" },
  { name: "phone", label: "Telefon", type: "tel", autoComplete: "tel", placeholder: "05XX XXX XX XX" },
  { name: "password", label: "Parola", type: "password", autoComplete: "new-password", placeholder: "En az 8 karakter" },
];

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Ad soyad zorunludur";
  if (!v.email.trim()) e.email = "E-posta zorunludur";
  else if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Geçerli bir e-posta girin";
  if (!v.phone.trim()) e.phone = "Telefon zorunludur";
  if (!v.password) e.password = "Parola zorunludur";
  else if (v.password.length < 8) e.password = "Parola en az 8 karakter olmalı";
  return e;
}

export default function Register() {
  const nav = useNavigate();
  const toast = useToast();
  const [values, setValues] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const { user } = await register(
        values.name,
        values.email,
        values.phone,
        values.password,
        onboardingToRegisterPayload(readOnboarding()),
      );
      // Onboarding cevaplarını hesapla ilişkilendir
      saveOnboarding({ registeredEmail: values.email });
      completeOnboarding();
      toast("Hoş geldin! Hesabın hazır.", "success");
      nav(homePathForRole(user.role), { replace: true });
    } catch (err) {
      toast(err.message ?? "Kayıt başarısız", "error");
    } finally {
      setLoading(false);
    }
  };

  const saved = readOnboarding();

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-bg px-screen pb-8 pt-4">
      <ProgressDots total={ONBOARDING_TOTAL} current={3} />

      <Stagger className="flex flex-1 flex-col" delay={0.15}>
        <StaggerItem className="mt-6">
          <h1 className="text-h1 text-content">Hesabını Oluştur</h1>
          <p className="mt-2 text-caption text-muted">
            Son adım — randevularını ve <span className="text-glow">ilerlemeni</span> kaydedebilmek için.
          </p>
        </StaggerItem>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col" noValidate>
          <div className="space-y-3.5">
            {FIELDS.map((f, i) => {
              const isPassword = f.type === "password";
              const err = errors[f.name];
              return (
                <StaggerItem key={f.name}>
                  <label className="block">
                    <span className="mb-1.5 block text-caption font-medium text-muted">
                      {f.label}
                    </span>
                    <div className="relative">
                      <input
                        type={isPassword && showPassword ? "text" : f.type}
                        value={values[f.name]}
                        onChange={(e) => set(f.name, e.target.value)}
                        autoComplete={f.autoComplete}
                        placeholder={f.placeholder}
                        aria-invalid={err ? "true" : undefined}
                        className={`h-12 w-full rounded-input border bg-surface px-4 ${isPassword ? "pr-12" : ""} text-body text-content outline-none transition-[border-color,box-shadow] duration-instant ease-standard placeholder:text-faint focus:ring-2 ${
                          err
                            ? "border-primary-600 focus:border-primary-600 focus:ring-primary-600/30"
                            : "border-subtle focus:border-primary-500 focus:ring-primary-500/25"
                        }`}
                      />
                      {isPassword && (
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-faint transition-colors hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
                        >
                          <Icon name={showPassword ? "eye-off" : "eye"} size={17} />
                        </button>
                      )}
                    </div>
                    {/* §1.1 — hata sadece renkle gösterilmez: ikon + metin */}
                    {err && (
                      <span role="alert" className="mt-1.5 flex items-start gap-1.5 text-caption text-accent">
                        <Icon name="alert" size={14} strokeWidth={2.2} className="mt-px shrink-0" />
                        <span>{err}</span>
                      </span>
                    )}
                  </label>
                </StaggerItem>
              );
            })}
          </div>

          <div className="mt-auto pt-8">
            {/* Önceki adımların özeti — kullanıcı ne kaydedildiğini görsün */}
            {(saved.gender || saved.birthday) && (
              <p className="mb-3 text-center text-caption text-faint">
                {[saved.gender, saved.birthday && `${saved.birthday.day}.${saved.birthday.month}.${saved.birthday.year}`]
                  .filter(Boolean)
                  .join(" · ")}{" "}
                bilgilerinle kaydedilecek
              </p>
            )}
            <PillButton type="submit" disabled={loading} revealDelay={0.4}>
              {loading ? "Oluşturuluyor…" : "Hesabı Oluştur"}
            </PillButton>
            <p className="mt-4 text-center text-caption text-muted">
              Zaten hesabın var mı?{" "}
              <button
                type="button"
                onClick={() => nav("/auth")}
                className="font-semibold text-content underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
              >
                Giriş Yap
              </button>
            </p>
          </div>
        </form>
      </Stagger>
    </div>
  );
}
