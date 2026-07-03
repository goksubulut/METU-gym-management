export default function Logo({ size = 28, withText = true }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="grid place-items-center rounded-xl bg-primary-600 font-black text-white"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        F
      </div>
      {withText && (
        <div className="leading-none">
          <span className="text-lg font-extrabold text-gray-900">FitBud</span>
          <span className="block text-[10px] font-medium tracking-wide text-primary-500">
            randevu &amp; makine
          </span>
        </div>
      )}
    </div>
  );
}
