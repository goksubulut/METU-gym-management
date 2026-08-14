import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Dumbbell, ChevronRight } from "lucide-react";

const CARD_W = 164;
const CARD_H = 228;

function ExerciseCard({ exercise, offset, isActive, onTap }) {
  const abs = Math.abs(offset);

  const inner = (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface-2 shadow-card">
      <div className="relative flex-1 overflow-hidden bg-surface-3">
        {exercise.imageSrc ? (
          <img
            src={exercise.imageSrc}
            alt={exercise.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Dumbbell size={40} strokeWidth={1.1} className="text-faint" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface-2 to-transparent" />
      </div>

      <div className="shrink-0 px-3 pb-3 pt-2 text-center">
        <p className="line-clamp-2 text-[13px] font-bold leading-snug text-content">
          {exercise.name}
        </p>
        {isActive && (
          <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-accent">
            Detayı Gör
            <ChevronRight size={11} strokeWidth={2.5} />
          </span>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        marginLeft: -(CARD_W / 2),
        width: CARD_W,
        height: CARD_H,
        originX: 0.5,
        originY: 1,
      }}
      animate={{
        rotate: offset * 8,
        scale: 1 - abs * 0.09,
        opacity: abs > 2 ? 0 : 1 - abs * 0.22,
        zIndex: 4 - abs,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
    >
      {isActive ? (
        <Link to={`/exercises/${exercise.id}`} className="block h-full" draggable={false}>
          {inner}
        </Link>
      ) : (
        <button
          type="button"
          className="block h-full w-full"
          onClick={onTap}
          aria-label={exercise.name}
          tabIndex={-1}
        >
          {inner}
        </button>
      )}
    </motion.div>
  );
}

export default function ExerciseCardCarousel({ exercises = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!exercises.length) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <Dumbbell size={32} strokeWidth={1.2} className="mb-2 text-faint" />
        <p className="text-sm text-muted">Bu makine için henüz hareket eklenmemiş.</p>
      </div>
    );
  }

  const showDots = exercises.length <= 8;

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-content">Yapılabilecek Hareketler</h2>
        <span className="text-xs text-muted">
          {activeIndex + 1} / {exercises.length}
        </span>
      </div>

      <div className="relative" style={{ height: CARD_H + 16 }}>
        {exercises.map((exercise, index) => {
          const offset = index - activeIndex;
          if (Math.abs(offset) > 2) return null;
          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              offset={offset}
              isActive={offset === 0}
              onTap={() => setActiveIndex(index)}
            />
          );
        })}
      </div>

      {showDots && exercises.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {exercises.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Hareket ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={[
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIndex ? "w-5 bg-primary-600" : "w-1.5 bg-surface-3",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
