// Katalog uçları (makine / kas grubu / egzersiz / öneri motoru).
// Uçlar @Public — token gerekmez; QR üretimi hariç (admin).
import { apiFetch } from "./client.js";

/** API makine kaydını frontend'in mock'tan gelen sözleşmesine çevirir. */
export function mapMachineFromApi(m) {
  return {
    id: m.id,
    name: m.name,
    category: m.category,
    muscles: (m.muscleGroups ?? []).map((g) => g.id),
    targetMuscles: m.targetMuscles ?? [],
    rating: m.rating ?? 0,
    reviews: m.reviews ?? 0,
    location: m.location,
    hasVideo: m.hasVideo ?? false,
    faults: m.openFaults ?? 0,
    description: m.description ?? "",
    tips: m.tips ?? "",
    photoUrl: m.photoUrl ?? null,
  };
}

/** FR-CAT-1/2: makine listesi; opsiyonel kategori / kas grubu filtresi. */
export async function fetchMachines({ category, muscleGroup } = {}) {
  const params = new URLSearchParams();
  if (category && category !== "Tümü") params.set("category", category);
  if (muscleGroup) params.set("muscleGroup", muscleGroup);
  const qs = params.toString();
  const rows = await apiFetch(`/machines${qs ? `?${qs}` : ""}`);
  return rows.map(mapMachineFromApi);
}

/** Makine detayı (videolar + QR deep-link dahil). */
export async function fetchMachine(id) {
  const m = await apiFetch(`/machines/${id}`);
  return { ...mapMachineFromApi(m), videos: m.videos ?? [], qrCode: m.qrCode };
}

/** FR-RC-1..4: öneri motoru — alternatif makineler + egzersizler. */
export async function fetchAlternatives(id, slotId) {
  const qs = slotId ? `?slotId=${encodeURIComponent(slotId)}` : "";
  const data = await apiFetch(`/machines/${id}/alternatives${qs}`);
  return {
    machine: data.machine,
    noDirectMatch: data.noDirectMatch ?? false,
    alternativeMachines: data.alternativeMachines.map(mapMachineFromApi),
    alternativeExercises: data.alternativeExercises,
  };
}

/** FR-CAT-3 / FR-WU-1: kas grubunun makineleri + tipe göre gruplu egzersizleri. */
export function fetchMuscleGroupDetail(id) {
  return apiFetch(`/muscle-groups/${id}`);
}

/** FR-QR-2/3: makine QR'ı (PNG data-URL) — yalnızca admin token'ıyla çalışır. */
export function fetchMachineQr(id) {
  return apiFetch(`/qr/machines/${id}`);
}

/** API egzersiz kaydını frontend sözleşmesine çevirir (mapMachineFromApi ile aynı desen). */
export function mapExerciseFromApi(e) {
  return {
    id: e.id,
    name: e.name,
    type: e.type,
    instructions: e.instructions ?? "",
    duration: e.duration ?? null,
    videoUrl: e.videoUrl ?? null,
    muscles: (e.muscleGroups ?? []).map((g) => g.id),
  };
}

/** Egzersiz listesi; opsiyonel tip / kas grubu filtresi (FR-WU-1). */
export async function fetchExercises({ type, muscleGroup } = {}) {
  const params = new URLSearchParams();
  if (type && type !== "Tümü") params.set("type", type);
  if (muscleGroup) params.set("muscleGroup", muscleGroup);
  const qs = params.toString();
  const rows = await apiFetch(`/exercises${qs ? `?${qs}` : ""}`);
  return rows.map(mapExerciseFromApi);
}

/** Egzersiz detayı — kendi katalog ekranı için. */
export async function fetchExercise(id) {
  const e = await apiFetch(`/exercises/${id}`);
  return mapExerciseFromApi(e);
}
