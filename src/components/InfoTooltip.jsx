import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Balon, tetikleyicinin yanında DEĞİL, portal ile <body> altında konumlanır.
//
// Nedeni: kartların çoğu backdrop-filter taşıyor (bg-surface / .glass), bu da
// kendi stacking context'ini yaratıyor. İçeride kalan bir balon z-50 olsa bile
// sticky header'ın (z-10) ALTINDA boyanıyordu — kart kendi bağlamında sıkışık
// olduğu için. Portal + position:fixed bunu tamamen aşar.
//
// Ayrıca üstte yer yoksa (header'a denk geliyorsa) balon otomatik olarak
// tetikleyicinin ALTINA geçer.

const GAP = 8;
const SAFE_TOP = 76; // sticky admin header'ı için güvenli bölge
const EDGE = 12;
const WIDTH = 268; // balon genişliği (w-[268px]) — geçici konum için

export default function InfoTooltip({ title, body, formula, content, className = "" }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const tipRef = useRef(null);

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;

    const t = trigger.getBoundingClientRect();
    const box = tip.getBoundingClientRect();
    const center = t.left + t.width / 2;
    const half = box.width / 2;

    const aboveTop = t.top - GAP - box.height;
    const placement = aboveTop >= SAFE_TOP ? "top" : "bottom";
    const top = placement === "top" ? aboveTop : t.bottom + GAP;

    // Yatay taşmayı engelle. Ortalama transform ile DEĞİL, sol kenarı doğrudan
    // hesaplayarak yapılır: transform'u giriş animasyonuna bırakıyoruz.
    const clamped = Math.min(Math.max(center, EDGE + half), window.innerWidth - EDGE - half);

    setPos({ top, left: clamped - half, placement });
  }, []);

  // Balon ASLA ekran dışında (-9999) oluşturulmaz: açılış anında tetikleyicinin
  // konumundan geçici bir yer hesaplanır, yükseklik ölçüldükten sonra place()
  // ince ayarı yapar. Aksi halde ilk kare ekran dışında boyanıyor ve Chrome
  // ekran dışı elemanların animasyonlarını kıstığı için balon saydam kalıyordu.
  const openTip = useCallback(() => {
    const trigger = triggerRef.current;
    if (trigger) {
      const t = trigger.getBoundingClientRect();
      const center = t.left + t.width / 2;
      const half = WIDTH / 2;
      const clamped = Math.min(Math.max(center, EDGE + half), window.innerWidth - EDGE - half);
      setPos({ top: t.bottom + GAP, left: clamped - half, placement: "bottom" });
    }
    setOpen(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onChange = () => place();
    window.addEventListener("scroll", onChange, true);
    window.addEventListener("resize", onChange);
    return () => {
      window.removeEventListener("scroll", onChange, true);
      window.removeEventListener("resize", onChange);
    };
  }, [open, place]);

  // Editoryal düzen: geniş harf aralıklı üst başlık → gövde → formül kuyusu.
  const inner =
    content ??
    (
      <>
        {title && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{title}</p>
        )}
        {body && (
          <p className={`text-[12.5px] leading-[1.6] text-white/85 ${title ? "mt-2" : ""}`}>
            {body}
          </p>
        )}
        {formula && (
          <p className="info-tip__formula mt-3 rounded-[10px] px-3 py-2 text-center font-mono text-[11px] leading-snug tracking-[0.01em]">
            {formula}
          </p>
        )}
      </>
    );

  return (
    <span
      className={`relative inline-flex align-middle ${className}`}
      onMouseEnter={openTip}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        className="grid h-[18px] w-[18px] place-items-center rounded-full border border-line bg-surface-2 text-[10px] font-bold leading-none text-muted shadow-sm transition-all duration-200 hover:border-primary-200 hover:bg-primary-50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
        aria-describedby={open ? id : undefined}
        onFocus={openTip}
        onBlur={() => setOpen(false)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        i
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            id={id}
            ref={tipRef}
            role="tooltip"
            style={{ top: pos.top, left: pos.left }}
            className="info-tip pointer-events-none fixed z-[999] w-[268px] px-4 py-3.5 text-left" 
          >
            {inner}
          </div>,
          document.body
        )}
    </span>
  );
}
