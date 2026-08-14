import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, X } from "lucide-react";
import Button from "../Button.jsx";

// ── Individual machine item inside the box ─────────────────────────────────

function MachineItem({ machine, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.84, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.86, y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Dumbbell
        size={13}
        strokeWidth={1.6}
        style={{ color: "rgba(255,255,255,0.32)", flexShrink: 0 }}
      />
      <span
        className="min-w-0 flex-1 truncate text-[13px] font-medium leading-none"
        style={{ color: "rgba(255,255,255,0.78)" }}
      >
        {machine.name}
      </span>
      <button
        type="button"
        aria-label={`${machine.name} makinesini programdan çıkar`}
        onClick={() => onRemove?.(machine.id)}
        className="ml-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors active:scale-90"
        style={{ color: "rgba(255,255,255,0.32)" }}
      >
        <X size={13} />
      </button>
    </motion.div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyInterior() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-3 py-9 text-center"
    >
      <div
        className="grid h-12 w-12 place-items-center rounded-full"
        style={{
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Dumbbell size={20} strokeWidth={1.4} style={{ color: "rgba(255,255,255,0.22)" }} />
      </div>
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.28)" }}>
        Seçtiğin makineler burada görünecek
      </p>
    </motion.div>
  );
}

// ── Open-box container visual ──────────────────────────────────────────────
// Layers (back → front):
//  z=1  back flap     — narrow dark strip, top center
//  z=2  left flap     — medium gray, angled outward left
//  z=2  right flap    — mirror of left
//  z=3  box body      — dark gray main body
//          rim        — lighter top strip (wall thickness)
//          interior   — very dark, holds machine items
//          glass      — frosted overlay at bottom (pointer-events-none)

function OpenBox({ machines, onRemove }) {
  // Glass panel height matches paddingBottom of interior,
  // so content never goes behind the glass.
  const GLASS_H = 88; // px
  const RIM_H = 22; // px

  return (
    // paddingTop creates headroom above the box body for flaps
    <div className="relative w-full" style={{ paddingTop: "21%" }}>

      {/* ── Back flap ── */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: 0,
          width: "50%",
          height: "23%",
          background: "linear-gradient(180deg, #1d1d1d 0%, #161616 100%)",
          border: "1px solid #252525",
          borderBottom: "none",
          borderRadius: "6px 6px 0 0",
          zIndex: 1,
        }}
      />

      {/* ── Left flap ── */}
      <div
        className="absolute"
        style={{
          top: "2%",
          left: "-1%",
          width: "30%",
          height: "64px",
          background: "linear-gradient(148deg, #575757 0%, #404040 100%)",
          border: "1px solid #4d4d4d",
          borderRadius: "8px",
          // Pivot at right edge: inner edge stays at box corner, outer folds up-left
          transform: "rotate(-7deg) translateY(10px)",
          transformOrigin: "right 78%",
          zIndex: 4,
          boxShadow: [
            "0 6px 22px rgba(0,0,0,0.58)",
            "inset 0 1px 0 rgba(255,255,255,0.08)",
            "inset 1px 0 0 rgba(255,255,255,0.04)",
          ].join(", "),
        }}
      />

      {/* ── Right flap ── */}
      <div
        className="absolute"
        style={{
          top: "2%",
          right: "-1%",
          width: "30%",
          height: "64px",
          background: "linear-gradient(212deg, #575757 0%, #404040 100%)",
          border: "1px solid #4d4d4d",
          borderRadius: "8px",
          transform: "rotate(7deg) translateY(10px)",
          transformOrigin: "left 78%",
          zIndex: 4,
          boxShadow: [
            "0 6px 22px rgba(0,0,0,0.58)",
            "inset 0 1px 0 rgba(255,255,255,0.07)",
            "inset -1px 0 0 rgba(255,255,255,0.03)",
          ].join(", "),
        }}
      />

      {/* ── Main box body ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(148deg, #2d2d2d 0%, #232323 55%, #292929 100%)",
          border: "1px solid #323232",
          borderTop: "none",
          borderRadius: "0 0 14px 14px",
          zIndex: 3,
          boxShadow: [
            "0 20px 56px rgba(0,0,0,0.75)",
            "0 4px 12px rgba(0,0,0,0.4)",
            "inset 0 1px 0 rgba(255,255,255,0.04)",
            "inset 1px 0 0 rgba(255,255,255,0.02)",
            "inset -1px 0 0 rgba(255,255,255,0.02)",
          ].join(", "),
        }}
      >
        {/* Rim — lighter top strip showing wall thickness */}
        <div
          style={{
            height: `${RIM_H}px`,
            background: "linear-gradient(180deg, #484848 0%, #383838 100%)",
            borderBottom: "1px solid #2c2c2c",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.09)",
          }}
        />

        {/* Interior — dark area holding machine items */}
        <div
          className="space-y-2 overflow-y-auto"
          style={{
            background: "linear-gradient(180deg, #111111 0%, #0d0d0d 100%)",
            minHeight: "224px",
            maxHeight: "320px",
            padding: `14px 14px ${GLASS_H + 8}px`,
          }}
        >
          <AnimatePresence mode="popLayout">
            {machines.length === 0 ? (
              <EmptyInterior key="empty-state" />
            ) : (
              machines.map((m) => (
                <MachineItem key={m.id} machine={m} onRemove={onRemove} />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Glass / frosted front panel — purely decorative, no pointer events */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0"
          style={{
            height: `${GLASS_H}px`,
            background:
              "linear-gradient(180deg, rgba(82,82,82,0.20) 0%, rgba(62,62,62,0.48) 100%)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            borderTop: "1px solid rgba(140,140,140,0.13)",
            borderRadius: "0 0 14px 14px",
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
}

// ── MachineBucket — the complete component ────────────────────────────────

export default function MachineBucket({
  machines = [],
  onRemoveMachine,
  onCreateProgram,
  ctaLabel = "Devam Et",
  disabled = false,
}) {
  const count = machines.length;

  return (
    <div className="w-full">
      {/* Section heading */}
      <div className="mb-4">
        <h2 className="font-display text-lg font-bold tracking-tight text-content">
          Programın
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          Seçtiğin makinelerle antrenman programını oluştur.
        </p>
      </div>

      {/* Open-box visual */}
      <OpenBox machines={machines} onRemove={onRemoveMachine} />

      {/* Machine count */}
      <p className="mt-4 text-center text-sm font-medium text-muted">
        {count === 0
          ? "Henüz makine seçilmedi"
          : `${count} makine seçildi`}
      </p>

      {/* CTA */}
      <Button
        full
        size="lg"
        className="mt-3"
        onClick={() => onCreateProgram?.(machines)}
        disabled={disabled}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
