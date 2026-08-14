import { Link } from "react-router-dom";
import Card from "./Card.jsx";
import Icon from "./Icon.jsx";
import InfoTooltip from "./InfoTooltip.jsx";

function renderHint(hint) {
  if (!hint) return null;
  if (typeof hint === "string") {
    return <InfoTooltip body={hint} />;
  }
  return <InfoTooltip {...hint} />;
}

export default function StatCard({ label, value, delta, icon, tone = "primary", hint, to, onClick }) {
  const tones = {
    primary: "bg-primary-50 text-accent",
    green: "bg-available-soft text-available",
    blue: "bg-info-soft text-info",
    amber: "bg-busy-soft text-busy",
  };

  const interactive = Boolean(to || onClick);
  const body = (
    <div className="flex items-start justify-between">
      <div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted">
          {label}
          {renderHint(hint)}
        </p>
        <p className="mt-1 font-mono text-3xl font-bold tracking-tight tabular-nums text-content">{value}</p>
        {delta && (
          <p
            className={`mt-1 text-xs font-semibold ${
              delta.startsWith("-") ? "text-accent" : "text-available"
            }`}
          >
            {delta} bu hafta
          </p>
        )}
        {interactive && (
          <p className="mt-1.5 text-[11px] font-semibold text-accent opacity-80">Detay için tıklayın →</p>
        )}
      </div>
      {icon && (
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon name={icon} size={20} />
        </div>
      )}
    </div>
  );

  const cardClass = `p-5 ${interactive ? "cursor-pointer transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-pop" : ""}`;

  if (to) {
    return (
      <Link to={to} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40">
        <Card className={cardClass}>{body}</Card>
      </Link>
    );
  }

  return (
    <Card className={cardClass} onClick={onClick}>
      {body}
    </Card>
  );
}
