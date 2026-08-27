import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";

/**
 * Native <select> option listesi tarayıcıda keskin köşe + mavi vurgu kullanır.
 * Yuvarlatılmış panel, kırmızı gradyan seçim.
 */
export default function MenuSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Seç",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-content">{label}</span>
      )}
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-12 w-full items-center justify-between rounded-xl border border-line bg-surface-2 px-4 text-left text-sm text-content outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25"
        >
          <span className={selected ? "text-content" : "text-faint"}>
            {selected?.label ?? placeholder}
          </span>
          <Icon
            name={open ? "chevronUp" : "chevronDown"}
            size={16}
            className="shrink-0 text-muted"
          />
        </button>
        {open && (
          <ul
            role="listbox"
            className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-line bg-surface-2 p-1.5 shadow-pop"
          >
            {options.map((o) => {
              const active = o.value === value;
              return (
                <li key={String(o.value)}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={[
                      "flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                      active
                        ? "bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 text-white shadow-cta"
                        : "text-content hover:bg-surface-3",
                    ].join(" ")}
                  >
                    {o.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </label>
  );
}
