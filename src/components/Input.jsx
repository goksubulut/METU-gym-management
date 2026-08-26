// Apple form stili: hafif dolu yüzey, hairline çerçeve, kırmızı focus ring.
//
// METU MOTION §1.1 — HATA STATE'İ: marka rengi zaten kırmızı olduğu için
// validasyon hataları SADECE renkle gösterilemez. Her hata mesajı bir uyarı
// ikonu VE açık metin taşır; ayrıca aria-invalid ile ekran okuyucuya bildirilir.
import Icon from "./Icon.jsx";
const FIELD =
  "w-full rounded-xl border border-line bg-surface-2 text-content outline-none transition-[border-color,box-shadow] duration-150 ease-smooth placeholder:text-faint focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25";

export function Input({ label, hint, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-content">
          {label}
        </span>
      )}
      <input
        className={`h-12 px-4 text-sm ${FIELD} ${error ? "border-primary-600 focus:border-primary-600 focus:ring-primary-600/30" : ""} ${className}`}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
      {error && (
        <span className="mt-1.5 flex items-start gap-1.5 text-xs text-accent">
          <Icon name="alert" size={14} strokeWidth={2.2} className="mt-px shrink-0" />
          <span>{error}</span>
        </span>
      )}
      {hint && !error && (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      )}
    </label>
  );
}

export function Textarea({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-content">
          {label}
        </span>
      )}
      <textarea
        rows={4}
        className={`px-4 py-3 text-sm ${FIELD} ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-content">
          {label}
        </span>
      )}
      <select
        className={`h-12 px-3 text-sm ${FIELD} ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
