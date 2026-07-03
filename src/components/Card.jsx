export default function Card({ className = "", soft, onClick, children }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border ${soft ? "border-primary-100/60 bg-soft" : "border-gray-100 bg-white"} shadow-card ${
        onClick
          ? "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop active:translate-y-0 active:shadow-card"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
