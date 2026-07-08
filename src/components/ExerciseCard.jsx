import Card from "./Card.jsx";
import Badge from "./Badge.jsx";
import Icon from "./Icon.jsx";
import { MUSCLE_GROUPS } from "../mock/machines.js";

const TYPE_ICON = { FREE: "dumbbell", WARMUP: "flame", COOLDOWN: "snowflake", MACHINE: "dumbbell" };
const TYPE_LABEL = { FREE: "Serbest", WARMUP: "Isınma", COOLDOWN: "Soğuma", MACHINE: "Makine" };

/** Egzersizler sayfasındaki ızgara kartı — detay sayfasına tıklanabilir. */
export function ExerciseGridCard({ exercise, onClick, className = "" }) {
  const muscles = exercise.muscles ?? [];
  return (
    <Card soft onClick={onClick} className={`overflow-hidden ${className}`}>
      <div className="hero-sheen grid h-24 place-items-center bg-gray-900 bg-gradient-to-br from-ink-800 to-ink-950 text-white/85">
        <Icon name={TYPE_ICON[exercise.type] ?? "dumbbell"} size={30} strokeWidth={1.4} />
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-bold text-gray-900">{exercise.name}</p>
        <p className="mb-2 text-[11px] text-gray-400">{TYPE_LABEL[exercise.type] ?? exercise.type}</p>
        <div className="flex flex-wrap gap-1">
          {muscles.slice(0, 2).map((mus) => (
            <Badge key={mus} tone="primary">
              {MUSCLE_GROUPS.find((x) => x.id === mus)?.label}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}

/** Kas haritası / alternatifler listesinde kullanılan satır — tıklanınca egzersiz detayına gider. */
export function ExerciseMatchListCard({ exercise, onClick, className = "" }) {
  return (
    <Card onClick={onClick} className={`flex items-center gap-3 p-3 ${className}`}>
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gray-900 text-white">
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

/** Egzersizler sayfasındaki liste kartı — detay sayfasına tıklanabilir. */
export function ExerciseListCard({ exercise, onClick, className = "" }) {
  return (
    <Card onClick={onClick} className={`flex items-center gap-3 p-3 ${className}`}>
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gray-900 text-white">
        <Icon name={TYPE_ICON[exercise.type] ?? "dumbbell"} size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-gray-900">{exercise.name}</p>
        <p className="truncate text-xs text-gray-400">
          {TYPE_LABEL[exercise.type] ?? exercise.type}
          {exercise.duration ? ` · ${exercise.duration}` : ""}
          {!exercise.duration && exercise.instructions ? ` · ${exercise.instructions}` : ""}
        </p>
      </div>
      <Icon name="chevronRight" size={16} className="shrink-0 text-gray-300" />
    </Card>
  );
}
