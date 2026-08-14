import Badge from "./Badge.jsx";

// Doluluk oranına göre renk. (Randevu slotu doluluğu — makine kataloğu değil.)
function fill(ratio) {
  if (ratio >= 1) return { tone: "gray", label: "Dolu", disabled: true };
  if (ratio >= 0.7) return { tone: "red", label: "Yoğun", disabled: false };
  if (ratio >= 0.4) return { tone: "yellow", label: "Orta", disabled: false };
  return { tone: "green", label: "Müsait", disabled: false };
}

export default function SlotButton({
  slot,
  selected,
  onSelect,
  reservedSlotId,
  selectedVariant = "primary",
}) {
  const isReserved = reservedSlotId && slot.id === reservedSlotId;
  const disabled =
    !isReserved && (slot.isFull || slot.isPast || slot.booked >= slot.capacity);
  const info = disabled
    ? { tone: "gray", label: slot.isPast ? "Geçti" : "Dolu", disabled: true }
    : fill(slot.booked / slot.capacity);
  const selectedClass =
    selectedVariant === "green"
      ? "border-available bg-available text-white shadow-sm"
      : "border-primary-600 bg-primary-600 text-white shadow-cta";
  return (
    <button
      type="button"
      disabled={info.disabled}
      onClick={() => onSelect(slot)}
      className={`flex flex-col items-center rounded-xl border p-2.5 transition-[background-color,border-color,transform] duration-150 ease-smooth active:scale-[0.97] ${
        info.disabled
          ? "cursor-not-allowed border-hairline bg-surface-2 opacity-60"
          : selected
            ? selectedClass
            : "border-line bg-surface hover:border-primary-300"
      }`}
    >
      <span className="font-mono text-sm font-bold tabular-nums">{slot.time}</span>
      {info.disabled ? (
        <span className="mt-1 text-[10px] font-semibold text-muted">Dolu</span>
      ) : selected ? (
        <span className="mt-1 text-[10px] font-semibold text-white/90">
          {slot.capacity - slot.booked} yer
        </span>
      ) : (
        <Badge tone={info.tone} className="mt-1 !px-1.5 !py-0 !text-[10px]">
          {info.label}
        </Badge>
      )}
    </button>
  );
}
