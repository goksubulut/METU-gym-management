// Apple form stili: hafif dolu yüzey, hairline çerçeve, kırmızı focus ring.
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
        className={`h-12 px-4 text-sm ${FIELD} ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/25" : ""} ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-accent">{error}</span>}
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
