import Card from "./Card.jsx";
import Icon from "./Icon.jsx";

const TYPE_ICON = { FREE: "dumbbell", WARMUP: "flame", COOLDOWN: "snowflake", MACHINE: "dumbbell" };

/** Kas haritası / alternatifler listesinde kullanılan satır — tıklanınca egzersiz detayına gider. */
export function ExerciseMatchListCard({ exercise, onClick, className = "" }) {
  return (
    <Card onClick={onClick} className={`flex items-center gap-3 p-3 ${className}`}>
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-900 text-white">
        <Icon name={TYPE_ICON[exercise.type] ?? "dumbbell"} size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-gray-900">{exercise.name}</p>
        <p className="truncate text-xs text-gray-400">{exercise.instructions}</p>
      </div>
      <Icon name="chevronRight" size={16} className="shrink-0 text-gray-300" />
    </Card>
  );
}
