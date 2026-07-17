import Icon from "./Icon.jsx";

export default function Pagination({ page, totalPages, total, pageSize, onPage }) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
      <span className="text-xs text-gray-400">
        {from}–{to} / {total} sonuç
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="chevronLeft" size={15} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, idx) =>
            p === "…" ? (
              <span key={`sep-${idx}`} className="px-1 text-xs text-gray-300">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPage(p)}
                className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-semibold transition-colors ${
                  p === page
                    ? "bg-primary-600 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {p}
              </button>
            )
          )}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="chevronRight" size={15} />
        </button>
      </div>
    </div>
  );
}
