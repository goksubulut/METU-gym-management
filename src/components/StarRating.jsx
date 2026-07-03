export default function StarRating({ value = 0, onChange, size = "md", readOnly }) {
  const dim = { sm: "text-sm", md: "text-lg", lg: "text-3xl" }[size];
  return (
    <div className={`inline-flex gap-0.5 ${dim}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(n)}
          className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform ${
            n <= Math.round(value) ? "text-primary-500" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
