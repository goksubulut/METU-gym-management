import { announcements as mockAnnouncements } from "../mock/announcements.js";
import { apiFetch } from "./client.js";

export function fetchAnnouncements() {
  return apiFetch("/announcements");
}

/** Aktif duyurular. API kayıtları kaynak kabul edilir (seed'de mock duyurular da
 *  bulunduğundan mock ile birleştirmek çift kayıt üretiyordu). Mock yalnızca API
 *  boşsa/erişilemezse fallback olarak kullanılır. */
export async function loadActiveAnnouncements() {
  try {
    const apiRows = await fetchAnnouncements();
    const active = (apiRows ?? []).filter((a) => a.isActive !== false);
    if (active.length) return active;
    return mockAnnouncements.filter((a) => a.isActive !== false);
  } catch {
    return mockAnnouncements.filter((a) => a.isActive !== false);
  }
}

export function fetchAdminAnnouncements() {
  return apiFetch("/admin/announcements");
}

export function createAdminAnnouncement(payload) {
  return apiFetch("/admin/announcements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminAnnouncement(id, payload) {
  return apiFetch(`/admin/announcements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminAnnouncement(id) {
  return apiFetch(`/admin/announcements/${id}`, { method: "DELETE" });
}

/** API kategori → form değeri (Prisma enum). */
export function categoryToApi(category) {
  const map = { price: "PRICE", general: "GENERAL", event: "EVENT" };
  return map[category] ?? "GENERAL";
}
