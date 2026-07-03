export default function Card({ className = "", soft, onClick, children }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl ${soft ? "bg-soft" : "bg-white"} shadow-card ${onClick ? "cursor-pointer hover:shadow-pop transition-shadow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
