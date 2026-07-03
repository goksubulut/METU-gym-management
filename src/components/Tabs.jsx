export default function Tabs({ tabs, active, onChange, className = "" }) {
  return (
    <div className={`flex gap-2 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((t) => {
        const value = t.value ?? t;
        const label = t.label ?? t;
        const on = value === active;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              on
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
