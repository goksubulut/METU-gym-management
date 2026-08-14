import { AnimatePresence, motion } from "framer-motion";
import { Check, Dumbbell, MapPin } from "lucide-react";
import { MUSCLE_GROUPS } from "../../mock/machines.js";

export default function MachineSelectCard({ machine, selected, onToggle }) {
  const groupLabel = machine.muscles?.[0]
    ? (MUSCLE_GROUPS.find((g) => g.id === machine.muscles[0])?.label ?? "")
    : "";

  return (
    <motion.button
      type="button"
      onClick={() => onToggle(machine.id)}
      whileTap={{ scale: 0.98 }}
      aria-pressed={selected}
      className={[
        "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-150",
        selected ? "border-primary-600 bg-primary-600/10" : "border-hairline bg-surface",
      ].join(" ")}
    >
      {/* Photo / icon */}
      <div
        className={[
          "relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl",
          selected ? "bg-primary-600/20" : "bg-surface-3",
        ].join(" ")}
      >
        {machine.photoUrl ? (
          <img
            src={machine.photoUrl}
            alt={machine.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Dumbbell
            size={18}
            strokeWidth={1.5}
            className={selected ? "text-accent" : "text-faint"}
          />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate text-sm font-bold transition-colors duration-150",
            selected ? "text-accent" : "text-content",
          ].join(" ")}
        >
          {machine.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          <MapPin size={10} strokeWidth={2} />
          {machine.location}
        </p>
        {groupLabel && (
          <p className="mt-0.5 text-[11px] font-semibold text-faint">{groupLabel}</p>
        )}
      </div>

      {/* Check circle */}
      <div
        className={[
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all duration-150",
          selected
            ? "border-primary-600 bg-primary-600"
            : "border-muted/40 bg-transparent",
        ].join(" ")}
      >
        <AnimatePresence>
          {selected && (
            <motion.span
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.12 }}
            >
              <Check size={12} strokeWidth={3} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
