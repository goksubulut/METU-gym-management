import { useId, useState } from "react";

export default function InfoTooltip({ title, body, formula, content, className = "" }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  const inner =
    content ??
    (
      <>
        {title && <p className="text-xs font-semibold text-white">{title}</p>}
        {body && (
          <p className={`text-xs leading-relaxed text-gray-300 ${title ? "mt-1.5" : ""}`}>
            {body}
          </p>
        )}
        {formula && (
          <p className="mt-2.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-center font-mono text-[11px] leading-snug text-emerald-300">
            {formula}
          </p>
        )}
      </>
    );

  return (
    <span
      className={`relative inline-flex align-middle ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="grid h-[18px] w-[18px] place-items-center rounded-full border border-gray-200 bg-white text-[10px] font-bold leading-none text-gray-400 shadow-sm transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
        aria-describedby={open ? id : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        i
      </button>

      <div
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-64 -translate-x-1/2 rounded-xl border border-gray-800/50 bg-gray-900 px-3.5 py-3 text-left shadow-xl transition-all duration-200 ease-out ${
          open ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"
        }`}
      >
        <span
          aria-hidden
          className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-gray-800/50 bg-gray-900"
        />
        {inner}
      </div>
    </span>
  );
}
