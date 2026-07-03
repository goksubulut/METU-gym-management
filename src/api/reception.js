import { apiFetch } from "./client.js";

export function fetchTodayAppointments() {
  return apiFetch("/reception/appointments/today");
}

export function fetchReceptionAppointment(id) {
  return apiFetch(`/reception/appointments/${id}`);
}

export function updateReceptionStatus(id, status) {
  return apiFetch(`/reception/appointments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
