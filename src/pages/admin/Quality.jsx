import Card from "../../components/Card.jsx";
import StatCard from "../../components/StatCard.jsx";
import Badge from "../../components/Badge.jsx";
import StarRating from "../../components/StarRating.jsx";
import { summary, mostFaulty, mostComplained } from "../../mock/analytics.js";

export default function Quality() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Kalite Metrikleri</h1>
        <p className="text-sm text-gray-400">Puan, arıza ve şikayet göstergeleri</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Ortalama Puan" value={summary.avgRating} icon="star" tone="amber" />
        <StatCard label="Toplam Değerlendirme" value="1.204" icon="clipboard" tone="blue" />
        <StatCard label="Çözüm Oranı" value="%86" icon="check" tone="green" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-bold text-gray-900">En Çok Arızalanan Makineler</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                <th className="pb-2 font-medium">Makine</th>
                <th className="pb-2 font-medium">Arıza</th>
                <th className="pb-2 font-medium">Puan</th>
              </tr>
            </thead>
            <tbody>
              {mostFaulty.map((m) => (
                <tr key={m.name} className="border-b border-gray-50">
                  <td className="py-3 font-semibold text-gray-800">{m.name}</td>
                  <td className="py-3">
                    <Badge tone={m.faults >= 3 ? "red" : "yellow"}>{m.faults}</Badge>
                  </td>
                  <td className="py-3">
                    <StarRating value={m.rating} size="sm" readOnly />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-base font-bold text-gray-900">En Çok Şikayet Alan</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                <th className="pb-2 font-medium">Makine</th>
                <th className="pb-2 font-medium">Şikayet</th>
                <th className="pb-2 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {mostComplained.map((m) => (
                <tr key={m.name} className="border-b border-gray-50">
                  <td className="py-3 font-semibold text-gray-800">{m.name}</td>
                  <td className="py-3">
                    <Badge tone={m.complaints >= 4 ? "red" : "gray"}>{m.complaints}</Badge>
                  </td>
                  <td className="py-3">
                    <Badge tone={m.complaints >= 4 ? "red" : "green"}>
                      {m.complaints >= 4 ? "İncele" : "Normal"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
