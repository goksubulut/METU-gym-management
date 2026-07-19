import { useEffect, useState } from "react";
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
import Tabs from "../../components/Tabs.jsx";
import {
  summary as mockSummary,
  occupancyTrend as mockTrend,
  occupancyTrendMonthly as mockTrendMonthly,
  topMachines as mockTop,
} from "../../mock/analytics.js";
import { fetchAdminDashboard, fetchAdminOccupancy } from "../../api/admin.js";

const OCCUPANCY_TABS = [
  { value: "weekly", label: "Haftalık" },
  { value: "monthly", label: "Aylık" },
];

function averageOccupancy(points) {
  if (!points?.length) return 0;
  return Math.round(points.reduce((sum, p) => sum + p.occupancy, 0) / points.length);
}

function mapOccupancyTrend(data, period) {
  return data.map((p, i) => ({
    day: period === "monthly" ? `${i + 1}. Hafta` : p.label,
    occupancy: p.occupancy,
  }));
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(mockSummary);
  const [occupancyPeriod, setOccupancyPeriod] = useState("weekly");
  const [periodOccupancy, setPeriodOccupancy] = useState(averageOccupancy(mockTrend));
  const [occupancyTrend, setOccupancyTrend] = useState(mockTrend);
  const [topMachines, setTopMachines] = useState(mockTop);

  useEffect(() => {
    fetchAdminDashboard()
      .then((data) => {
        if (data.summary?.todayAppointments > 0 || data.topMachines?.length) {
          setSummary((prev) => ({
            ...prev,
            todayAppointments: data.summary.todayAppointments,
            avgRating: data.summary.avgRating,
            openFaults: data.summary.openFaults,
          }));
          if (data.topMachines?.length) setTopMachines(data.topMachines);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const apiPeriod = occupancyPeriod === "weekly" ? "daily" : "weekly";
    const mockData = occupancyPeriod === "weekly" ? mockTrend : mockTrendMonthly;

    fetchAdminOccupancy(apiPeriod)
      .then((data) => {
        if (data?.length) {
          const trend = mapOccupancyTrend(data, occupancyPeriod);
          setOccupancyTrend(trend);
          setPeriodOccupancy(averageOccupancy(trend));
        }
      })
      .catch(() => {
        setOccupancyTrend(mockData);
        setPeriodOccupancy(averageOccupancy(mockData));
      });
  }, [occupancyPeriod]);

  const trendTitle =
    occupancyPeriod === "weekly" ? "Haftalık Doluluk Trendi" : "Aylık Doluluk Trendi";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Genel Bakış</h1>
        <p className="text-sm text-gray-400">Salonun bugünkü durumu ve doluluk trendleri</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Bugünkü Randevu" value={summary.todayAppointments} delta="+12%" icon="calendar" />
        <StatCard
          label={`Doluluk Oranı (${occupancyPeriod === "weekly" ? "Haftalık" : "Aylık"})`}
          value={`%${periodOccupancy}`}
          delta="+5%"
          icon="users"
          tone="blue"
        />
        <StatCard label="Ortalama Puan" value={summary.avgRating} delta="+0.2" icon="star" tone="amber" />
        <StatCard label="Açık Arıza" value={summary.openFaults} delta="-2" icon="wrench" tone="green" to="/admin/faults" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-gray-900">{trendTitle}</h2>
            <Tabs tabs={OCCUPANCY_TABS} active={occupancyPeriod} onChange={setOccupancyPeriod} />
          </div>
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
