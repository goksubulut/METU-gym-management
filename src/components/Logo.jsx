// METU MOTION — marka logosu. public/images/metumotion.jpg amblemini kullanır.

export default function Logo({ size = 28, withText = true }) {
  const box = size + 8;
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/images/metumotion.jpg"
        alt="METU Motion"
        width={box}
        height={box}
        className="rounded-xl object-cover ring-1 ring-white/12 shadow-[0_3px_12px_rgba(0,0,0,0.45)]"
        style={{ width: box, height: box }}
      />
      {withText && (
        <div className="leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-content">
            METU <span className="text-glow">Motion</span>
          </span>
          <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
            ODTÜ Spor Merkezi
          </span>
        </div>
      )}
    </div>
  );
}
