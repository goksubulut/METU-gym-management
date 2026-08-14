import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const INTERVAL_MS = 680;

export default function Bucket({ items = [], onComplete }) {
  const [idx, setIdx] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  useEffect(() => {
    if (items.length === 0) {
      const t = setTimeout(() => onCompleteRef.current?.(), 700);
      return () => clearTimeout(t);
    }

    const timers = items.map((_, i) =>
      setTimeout(() => setIdx(i + 1), 380 + i * INTERVAL_MS)
    );
    const doneTimer = setTimeout(
      () => onCompleteRef.current?.(),
      380 + items.length * INTERVAL_MS + 500
    );

    return () => [...timers, doneTimer].forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentItem = idx >= 1 && idx <= items.length ? items[idx - 1] : null;
  const settled = items.slice(0, idx);

  return (
    <div className="flex flex-col items-center">
      {/* Falling chip area */}
      <div className="relative h-16 w-full flex items-center justify-center overflow-visible">
        <AnimatePresence mode="popLayout">
          {currentItem && (
            <motion.div
              key={idx}
              initial={{ y: -54, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 68, opacity: 0, scale: 0.88 }}
              transition={{ type: "spring", stiffness: 290, damping: 22, mass: 0.85 }}
              className="absolute rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white shadow-cta max-w-[200px] truncate"
            >
              {currentItem}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      {items.length > 0 && (
        <div className="mt-5 flex items-center gap-2.5">
          {items.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                backgroundColor: i < idx ? "rgb(166 25 46)" : "rgb(42 42 68)",
                scale: i < idx ? 1 : 0.7,
              }}
              transition={{ duration: 0.22 }}
              className="h-2 w-2 rounded-full"
            />
          ))}
        </div>
      )}

      <p className="mt-2.5 text-xs font-medium text-muted">
        {settled.length}/{items.length} makine eklendi
      </p>
    </div>
  );
}
