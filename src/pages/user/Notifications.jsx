import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Spinner from "../../components/Spinner.jsx";
import Icon from "../../components/Icon.jsx";
import { CATEGORY_LABELS, CATEGORY_TONES } from "../../mock/announcements.js";
import { getAccessToken } from "../../api/client.js";
import { loadActiveAnnouncements } from "../../api/announcements.js";
import { markAnnouncementsRead } from "../../utils/announcementRead.js";

export default function Notifications() {
  const nav = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      nav("/auth");
      return;
    }
    setLoading(true);
    try {
      const rows = await loadActiveAnnouncements();
      setList(rows);
      markAnnouncementsRead(rows.map((a) => a.id));
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [nav]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="px-4 py-5">
      <h1 className="mb-1 text-xl font-extrabold text-gray-900">Bildirimler</h1>
      <p className="mb-5 text-sm text-gray-500">Salon duyuruları ve önemli güncellemeler</p>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner />
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon="bell" title="Henüz duyuru yok" />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600">
                    <Icon name="bell" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(`${a.date}T12:00:00`).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Badge tone={CATEGORY_TONES[a.category] ?? "gray"}>
                  {CATEGORY_LABELS[a.category] ?? a.category}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">{a.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
