import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";

// ─── Icon-wrapped input ───────────────────────────────────────────────────────
function IconInput({ label, id, icon: Icon, suffix, error, className = "", ...props }) {
  const inputId = id || props.name;
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
            <Icon size={16} strokeWidth={2} />
          </span>
        )}
        <input
          id={inputId}
          className={[
            "w-full rounded-xl border bg-zinc-50 py-3 text-sm text-zinc-900 outline-none",
            "transition-[border-color,box-shadow] placeholder:text-zinc-400",
            "focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
            Icon ? "pl-10" : "pl-4",
            suffix ? "pr-12" : "pr-4",
            error ? "border-red-400 bg-red-50/40" : "border-zinc-200",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GymAuthScreen({
  backgroundImageSrc,
  onLogin,
  onRegister,
  onForgotPassword,
  loading = false,
}) {
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
    if (mode === "login") {
      onLogin?.({ email, password });
    } else {
      onRegister?.({ name, phone: phone.trim() || undefined, email, password });
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setShowPassword(false);
  };

  return (
    /*
     * Outer: fills the entire browser window.
     * On desktop this area is visible as a neutral background around the phone.
     */
    <div className="flex min-h-screen bg-zinc-200">
      {/*
       * Phone container: 430 px wide on desktop (matches the rest of the app),
       * full-width on mobile. Uses relative positioning so absolute children
       * are contained — avoiding the full-viewport bleed of position:fixed.
       */}
      <div
        className="relative mx-auto w-full max-w-[430px] overflow-hidden bg-white shadow-2xl"
        style={{ height: "100svh" }}
      >
        {/* ── ODTÜ SPOR logo — upper portion, never moves ── */}
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-center px-10"
          style={{ height: "23%" }}
          aria-hidden="true"
        >
          <img
            src={backgroundImageSrc}
            alt="ODTÜ SPOR"
            draggable={false}
            className="h-full w-full object-contain object-center"
            style={{ maxWidth: "min(260px, 75%)" }}
          />
        </div>

        {/* ── Authentication panel — slides up from below ── */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 flex flex-col overflow-hidden rounded-t-[2rem] bg-white"
          style={{
            height: "77%",
            boxShadow: "0 -6px 48px rgba(0,0,0,0.10), 0 -1px 0 rgba(0,0,0,0.06)",
          }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 78, damping: 21, mass: 1 }}
        >
          {/* Drag handle */}
          <div aria-hidden="true" className="mx-auto mt-3 h-1 w-10 flex-shrink-0 rounded-full bg-zinc-200" />

          {/* Scrollable form area */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-10 pt-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Heading */}
                <h1
                  className="text-[1.625rem] font-extrabold leading-tight text-zinc-900"
                  style={{ letterSpacing: "-0.025em" }}
                >
                  {mode === "login" ? "Tekrar hoş geldin!" : "Aramıza katıl"}
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                  {mode === "login"
                    ? "Randevu almak için giriş yapman gerekiyor."
                    : "Birkaç bilgiyle hesabını oluştur."}
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
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
                    placeholder="gyeduernest@gmail.com"
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
                        className="rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                      >
                        {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                      </button>
                    }
                  />

                  {mode === "login" && (
                    <div className="flex items-center justify-between pt-0.5">
                      <p className="text-xs text-zinc-400">
                        Demo:{" "}
                        <span className="text-zinc-500">gyeduernest@gmail.com</span>
                        {" / "}
                        <span className="text-zinc-500">user1234</span>
                      </p>
                      <button
                        type="button"
                        onClick={onForgotPassword}
                        className="rounded text-xs font-semibold text-red-700 transition-colors hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                      >
                        Şifremi unuttum?
                      </button>
                    </div>
                  )}

                  {/* Primary CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-[background-color,transform,box-shadow] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: "#A6192E",
                      boxShadow: "0 4px 20px rgba(166,25,46,0.28)",
                    }}
                  >
                    {loading
                      ? "Lütfen bekle…"
                      : mode === "login"
                      ? "Giriş Yap"
                      : "Hesap Oluştur"}
                  </button>
                </form>

                {/* Mode switch */}
                <p className="mt-6 text-center text-sm text-zinc-500">
                  {mode === "login" ? (
                    <>
                      Hesabın yok mu?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("register")}
                        className="rounded font-semibold text-[#A6192E] transition-colors hover:text-[#8C1526] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
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
                        className="rounded font-semibold text-[#A6192E] transition-colors hover:text-[#8C1526] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                      >
                        Giriş Yap
                      </button>
                    </>
                  )}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
