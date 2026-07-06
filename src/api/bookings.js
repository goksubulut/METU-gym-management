import { apiFetch } from "./client.js";

export function fetchSlots(date) {
  return apiFetch(`/slots?date=${date}`);
}

export function createAppointment(payload) {
  return apiFetch("/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMyAppointments() {
  return apiFetch("/appointments/me");
}

export function fetchAppointment(id) {
  return apiFetch(`/appointments/${id}`);
}

export function updateAppointment(id, payload) {
  return apiFetch(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function cancelAppointment(id) {
  return apiFetch(`/appointments/${id}`, { method: "DELETE" });
}

/** API randevusunu UI listesi formatına çevirir. */
export function mapAppointmentFromApi(a) {
  const slotAt = new Date(`${a.date}T${a.startTime}:00`);
  const isFuture = slotAt >= new Date();

  let status = "completed";
  if (a.status === "CANCELLED") status = "cancelled";
  else if (a.status === "NO_SHOW") status = "no-show";
  else if ((a.status === "BOOKED" || a.status === "CHECKED_IN") && isFuture) status = "upcoming";

  return {
    id: a.id,
    slotId: a.slotId,
    date: a.date,
    time: a.startTime,
    status,
    muscleGroups: a.muscleGroups.map((mg) => mg.id),
    machines: a.machines.map((m) => m.id),
    machineDetails: a.machines.map((m) => ({ id: m.id, name: m.name })),
    muscleGroupDetails: a.muscleGroups.map((mg) => ({ id: mg.id, name: mg.name })),
    note: a.note ?? "",
    fromApi: true,
  };
}

/** API slotunu SlotButton formatına çevirir. */
export function mapSlotFromApi(s) {
  return {
    id: s.id,
    time: s.startTime,
    booked: s.booked,
    capacity: s.capacity,
    isFull: s.isFull,
    isPast: s.isPast,
  };
}
