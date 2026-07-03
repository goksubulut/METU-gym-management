import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import Card from "../../components/Card.jsx";
import { Select } from "../../components/Input.jsx";
import { machinePreference, muscleGroupPopularity, CHART_COLORS } from "../../mock/analytics.js";

export default function Preferences() {
  const [range, setRange] = useState("30");
  const radial = muscleGroupPopularity.map((m, i) => ({
    ...m,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Tercih Analizi</h1>
          <p className="text-sm text-gray-400">Makine ve kas grubu tercih dağılımı</p>
        </div>
        <div className="w-48">
          <Select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7">Son 7 gün</option>
            <option value="30">Son 30 gün</option>
            <option value="90">Son 90 gün</option>
          </Select>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-base font-bold text-gray-900">Makine Türü Bazlı Tercih</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={machinePreference}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#dc2626" radius={[6, 6, 0, 0]} name="Kullanım" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-base font-bold text-gray-900">Kas Grubu Popülerliği</h2>
        <ResponsiveContainer width="100%" height={340}>
          <RadialBarChart
            innerRadius="20%"
            outerRadius="100%"
            data={radial}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar background dataKey="value" />
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              payload={radial.map((r) => ({
                value: `${r.group} (${r.value})`,
                color: r.fill,
                type: "circle",
              }))}
            />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
