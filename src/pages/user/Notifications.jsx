import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import Icon from "../../components/Icon.jsx";
import { CATEGORY_LABELS, CATEGORY_TONES } from "../../mock/announcements.js";
import { getAccessToken } from "../../api/client.js";
import { loadActiveAnnouncements } from "../../api/announcements.js";
import { loadMyNotifications, markNotificationRead } from "../../api/notifications.js";
import { markAnnouncementsRead } from "../../utils/announcementRead.js";

/** İki kaynağı (duyuru + kişisel bildirim) tek listeye normalize eder. */
function toItems(announcements, personal) {
  const annItems = announcements.map((a) => ({
    kind: "announcement",
    id: `ann-${a.id}`,
    title: a.title,
    body: a.body,
    category: a.category,
    ts: new Date(`${a.date}T12:00:00`).getTime(),
  }));
  const personalItems = personal.map((n) => ({
    kind: "personal",
    id: `notif-${n.id}`,
    title: n.title,
    body: n.body,
    ts: new Date(n.createdAt).getTime(),
  }));
  return [...annItems, ...personalItems].sort((a, b) => b.ts - a.ts);
}

export default function Notifications() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      nav("/auth");
      return;
    }
    setLoading(true);
    try {
      const [announcements, personal] = await Promise.all([
        loadActiveAnnouncements(),
        loadMyNotifications(),
      ]);
      setItems(toItems(announcements, personal));

      // Görüntülenince her iki kaynak da okundu sayılır:
      // duyurular istemci-taraflı, kişisel bildirimler sunucu-taraflı.
      markAnnouncementsRead(announcements.map((a) => a.id));
      await Promise.all(
        personal.filter((n) => !n.isRead).map((n) => markNotificationRead(n.id).catch(() => {})),
      );
    } catch {
      setItems([]);
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
      <p className="mb-5 text-sm text-gray-500">Randevu hatırlatmaları ve salon duyuruları</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-4/5" />
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="bell" title="Henüz bildirim yok" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                      item.kind === "personal"
                        ? "bg-green-50 text-green-600"
                        : "bg-primary-50 text-primary-600"
                    }`}
                  >
                    <Icon name={item.kind === "personal" ? "calendar" : "bell"} size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.ts).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {item.kind === "personal" ? (
                  <Badge tone="green">Hatırlatma</Badge>
                ) : (
                  <Badge tone={CATEGORY_TONES[item.category] ?? "gray"}>
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </Badge>
                )}
              </div>
              <p className="text-sm leading-relaxed text-gray-600">{item.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
