import { apiFetch } from "./client.js";

export function createRating(machineId, score, tags = []) {
  return apiFetch("/feedback/ratings", {
    method: "POST",
    body: JSON.stringify({
      machineId,
      score,
      ...(tags.length > 0 ? { tags } : {}),
    }),
  });
}

export function createFault(machineId, description, severity) {
  const map = { low: "LOW", medium: "MEDIUM", high: "HIGH" };
  return apiFetch("/feedback/faults", {
    method: "POST",
    body: JSON.stringify({
      machineId,
      description,
      severity: map[severity] ?? "MEDIUM",
    }),
  });
}

export function createSuggestion(type, tag, text) {
  const map = { Öneri: "SUGGESTION", Şikayet: "COMPLAINT" };
  return apiFetch("/feedback/suggestions", {
    method: "POST",
    body: JSON.stringify({
      type: map[type] ?? "SUGGESTION",
      tag,
      text,
    }),
  });
}
