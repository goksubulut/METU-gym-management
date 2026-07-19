import { useEffect, useMemo, useState } from "react";
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
import Modal from "../../components/Modal.jsx";
import Button from "../../components/Button.jsx";
import InfoTooltip from "../../components/InfoTooltip.jsx";
import StarRating from "../../components/StarRating.jsx";
import Badge from "../../components/Badge.jsx";
import { matrixData as mockMatrix, maintenancePriorityDemo } from "../../mock/analytics.js";
import { fetchAdminMatrix } from "../../api/admin.js";

const USE_MID = 110;
const RATE_MID = 4.5;
const MAINTENANCE_INDEX = 1;

function isMaintenancePriority(d) {
  return d.uses >= USE_MID && d.rating < RATE_MID;
}

/** API verisinde bakım kadranı boşsa demo makineleri ekler veya günceller. */
function withMaintenanceDemo(rows) {
  const list = rows?.length ? [...rows] : [...mockMatrix];
  if (list.some(isMaintenancePriority)) return list;

  const byName = new Map(list.map((d) => [d.name, d]));
  for (const demo of maintenancePriorityDemo) {
    const existing = byName.get(demo.name);
    byName.set(demo.name, existing ? { ...existing, uses: demo.uses, rating: demo.rating } : demo);
  }
  return Array.from(byName.values());
}

