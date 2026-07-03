import Card from "./Card.jsx";

export default function StatCard({ label, value, delta, icon, tone = "primary" }) {
  const tones = {
    primary: "bg-primary-50 text-primary-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-extrabold text-gray-900">{value}</p>
          {delta && (
            <p
              className={`mt-1 text-xs font-semibold ${
                delta.startsWith("-") ? "text-red-500" : "text-emerald-600"
              }`}
            >
              {delta} bu hafta
            </p>
          )}
        </div>
        {icon && (
          <div className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${tones[tone]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
