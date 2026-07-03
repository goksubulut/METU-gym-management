// SVG yıldızlı puanlama — dolu/boş durumu fill ile, emoji/karakter kullanılmaz.
const STAR_PATH = "m12 4 2.5 5 5.5.8-4 3.9.9 5.5L12 16.6l-4.9 2.6.9-5.5-4-3.9L9.5 9Z";

export default function StarRating({ value = 0, onChange, size = "md", readOnly }) {
  const dim = { sm: 16, md: 22, lg: 34 }[size];
  return (
    <div className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => onChange && onChange(n)}
            aria-label={`${n} yıldız`}
            className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform ${
              filled ? "text-primary-500" : "text-gray-300"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              width={dim}
              height={dim}
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            >
              <path d={STAR_PATH} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
