// Apple segmented control: hap track + yükseltilmiş aktif yüzey.
export default function Tabs({ tabs, active, onChange, className = "" }) {
  return (
    <div
      className={`inline-flex max-w-full gap-1 overflow-x-auto no-scrollbar rounded-full bg-surface-2 p-1 ${className}`}
    >
      {tabs.map((t) => {
        const value = t.value ?? t;
        const label = t.label ?? t;
        const on = value === active;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-200 ease-smooth active:scale-[0.97] ${
              on
                ? "bg-surface text-content shadow-card"
                : "text-muted hover:text-content"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
