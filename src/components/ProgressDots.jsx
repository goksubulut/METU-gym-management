// METU MOTION §2.5 (Progress Dots) + §4.7 (adım güncellemesi)
//
// Onboarding'de kaçıncı adımda olunduğunu gösterir. Aktif adım "uzamış" bir
// çubuktur (18×6px), geçilmiş adımlar dolu kırmızı nokta, gelmemişler gri nokta.
// Konum (§2.5): sol üst, safe-area + 16px aşağıda, 24px soldan.
//
// Not: renk ve genişlik geçişleri SAF CSS transition ile yapılır. Framer Motion
// `rgb(var(--token))` biçimindeki değerleri interpolate edemez — renk animasyonu
// bu yüzden Tailwind sınıfı + transition üzerinden gider.

export default function ProgressDots({ total = 4, current = 0, className = "" }) {
  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-label={`Adım ${current + 1} / ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isCurrent = i === current;
        const isDone = i < current;
        return (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ease-standard ${
              isCurrent ? "w-[18px]" : "w-1.5"
            } ${isCurrent || isDone ? "bg-primary-600" : "bg-subtle"}`}
          />
        );
      })}
    </div>
  );
}
