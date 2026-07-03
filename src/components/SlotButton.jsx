import Badge from "./Badge.jsx";

// Doluluk oranına göre renk. (Randevu slotu doluluğu — makine kataloğu değil.)
function fill(ratio) {
  if (ratio >= 1) return { tone: "gray", label: "Dolu", disabled: true };
  if (ratio >= 0.7) return { tone: "red", label: "Yoğun", disabled: false };
  if (ratio >= 0.4) return { tone: "yellow", label: "Orta", disabled: false };
  return { tone: "green", label: "Müsait", disabled: false };
}

export default function SlotButton({ slot, selected, onSelect }) {
  const disabled = slot.isFull || slot.isPast || slot.booked >= slot.capacity;
  const info = disabled
    ? { tone: "gray", label: slot.isPast ? "Geçti" : "Dolu", disabled: true }
    : fill(slot.booked / slot.capacity);
  return (
    <button
      disabled={info.disabled}
      onClick={() => onSelect(slot)}
      className={`flex flex-col items-center rounded-xl border p-2.5 transition-all ${
        info.disabled
          ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
          : selected
            ? "border-primary-600 bg-primary-600 text-white shadow-sm"
            : "border-gray-200 bg-white hover:border-primary-300"
      }`}
    >
      <span className="text-sm font-bold">{slot.time}</span>
      {info.disabled ? (
        <span className="mt-1 text-[10px] font-semibold text-gray-400">Dolu</span>
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
