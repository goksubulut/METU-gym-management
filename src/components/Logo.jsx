import Icon from "./Icon.jsx";

export default function Logo({ size = 28, withText = true }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="grid place-items-center rounded-xl bg-primary-600 text-white"
        style={{ width: size + 6, height: size + 6 }}
      >
        <Icon name="dumbbell" size={size * 0.7} strokeWidth={2.1} />
      </div>
      {withText && (
        <div className="leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-gray-900">
            METU <span className="text-primary-600">GYM</span>
          </span>
          <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Management System
          </span>
        </div>
      )}
    </div>
  );
}
