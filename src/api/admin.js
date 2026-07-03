import { apiFetch } from "./client.js";

export function fetchAdminDashboard() {
  return apiFetch("/admin/analytics/dashboard");
}

export function fetchAdminPreferences(days = 30) {
  return apiFetch(`/admin/analytics/preferences?days=${days}`);
}

export function fetchAdminQuality() {
  return apiFetch("/admin/analytics/quality");
}

export function fetchAdminMatrix() {
  return apiFetch("/admin/analytics/matrix");
}

export function fetchAdminOccupancy(period = "daily") {
  return apiFetch(`/admin/analytics/occupancy?period=${period}`);
}

export function fetchAdminFaults() {
  return apiFetch("/admin/faults");
}

export function updateAdminFaultStatus(id, status) {
  return apiFetch(`/admin/faults/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function fetchAdminSuggestions() {
  return apiFetch("/admin/suggestions");
}
