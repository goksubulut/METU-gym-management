import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Card from "../../components/Card.jsx";
import StatCard from "../../components/StatCard.jsx";
import StarRating from "../../components/StarRating.jsx";
import { summary, occupancyTrend, topMachines } from "../../mock/analytics.js";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Genel Bakış</h1>
        <p className="text-sm text-gray-400">Salonun bugünkü durumu ve haftalık trendler</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Bugünkü Randevu" value={summary.todayAppointments} delta="+12%" icon="calendar" />
        <StatCard label="Doluluk Oranı" value={`%${summary.occupancy}`} delta="+5%" icon="users" tone="blue" />
        <StatCard label="Ortalama Puan" value={summary.avgRating} delta="+0.2" icon="star" tone="amber" />
        <StatCard label="Açık Arıza" value={summary.openFaults} delta="-2" icon="wrench" tone="green" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6">
          <h2 className="mb-4 text-base font-bold text-gray-900">Haftalık Doluluk Trendi</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={occupancyTrend}>
              <defs>
                <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="occupancy"
                stroke="#dc2626"
                strokeWidth={2.5}
                fill="url(#occ)"
                name="Doluluk"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-base font-bold text-gray-900">En Çok Tercih Edilen</h2>
          <div className="space-y-3">
            {topMachines.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-50 text-xs font-bold text-primary-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{m.name}</p>
                  <div className="flex items-center gap-2">
                    <StarRating value={m.rating} size="sm" readOnly />
                    <span className="text-xs text-gray-400">{m.uses} kullanım</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
