import { apiFetch } from "./client.js";

export function mapProgramItemFromApi(item) {
  return {
    id: item.id,
    sortOrder: item.sortOrder,
    itemType: item.itemType,
    machineId: item.machineId ?? null,
    exerciseId: item.exerciseId ?? null,
    name: item.name,
    exerciseType: item.exerciseType ?? null,
    unavailable: item.unavailable ?? false,
  };
}

export function mapProgramFromApi(p) {
  return {
    id: p.id,
    name: p.name,
    itemCount: p.itemCount,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    items: (p.items ?? []).map(mapProgramItemFromApi),
  };
}

export function fetchMyPrograms() {
  return apiFetch("/programs/me").then((rows) => rows.map(mapProgramFromApi));
}

export function fetchProgram(id) {
  return apiFetch(`/programs/${id}`).then(mapProgramFromApi);
}

export function createProgram({ name, items }) {
  return apiFetch("/programs", {
    method: "POST",
    body: JSON.stringify({ name, items }),
  }).then(mapProgramFromApi);
}

export function updateProgram(id, payload) {
  return apiFetch(`/programs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then(mapProgramFromApi);
}

export function deleteProgram(id) {
  return apiFetch(`/programs/${id}`, { method: "DELETE" });
}

/** API'ye gönderilecek öğe listesi (sıra dizideki konum). */
export function toApiItems(draftItems) {
  return draftItems.map((item) => {
    if (item.itemType === "MACHINE") {
      return { itemType: "MACHINE", machineId: item.machineId };
    }
    return { itemType: "EXERCISE", exerciseId: item.exerciseId };
  });
}
