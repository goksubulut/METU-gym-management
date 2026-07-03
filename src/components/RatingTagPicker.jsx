/** FR-FB-2 etiket seti — backend feedback.constants.ts ile aynı. */
export const RATING_TAGS = [
  "Rahattı",
  "Kalabalıktı",
  "Arızalıydı",
  "Ayarları bozuktu",
  "Kullanımı zordu",
];

export default function RatingTagPicker({ selected = [], onChange, disabled }) {
  const toggle = (tag) => {
    if (disabled || !onChange) return;
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag],
    );
  };

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-gray-700">
        Deneyim etiketleri <span className="font-normal text-gray-400">(opsiyonel)</span>
      </span>
      <div className="flex flex-wrap gap-2">
        {RATING_TAGS.map((tag) => {
          const active = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              disabled={disabled}
              onClick={() => toggle(tag)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary-200"
              } ${disabled ? "cursor-default opacity-60" : ""}`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
