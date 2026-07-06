import { announcements as mockAnnouncements } from "../mock/announcements.js";
import { apiFetch, mergeById } from "./client.js";

export function fetchAnnouncements() {
  return apiFetch("/announcements");
}

/** Aktif duyurular — mock + API (admin ile aynı birleştirme, yalnızca yayında olanlar). */
export async function loadActiveAnnouncements() {
  try {
    const apiRows = await fetchAnnouncements();
    return mergeById(mockAnnouncements, apiRows).filter((a) => a.isActive !== false);
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
