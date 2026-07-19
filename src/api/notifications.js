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

const GYM_UTC_OFFSET = "+03:00";

/** Hatırlatma metninden randevu başlangıç anını çıkarır. */
function appointmentStartFromReminderBody(body) {
  const match = body?.match(/(\d{4}-\d{2}-\d{2}) tarihinde saat (\d{2}:\d{2})/);
  if (!match) return null;
  return new Date(`${match[1]}T${match[2]}:00${GYM_UTC_OFFSET}`);
}

/** Randevu saati geçmiş hatırlatmalar artık gösterilmez / okunmamış sayılmaz. */
export function isExpiredAppointmentReminder(notification) {
  const start = appointmentStartFromReminderBody(notification?.body);
  return start ? start.getTime() < Date.now() : false;
}

/** Okunmamış kişisel bildirim var mı? */
export function hasUnreadNotifications(list) {
  return list.some((n) => !n.isRead && !isExpiredAppointmentReminder(n));
}
