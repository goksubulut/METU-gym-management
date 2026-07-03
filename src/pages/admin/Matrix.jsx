import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import Card from "../../components/Card.jsx";
import { matrixData } from "../../mock/analytics.js";

// Eşik değerleri (kadran sınırları)
const USE_MID = 110;
const RATE_MID = 4.5;

const QUADRANTS = [
  { title: "Başarılı", desc: "Yüksek tercih + yüksek memnuniyet", tone: "bg-emerald-50 text-emerald-700 border-emerald-200", pos: "Sürdür" },
  { title: "Bakım Önceliği", desc: "Yüksek tercih + düşük memnuniyet", tone: "bg-red-50 text-red-700 border-red-200", pos: "Acil iyileştir" },
  { title: "Görünürlük Artır", desc: "Düşük tercih + yüksek memnuniyet", tone: "bg-blue-50 text-blue-700 border-blue-200", pos: "Tanıt" },
  { title: "Kaldırılabilir", desc: "Düşük tercih + düşük memnuniyet", tone: "bg-gray-50 text-gray-600 border-gray-200", pos: "Gözden geçir" },
];

function classify(d) {
  const hiUse = d.uses >= USE_MID;
  const hiRate = d.rating >= RATE_MID;
  if (hiUse && hiRate) return 0;
  if (hiUse && !hiRate) return 1;
  if (!hiUse && hiRate) return 2;
  return 3;
}

export default function Matrix() {
  const grouped = [[], [], [], []];
  matrixData.forEach((d) => grouped[classify(d)].push(d));
  const colors = ["#059669", "#dc2626", "#2563eb", "#9ca3af"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Tercih × Memnuniyet Matrisi</h1>
        <p className="text-sm text-gray-400">
          Makineleri kullanım (tercih) ve puan (memnuniyet) eksenlerinde konumlandırır
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {QUADRANTS.map((q, i) => (
          <div key={q.title} className={`rounded-2xl border p-4 ${q.tone}`}>
            <p className="text-sm font-bold">{q.title}</p>
            <p className="mt-0.5 text-xs opacity-80">{q.desc}</p>
            <p className="mt-2 text-2xl font-extrabold">{grouped[i].length}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
              {q.pos}
            </p>
          </div>
        ))}
      </div>

      <Card className="p-6">
        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              dataKey="uses"
              name="Kullanım"
              domain={[0, 240]}
              tick={{ fontSize: 12 }}
              label={{ value: "Tercih (kullanım)", position: "bottom", fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="rating"
              name="Puan"
              domain={[3.8, 5]}
              tick={{ fontSize: 12 }}
              label={{ value: "Memnuniyet (puan)", angle: -90, position: "insideLeft", fontSize: 12 }}
            />
            <ZAxis range={[120, 120]} />
            <ReferenceLine x={USE_MID} stroke="#cbd5e1" strokeDasharray="4 4" />
            <ReferenceLine y={RATE_MID} stroke="#cbd5e1" strokeDasharray="4 4" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(v, n) => [v, n]}
              labelFormatter={() => ""}
              content={({ payload }) =>
                payload && payload.length ? (
                  <div className="rounded-lg bg-white px-3 py-2 text-xs shadow-pop">
                    <p className="font-bold text-gray-900">{payload[0].payload.name}</p>
                    <p className="text-gray-500">Kullanım: {payload[0].payload.uses}</p>
                    <p className="text-gray-500">Puan: {payload[0].payload.rating}</p>
                  </div>
                ) : null
              }
            />
            {grouped.map((g, i) => (
              <Scatter key={i} data={g} fill={colors[i]} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <p className="mt-2 text-center text-xs text-gray-400">
          Kesik çizgiler kadran sınırlarıdır (kullanım ≈ {USE_MID}, puan ≈ {RATE_MID})
        </p>
      </Card>
    </div>
  );
}
