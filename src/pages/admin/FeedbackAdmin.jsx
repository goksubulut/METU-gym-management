import { useCallback, useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Tabs from "../../components/Tabs.jsx";
import { feedbackList as mockFeedback, } from "../../mock/feedback.js";
import { CHART_COLORS, feedbackTags as mockTags } from "../../mock/analytics.js";
import { fetchAdminSuggestions } from "../../api/admin.js";

export default function FeedbackAdmin() {
  const [type, setType] = useState("all");
  const [list, setList] = useState(mockFeedback);
  const [tags, setTags] = useState(mockTags);

  const load = useCallback(async () => {
    try {
      // API başarılıysa tek kaynak; mock ile birleştirmek kayıtları çiftliyordu.
      const { feedbackList, feedbackTags } = await fetchAdminSuggestions();
      setList(feedbackList ?? []);
      setTags(feedbackTags ?? []);
    } catch {
      setList(mockFeedback);
      setTags(mockTags);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = list.filter((f) => type === "all" || f.type === type);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Geri Bildirim Yönetimi</h1>
        <p className="text-sm text-gray-400">Öneri ve şikayetler, etiket dağılımı</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Öneri / Şikayet</h2>
            <Tabs
              tabs={[
                { value: "all", label: "Tümü" },
                { value: "Öneri", label: "Öneri" },
                { value: "Şikayet", label: "Şikayet" },
              ]}
              active={type}
              onChange={setType}
            />
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-400">
              <tr className="border-b border-gray-100">
                <th className="pb-2 font-medium">Tür</th>
                <th className="pb-2 font-medium">Konu</th>
                <th className="pb-2 font-medium">Mesaj</th>
                <th className="pb-2 font-medium">Kullanıcı</th>
                <th className="pb-2 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="border-b border-gray-50">
                  <td className="py-3">
                    <Badge tone={f.type === "Öneri" ? "blue" : "red"}>{f.type}</Badge>
                  </td>
                  <td className="py-3">
                    <Badge tone="gray">{f.tag}</Badge>
                  </td>
                  <td className="max-w-xs truncate py-3 text-gray-600">{f.text}</td>
                  <td className="py-3 text-gray-500">{f.user}</td>
                  <td className="py-3 text-gray-400">{f.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-base font-bold text-gray-900">Etiket Dağılımı</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={tags}
                dataKey="value"
                nameKey="tag"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(e) => e.tag}
              >
                {tags.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
