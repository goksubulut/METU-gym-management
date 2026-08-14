export default function Card({ className = "", soft, onClick, children }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border ${
        soft ? "border-primary-200 bg-soft" : "border-hairline bg-surface"
      } shadow-card ${
        onClick
          ? "cursor-pointer select-none transition-[box-shadow,transform] duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-pop active:scale-[0.98] active:translate-y-0 active:shadow-card"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
