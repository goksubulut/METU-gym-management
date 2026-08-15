export default function Logo({ size = 28, withText = true }) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/images/metumotion.jpg"
        alt="METU Motion"
        className="rounded-xl object-cover"
        style={{ width: size + 6, height: size + 6 }}
      />
      {withText && (
        <div className="leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-gray-900">
            METU <span className="text-accent">GYM</span>
          </span>
          <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Management System
          </span>
        </div>
      )}
    </div>
  );
}
