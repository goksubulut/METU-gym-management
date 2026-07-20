import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import Badge from "./Badge.jsx";

const TYPE_LABELS = {
  WARMUP: "Isınma",
  COOLDOWN: "Soğuma",
  FREE: "Serbest",
  MACHINE: "Makine egz.",
};

function itemLink(item) {
  if (item.unavailable) return null;
  if (item.itemType === "MACHINE" && item.machineId) return `/machines/${item.machineId}`;
  if (item.itemType === "EXERCISE" && item.exerciseId) return `/exercises/${item.exerciseId}`;
  return null;
}

export default function ProgramItemList({ items, onMoveUp, onMoveDown, onRemove, editable = true }) {
  if (!items.length) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
        Henüz öğe eklenmedi.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => {
        const href = itemLink(item);
        const badge =
          item.itemType === "MACHINE"
            ? "Makine"
            : TYPE_LABELS[item.exerciseType] ?? "Egzersiz";

        return (
          <li
            key={item.id ?? item.key ?? `${item.itemType}-${item.machineId ?? item.exerciseId}`}
            className={`flex items-center gap-2 rounded-xl border px-3 py-3 ${
              item.unavailable ? "border-gray-100 bg-gray-50 opacity-70" : "border-gray-100 bg-white"
            }`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              {href ? (
                <Link to={href} className="truncate text-sm font-semibold text-gray-900 hover:text-primary-700">
                  {item.name}
                </Link>
              ) : (
                <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
              )}
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge tone={item.itemType === "MACHINE" ? "primary" : "gray"}>{badge}</Badge>
                {item.unavailable && <Badge tone="gray">Kullanılamıyor</Badge>}
              </div>
            </div>

            {editable && (
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Yukarı taşı"
                  disabled={index === 0}
                  onClick={() => onMoveUp?.(index)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <Icon name="chevronUp" size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Aşağı taşı"
                  disabled={index === items.length - 1}
                  onClick={() => onMoveDown?.(index)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <Icon name="chevronDown" size={16} />
                </button>
                {onRemove && (
                  <button
                    type="button"
                    aria-label="Kaldır"
                    onClick={() => onRemove(index)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-red-400 hover:bg-red-50"
                  >
                    <Icon name="x" size={16} />
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
