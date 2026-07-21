import { apiFetch } from "./client.js";
import { mapMachineFromApi } from "./catalog.js";

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

// ---------------------------------------------------------------------------
// Makine envanteri (admin/machines)
// ---------------------------------------------------------------------------

export async function fetchAdminMachines() {
  const rows = await apiFetch("/admin/machines");
  return (rows ?? []).map(mapMachineFromApi);
}

export async function createAdminMachine(payload) {
  const row = await apiFetch("/admin/machines", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapMachineFromApi(row);
}

export async function updateAdminMachine(id, payload) {
  const row = await apiFetch(`/admin/machines/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return mapMachineFromApi(row);
}

/** Soft-delete (isActive=false). */
export function deleteAdminMachine(id) {
  return apiFetch(`/admin/machines/${id}`, { method: "DELETE" });
}

export async function uploadAdminMachinePhoto(id, file) {
  const body = new FormData();
  body.append("photo", file);
  const row = await apiFetch(`/admin/machines/${id}/photo`, {
    method: "POST",
    body,
  });
  return mapMachineFromApi(row);
}

export async function deleteAdminMachinePhoto(id) {
  const row = await apiFetch(`/admin/machines/${id}/photo`, { method: "DELETE" });
  return mapMachineFromApi(row);
}

export async function uploadAdminMachineQr(id, file) {
  const body = new FormData();
  body.append("qr", file);
  const row = await apiFetch(`/admin/machines/${id}/qr`, {
    method: "POST",
    body,
  });
  return mapMachineFromApi(row);
}

export async function deleteAdminMachineQr(id) {
  const row = await apiFetch(`/admin/machines/${id}/qr`, { method: "DELETE" });
  return mapMachineFromApi(row);
}

