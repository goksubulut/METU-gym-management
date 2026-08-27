// METU MOTION — Onboarding adım 4/4: "Hesabını Oluştur"
//
// Spatial Glassmorphism + Bento: bulanık renkli sahne üstünde buzlu cam bir
// bento kart, form alanları cam input olarak bu kartın içinde durur. Önceki
// adımların özeti cam çip olarak gösterilir.
//
// Önceki adımlarda toplanan cinsiyet ve doğum tarihi burada hesapla birlikte
// kaydedilir; kayıt başarılıysa kullanıcı zaten giriş yapmış olur.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AmbientBackdrop from "../../../components/AmbientBackdrop.jsx";
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
  const summary = [
    saved.gender,
    saved.birthday && `${saved.birthday.day}.${saved.birthday.month}.${saved.birthday.year}`,
  ].filter(Boolean);

  return (
    <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col overflow-hidden bg-bg">
      <AmbientBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col px-screen pb-8 pt-4">
        <ProgressDots total={ONBOARDING_TOTAL} current={3} />

        <Stagger className="flex flex-1 flex-col" delay={0.12}>
          <StaggerItem className="mt-7">
            <h1 className="text-hero uppercase leading-[1.06] text-content">Hesabını Oluştur</h1>
            <p className="mt-3 max-w-[32ch] text-caption text-white/70">
              Son adım — randevularını ve <span className="text-glow">ilerlemeni</span> kaydedebilmek için.
            </p>
          </StaggerItem>

          {/* Önceki adımların özeti — cam çipler */}
          {summary.length > 0 && (
            <StaggerItem className="mt-4">
              <div className="flex flex-wrap gap-2">
                {summary.map((s) => (
                  <span
                    key={s}
                    className="glass-tile inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption font-medium text-white"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-glow" />
                    {s}
                  </span>
                ))}
              </div>
            </StaggerItem>
          )}

          <form onSubmit={handleSubmit} className="mt-5 flex flex-1 flex-col" noValidate>
            {/* Bento cam kart — form alanları */}
            <StaggerItem>
              <div className="glass-panel space-y-3.5 rounded-[28px] p-5">
                {FIELDS.map((f) => {
                  const isPassword = f.type === "password";
                  const err = errors[f.name];
                  return (
                    <label key={f.name} className="block">
                      <span className="mb-1.5 block text-caption font-medium text-white/70">
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
                          className={`glass-input h-12 w-full rounded-input px-4 ${
                            isPassword ? "pr-12" : ""
                          } text-body text-white outline-none ${err ? "has-error" : ""}`}
                        />
                        {isPassword && (
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
                          >
                            <Icon name={showPassword ? "eye-off" : "eye"} size={17} />
                          </button>
                        )}
                      </div>
                      {err && (
                        <span role="alert" className="mt-1.5 flex items-start gap-1.5 text-caption text-glow">
                          <Icon name="alert" size={14} strokeWidth={2.2} className="mt-px shrink-0" />
                          <span>{err}</span>
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </StaggerItem>

            <div className="mt-auto pt-8">
              <PillButton type="submit" disabled={loading} revealDelay={0.3}>
                {loading ? "Oluşturuluyor…" : "Hesabı Oluştur"}
              </PillButton>
              <p className="mt-4 text-center text-caption text-white/60">
                Zaten hesabın var mı?{" "}
                <button
                  type="button"
                  onClick={() => nav("/auth")}
                  className="font-semibold text-white underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  Giriş Yap
                </button>
              </p>
            </div>
          </form>
        </Stagger>
      </div>
    </div>
  );
}
