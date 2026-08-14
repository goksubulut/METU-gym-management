// Tone → tema-uyumlu semantik renk. Doluluk için yeşil/kehribar/nötr;
// kırmızı yalnızca marka/uyarı bağlamında.
const TONES = {
  primary: "bg-primary-50 text-accent",
  brand: "bg-primary-50 text-accent",
  gray: "bg-surface-2 text-muted",
  green: "bg-available-soft text-available",
  yellow: "bg-busy-soft text-busy",
  red: "bg-primary-100 text-accent",
  blue: "bg-info-soft text-info",
};

export default function Badge({ tone = "gray", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone] || TONES.gray} ${className}`}
    >
      {children}
    </span>
  );
}
