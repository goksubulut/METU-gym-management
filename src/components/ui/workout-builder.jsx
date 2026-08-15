import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Dumbbell, X } from "lucide-react";
import { MUSCLE_GROUPS } from "../../mock/machines.js";

function ProgramItem({ machine, index, total, onMoveUp, onMoveDown, onRemove }) {
  const groupLabel = machine.muscles?.[0]
    ? (MUSCLE_GROUPS.find((g) => g.id === machine.muscles[0])?.label ?? "")
    : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-2.5 rounded-xl bg-surface-3 px-3 py-2.5"
    >
      {/* Order number */}
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-600/15 text-[11px] font-black tabular-nums text-accent">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Machine info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-content">{machine.name}</p>
        {groupLabel && <p className="text-xs text-muted">{groupLabel}</p>}
      </div>

      {/* Reorder + remove controls */}
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          disabled={index === 0}
          onClick={onMoveUp}
          aria-label="Yukarı taşı"
          className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors active:bg-surface-2 disabled:opacity-20"
        >
          <ChevronUp size={16} strokeWidth={2} />
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={onMoveDown}
          aria-label="Aşağı taşı"
          className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors active:bg-surface-2 disabled:opacity-20"
        >
          <ChevronDown size={16} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Kaldır"
          className="grid h-9 w-9 place-items-center rounded-lg text-primary-600 transition-colors active:bg-primary-50"
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
}

export default function WorkoutBuilder({ items, onReorder, onRemove }) {
  const move = (from, to) => {
    const next = [...items];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    onReorder(next);
  };

  return (
    <div className="overflow-hidden rounded-2xl shadow-card">
      {/* Bucket header */}
      <div className="bg-ink-900 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              Antrenman Planın
            </p>
            <p className="mt-0.5 text-base font-bold text-white">
              {items.length === 0
                ? "Henüz makine eklenmedi"
                : `${items.length} makine seçildi`}
            </p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
            <Dumbbell size={20} strokeWidth={1.5} className="text-white/60" />
          </div>
        </div>
      </div>

      {/* Items area */}
      <div className="bg-surface-2 p-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Dumbbell size={28} strokeWidth={1.2} className="text-faint" />
            <p className="text-sm text-muted">
              Programına eklemek için geri dön ve makine seç.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {items.map((machine, i) => (
                <ProgramItem
                  key={machine.id}
                  machine={machine}
                  index={i}
                  total={items.length}
                  onMoveUp={() => move(i, i - 1)}
                  onMoveDown={() => move(i, i + 1)}
                  onRemove={() => onRemove(i)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