const QUADRANTS = [
  {
    title: "Başarılı",
    desc: "Yüksek tercih + yüksek memnuniyet",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pos: "Sürdür",
    hint: {
      title: "Başarılı kadran",
      body: "Salonun en çok tercih edilen ve en yüksek puan alan makineleri burada. Bakım planını sürdürün, kapasiteyi koruyun.",
      formula: "Kullanım ≥ 110 ve Puan ≥ 4.5",
    },
    modalTitle: "Başarılı Makineler",
    modalDesc:
      "Yüksek kullanım ve yüksek memnuniyet alan makineler. Mevcut bakım planını sürdürün, kapasiteyi koruyun.",
    badge: { label: "Sürdür", tone: "green" },
    rowClass: "border-emerald-100 bg-emerald-50/50",
    ringClass: "focus-visible:ring-emerald-400/50",
    clickHintClass: "text-emerald-600/80",
    emptyText: "Bu kadranda makine yok.",
  },
  {
    title: "Bakım Önceliği",
    desc: "Yüksek tercih + düşük memnuniyet",
    tone: "bg-red-50 text-red-700 border-red-200",
    pos: "Acil iyileştir",
    hint: {
      title: "Bakım önceliği kadranı",
      body: "Çok kullanılıyor ama puanları düşük — üye memnuniyetini düşürür. Bakım, parça değişimi veya eğitim desteği önceliklendirilmeli.",
      formula: "Kullanım ≥ 110 ve Puan < 4.5",
    },
    modalTitle: "Acil İyileştirme — Bakım Önceliği",
    modalDesc:
      "Bu makineler salonun en çok kullanılanları arasında ancak düşük puan alıyor. Bakım, parça değişimi veya kullanım eğitimi önceliklendirilmeli.",
    badge: { label: "Acil iyileştir", tone: "red" },
    rowClass: "border-red-100 bg-red-50/50",
    ringClass: "focus-visible:ring-red-400/50",
    clickHintClass: "text-red-600/80",
    emptyText: "Şu an acil iyileştirme gerektiren makine yok.",
  },
  {
    title: "Görünürlük Artır",
    desc: "Düşük tercih + yüksek memnuniyet",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
    pos: "Tanıt",
    hint: {
      title: "Görünürlük artır kadranı",
      body: "Kaliteli makineler ama az tercih ediliyor. Salon içi konum, etiketleme veya antrenör yönlendirmesiyle fark edilir hale getirin.",
      formula: "Kullanım < 110 ve Puan ≥ 4.5",
    },
    modalTitle: "Görünürlük Artırılacak Makineler",
    modalDesc:
      "Kaliteli puan alan ancak az tercih edilen makineler. Konum, etiketleme veya antrenör yönlendirmesiyle görünürlük artırılabilir.",
    badge: { label: "Tanıt", tone: "blue" },
    rowClass: "border-blue-100 bg-blue-50/50",
    ringClass: "focus-visible:ring-blue-400/50",
    clickHintClass: "text-blue-600/80",
    emptyText: "Bu kadranda makine yok.",
  },
  {
    title: "Kaldırılabilir",
    desc: "Düşük tercih + düşük memnuniyet",
    tone: "bg-gray-50 text-gray-600 border-gray-200",
    pos: "Gözden geçir",
    hint: {
      title: "Gözden geçir kadranı",
      body: "Hem az kullanılıyor hem düşük puan alıyor. Yenileme, değişim veya alandan kaldırma değerlendirilmeli.",
      formula: "Kullanım < 110 ve Puan < 4.5",
    },
    modalTitle: "Gözden Geçirilecek Makineler",
    modalDesc:
      "Hem düşük kullanım hem düşük memnuniyet alan makineler. Yenileme, değişim veya alandan kaldırma değerlendirilmeli.",
    badge: { label: "Gözden geçir", tone: "gray" },
    rowClass: "border-gray-200 bg-gray-50/80",
    ringClass: "focus-visible:ring-gray-400/50",
    clickHintClass: "text-gray-600/80",
    emptyText: "Bu kadranda makine yok.",
  },
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
  const [matrixData, setMatrixData] = useState(() => withMaintenanceDemo(mockMatrix));
  const [activeQuadrant, setActiveQuadrant] = useState(null);

  useEffect(() => {
    fetchAdminMatrix()
      .then((data) => {
        setMatrixData(withMaintenanceDemo(data.matrixData));
      })
      .catch(() => {
        setMatrixData(withMaintenanceDemo(mockMatrix));
      });
  }, []);

  const grouped = useMemo(() => {
    const buckets = [[], [], [], []];
    matrixData.forEach((d) => buckets[classify(d)].push(d));
    return buckets;
  }, [matrixData]);

  const maintenanceMachines = grouped[MAINTENANCE_INDEX];
  const activeConfig = activeQuadrant !== null ? QUADRANTS[activeQuadrant] : null;
  const activeMachines =
    activeQuadrant !== null
      ? grouped[activeQuadrant].slice().sort((a, b) => b.uses - a.uses)
      : [];
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
        {QUADRANTS.map((q, i) => {
          const hasMachines = grouped[i].length > 0;

          return (
            <div
              key={q.title}
              role="button"
              tabIndex={0}
              onClick={() => setActiveQuadrant(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveQuadrant(i);
                }
              }}
              className={`cursor-pointer rounded-2xl border p-4 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-pop focus-visible:outline-none focus-visible:ring-2 ${q.tone} ${q.ringClass}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold">{q.title}</p>
                <InfoTooltip {...q.hint} className="shrink-0" />
              </div>
              <p className="mt-0.5 text-xs opacity-80">{q.desc}</p>
              <p className="mt-2 text-2xl font-extrabold">{grouped[i].length}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                {q.pos}
              </p>
              {hasMachines && (
                <p className={`mt-2 text-[11px] font-semibold ${q.clickHintClass}`}>
                  Listeyi görmek için tıklayın →
                </p>
              )}
            </div>
          );
        })}
      </div>

      {maintenanceMachines.length > 0 && (
        <button
          type="button"
          onClick={() => setActiveQuadrant(MAINTENANCE_INDEX)}
          className="flex w-full items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-left transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
        >
          <div>
            <p className="text-sm font-bold text-red-800">Acil İyileştirme Gereken Makineler</p>
            <p className="mt-0.5 text-xs text-red-700/80">
              Yüksek kullanım + düşük memnuniyet — bakım veya müdahale önceliği
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="red">{maintenanceMachines.length} makine</Badge>
            <span className="text-sm font-semibold text-red-700">Detay →</span>
          </div>
        </button>
      )}

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

      <Modal
        open={activeQuadrant !== null}
        onClose={() => setActiveQuadrant(null)}
        title={activeConfig?.modalTitle ?? ""}
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setActiveQuadrant(null)}>
            Kapat
          </Button>
        }
      >
        {activeConfig && (
          <>
            <p className="mb-4 text-sm text-gray-500">{activeConfig.modalDesc}</p>
            {activeMachines.length === 0 ? (
              <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                {activeConfig.emptyText}
              </p>
            ) : (
              <div className="space-y-3">
                {activeMachines.map((m) => (
                  <div
                    key={m.name}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${activeConfig.rowClass}`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{m.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{m.uses} kullanım</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StarRating value={m.rating} size="sm" readOnly />
                      <Badge tone={activeConfig.badge.tone}>{activeConfig.badge.label}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
