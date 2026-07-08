import { apiFetch, getAccessToken } from "./client.js";

/** Olay adı: kişisel bildirim okundu işaretlenince zil göstergesi güncellensin. */
export const NOTIFICATIONS_READ_EVENT = "notifications-read";

/** Kişisel bildirimlerim (en yeni önce). Hata/oturumsuz durumda boş liste. */
export async function loadMyNotifications() {
  if (!getAccessToken()) return [];
  try {
    const rows = await apiFetch("/notifications/me");
    return rows ?? [];
  } catch {
    return [];
  }
}

/** Bir bildirimi okundu işaretle; zil göstergesinin tazelenmesi için olay yay. */
export async function markNotificationRead(id) {
  const result = await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_READ_EVENT));
  return result;
}

/** Okunmamış kişisel bildirim var mı? */
export function hasUnreadNotifications(list) {
  return list.some((n) => !n.isRead);
}
