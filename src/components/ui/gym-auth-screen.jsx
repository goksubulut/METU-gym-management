// METU MOTION — Giriş / Kayıt ekranı.
//
// Spatial Glassmorphism: onboarding Register ekranıyla birebir uyumlu. Arkada
// kısılmış spatial aura, üstünde buzlu cam bir bento kart; alanlar cam input.
// Hem giriş (login) hem kayıt (register) modunu barındırır.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import Icon from "../Icon.jsx";
import AmbientBackdrop from "../AmbientBackdrop.jsx";
import PillButton from "../PillButton.jsx";

// ─── Cam input (ikonlu) ───────────────────────────────────────────────────────
function IconInput({ label, id, icon: LeadIcon, suffix, error, className = "", ...props }) {
  const inputId = id || props.name;
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-caption font-medium text-white/70">
          {label}
        </label>
      )}
      <div className="relative">
        {LeadIcon && (
          <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45">
            <LeadIcon size={16} strokeWidth={2} />
          </span>
        )}
        <input
          id={inputId}
          className={[
            "glass-input h-12 w-full rounded-input text-body text-white outline-none",
            LeadIcon ? "pl-10" : "pl-4",
            suffix ? "pr-12" : "pr-4",
            error ? "has-error" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>}
      </div>
      {/* §1.1 — hata sadece renkle gösterilmez: ikon + metin */}
      {error && (
        <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-caption text-glow">
          <Icon name="alert" size={14} strokeWidth={2.2} className="mt-px shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function GymAuthScreen({ onLogin, onRegister, onForgotPassword, loading = false }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validate = () => {
    const errs = {};
    if (mode === "register" && !name.trim()) errs.name = "Ad soyad gerekli";
    if (!email.trim()) errs.email = "E-posta gerekli";
    else if (!isValidEmail(email)) errs.email = "Geçerli bir e-posta girin";
    if (!password) errs.password = "Şifre gerekli";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (mode === "login") onLogin?.({ email, password });
    else onRegister?.({ name, phone: phone.trim() || undefined, email, password });
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setShowPassword(false);
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col overflow-hidden bg-bg">
      <AmbientBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col px-screen pb-8 pt-10">
        {/* Marka bloğu */}
        <div className="text-center">
          <h1 className="text-hero uppercase leading-none text-content">
            METU <span className="text-primary-400">Motion</span>
          </h1>
          <p className="mt-2 text-caption text-white/60">ODTÜ Spor Merkezi</p>
        </div>

        {/* Cam form kartı */}
        <div className="mt-8 flex flex-1 flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              className="glass-panel rounded-[28px] p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-h1 text-white">
                {mode === "login" ? "Tekrar hoş geldin!" : "Aramıza katıl"}
              </h2>
              <p className="mt-1.5 text-caption leading-relaxed text-white/70">
                {mode === "login"
                  ? "Randevu almak için giriş yapman gerekiyor."
                  : "Birkaç bilgiyle hesabını oluştur."}
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-3.5">
                {mode === "register" && (
                  <>
                    <IconInput
                      label="Ad Soyad"
                      name="name"
                      icon={User}
                      type="text"
                      placeholder="Adın ve soyadın"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      error={errors.name}
                      required
                    />
                    <IconInput
                      label="Telefon (opsiyonel)"
                      name="phone"
                      icon={Phone}
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </>
                )}

                <IconInput
                  label="E-posta"
                  name="email"
                  icon={Mail}
                  type="email"
                  placeholder="ornek@gmail.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />

                <IconInput
                  label="Şifre"
                  name="password"
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                      className="rounded p-0.5 text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50"
                    >
                      {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                    </button>
                  }
                />

                {mode === "login" && (
                  <div className="flex items-center justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="rounded text-caption font-semibold text-glow transition-colors hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/40"
                    >
                      Şifremi unuttum?
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <PillButton type="submit" disabled={loading} reveal={false}>
                    {loading
                      ? "Lütfen bekle…"
                      : mode === "login"
                      ? "Giriş Yap"
                      : "Hesap Oluştur"}
                  </PillButton>
                </div>
              </form>

              {/* Mod değiştir */}
              <p className="mt-5 text-center text-caption text-white/60">
                {mode === "login" ? (
                  <>
                    Hesabın yok mu?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="rounded font-semibold text-white underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50"
                    >
                      Kayıt Ol
                    </button>
                  </>
                ) : (
                  <>
                    Zaten hesabın var mı?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="rounded font-semibold text-white underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50"
                    >
                      Giriş Yap
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
