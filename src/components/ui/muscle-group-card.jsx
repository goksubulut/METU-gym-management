import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowUpDown,
  CircleDot,
  ChevronsDown,
  Dumbbell,
  Flame,
  Shield,
  Zap,
} from "lucide-react";

const ICONS = {
  chest:     Dumbbell,
  back:      ArrowUpDown,
  shoulders: Activity,
  arms:      Zap,
  legs:      ChevronsDown,
  core:      Shield,
  glutes:    CircleDot,
  cardio:    Flame,
};

export default function MuscleGroupCard({ group, selected, onToggle }) {
  const Icon = ICONS[group.id] ?? Dumbbell;

  return (
    <motion.button
      type="button"
      onClick={() => onToggle(group.id)}
      whileTap={{ scale: 0.95 }}
      aria-pressed={selected}
      className={[
        "relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-200",
        selected
          ? "border-primary-600 bg-primary-600/10 shadow-cta"
          : "border-hairline bg-surface shadow-card",
      ].join(" ")}
    >
      <AnimatePresence>
        {selected && (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-primary-600"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 12 12"
              width="10"
              height="10"
              fill="none"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m2 6 3 3 5-5" />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>

      <Icon
        size={28}
        strokeWidth={1.4}
        className={[
          "transition-colors duration-200",
          selected ? "text-primary-500" : "text-muted",
        ].join(" ")}
      />

      <span
        className={[
          "text-[13px] font-bold leading-tight transition-colors duration-200",
          selected ? "text-accent" : "text-content",
        ].join(" ")}
      >
        {group.label}
      </span>
    </motion.button>
  );
}
