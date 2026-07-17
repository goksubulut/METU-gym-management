import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Icon from "../../components/Icon.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import { MUSCLE_GROUPS } from "../../mock/machines.js";
import { fetchExercise } from "../../api/catalog.js";

const TYPE_ICON = { FREE: "dumbbell", WARMUP: "flame", COOLDOWN: "snowflake" };
const TYPE_LABEL = { FREE: "Serbest", WARMUP: "Isınma", COOLDOWN: "Soğuma" };

export default function ExerciseDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [e, setE] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetchExercise(id)
      .then(setE)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="pb-6">
        <Skeleton className="h-56 rounded-none" />
        <div className="space-y-3 px-4 py-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-24 rounded-2xl" />
        </div>
      </div>
    );

  if (error || !e)
    return <div className="p-8 text-center text-gray-400">Egzersiz bulunamadı.</div>;

  return (
    <div className="pb-6">
      <div className="hero-sheen relative grid h-56 place-items-center bg-gray-900 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950">
        <button
          onClick={() => nav(-1)}
          className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-700 shadow"
          aria-label="Geri"
        >
          <Icon name="chevronRight" size={17} className="rotate-180" />
        </button>
        {e.videoUrl ? (
          <a
            href={e.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center"
          >
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-primary-600 shadow-glow transition-transform hover:scale-105">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8.5 6.5v11l9-5.5z" />
              </svg>
            </div>
            <span className="mt-2 text-xs font-semibold text-white/70">Kullanım videosu</span>
          </a>
        ) : (
          <Icon name={TYPE_ICON[e.type] ?? "dumbbell"} size={56} strokeWidth={1.2} className="text-white/60" />
        )}
      </div>

      <div className="px-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-gray-900">{e.name}</h1>
            <p className="text-sm text-gray-400">{TYPE_LABEL[e.type] ?? e.type}</p>
          </div>
          {e.duration && (
            <div className="text-right">
              <p className="flex items-center justify-end gap-1 text-lg font-extrabold text-primary-600">
                <Icon name="clock" size={16} /> {e.duration}
              </p>
              <p className="text-[10px] text-gray-400">süre</p>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {e.muscles.map((mus) => (
            <Badge key={mus} tone="primary">
              {MUSCLE_GROUPS.find((x) => x.id === mus)?.label}
            </Badge>
          ))}
        </div>

        {e.instructions && (
          <Card soft className="mt-4 flex gap-3 p-4">
            <Icon name="bulb" size={20} className="mt-0.5 shrink-0 text-primary-600" />
            <div>
              <p className="text-sm font-bold text-gray-900">Nasıl Yapılır</p>
              <p className="text-sm text-gray-600">{e.instructions}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
