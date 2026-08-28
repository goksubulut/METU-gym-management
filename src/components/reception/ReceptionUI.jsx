// RESEPSİYON — editoryal cam bileşen seti.
//
// Resepsiyon paneli kendi görsel dilinde yaşar: prizmatik fotoğraf zemini +
// buzlu cam yüzeyler + renksiz palet. Paylaşılan Button/Card/Badge/Input
// bileşenleri token'lara (ve dolayısıyla temaya) bağlı olduğu için burada
// KULLANILMAZ — açık temada koyu metin fotoğrafın üstünde okunmaz olurdu.
// Bunun yerine tema-bağımsız beyaz cam yüzeyler .rc-* sınıflarıyla kurulur
// (tanımlar: src/index.css → "RESEPSİYON — Editorial Glass").

const cx = (...parts) => parts.filter(Boolean).join(" ");

/* --------------------------------------------------------------------- Zemin */

// Sabit fotoğraf zemini + okunurluk perdesi. Her resepsiyon ekranının kökünde
// bir kez render edilir; içerik .rc-layer katmanında üstünde yüzer.
export function ReceptionBackdrop() {
  return (
    <div className="rc-backdrop" aria-hidden="true">
      <img
        src="/images/receptionist-background.jpg"
        alt=""
        draggable="false"
        className="rc-backdrop__img"
      />
      <div className="rc-backdrop__scrim" />
      <div className="rc-backdrop__vignette" />
    </div>
  );
}

// Ekran kabuğu — zemin + içerik katmanı. Layout dışında kalan ekranlar
// (ör. giriş) da bunu kullanır, böylece zemin tüm /reception'da aynıdır.
export function ReceptionShell({ className = "", children }) {
  return (
    <div className={cx("rc-shell", className)}>
      <ReceptionBackdrop />
      <div className="rc-layer">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------- Yüzey */

export function Panel({ quiet, className = "", children, ...props }) {
  return (
    <div
      className={cx("rc-panel", quiet && "rc-panel--quiet", "rounded-[26px]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ Eylemler */

const BTN_VARIANTS = {
  solid: "rc-btn--solid",   // dolu kırmızı — ekranın tek ana eylemi
  tint: "rc-btn--tint",     // kırmızı camlı — listede tekrar eden satır eylemi
  glass: "rc-btn--glass",
  ghost: "rc-btn--ghost",
};

const BTN_SIZES = {
  sm: "h-9 px-4 text-[13px] font-bold",
  md: "h-11 px-5 text-[14px] font-bold",
  lg: "h-[52px] px-7 text-[15px] font-bold tracking-[0.01em]",
};

export function GlassButton({
  variant = "glass",
  size = "md",
  full,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={cx(
        "rc-btn",
        BTN_VARIANTS[variant] ?? BTN_VARIANTS.glass,
        BTN_SIZES[size] ?? BTN_SIZES.md,
        full && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------- Tipografi */

// Editoryal göz kaşı — küçük, geniş harf aralıklı üst başlık.
export function Eyebrow({ className = "", children }) {
  return (
    <p
      className={cx(
        "text-[10px] font-bold uppercase tracking-[0.28em] text-white/60",
        className
      )}
    >
      {children}
    </p>
  );
}

// Rakam bloğu — ince ağırlık + tabular rakam, gazete istatistiği hissi.
export function Figure({ value, label, className = "" }) {
  return (
    <div className={cx("px-6 py-5", className)}>
      <p className="tabular-nums font-display text-[40px] font-normal leading-none tracking-[-0.03em] text-white">
        {value}
      </p>
      <p className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.24em] text-white/60">
        {label}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------- İşaretler */

const STATUS_META = {
  pending: { cls: "rc-chip--neutral", label: "Bekliyor" },
  "checked-in": { cls: "rc-chip--positive", label: "Geldi" },
  "no-show": { cls: "rc-chip--absent", label: "Gelmedi" },
};

export function StatusChip({ status, className = "" }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className={cx("rc-chip", meta.cls, className)}>
      <span className="rc-chip__dot" />
      {meta.label}
    </span>
  );
}

export function Tag({ className = "", children }) {
  return <span className={cx("rc-tag", className)}>{children}</span>;
}

/* --------------------------------------------------------------------- Form */

export function GlassField({ label, hint, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
          {label}
        </span>
      )}
      <input className={cx("rc-field h-12 rounded-[14px] px-4 text-sm font-medium", className)} {...props} />
      {hint && <span className="mt-1.5 block text-xs text-white/60">{hint}</span>}
    </label>
  );
}

/* ------------------------------------------------------------------ Segment */

export function Segmented({ items, value, onChange, className = "", ariaLabel }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cx("rc-seg no-scrollbar", className)}>
      {items.map((item) => {
        const val = item.value ?? item;
        const label = item.label ?? item;
        return (
          <button
            key={val}
            type="button"
            role="tab"
            aria-selected={val === value}
            onClick={() => onChange(val)}
            className="rc-seg__item tabular-nums"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------- Boşluk */

export function Placeholder({ title, description, className = "" }) {
  return (
    <div
      className={cx(
        "rc-empty flex flex-col items-center justify-center rounded-[26px] border border-dashed border-white/15 px-6 py-16 text-center",
        className
      )}
    >
      <span className="mb-4 block h-px w-10 bg-white/25" />
      <p className="text-[15px] font-bold text-white/90">{title}</p>
      {description && <p className="mt-2 max-w-[15rem] text-[13px] font-medium leading-relaxed text-white/60">{description}</p>}
    </div>
  );
}
