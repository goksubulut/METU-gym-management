/**
 * Seçilen ince kaslara göre isabet sıralaması.
 * Özel (az hedefli) makineler genelcilere göre öne gelir: Abdominal Crunch,
 * Functional Trainer'dan önce. Paylaşma oranı = ortak hedef / makinenin
 * toplam hedefi. Eşitlikte ortak hedef sayısı, sonra isteğe bağlı puan.
 */
export function sortByTargetMatch(items, selectedSlugs, { useRating = false } = {}) {
  if (!selectedSlugs?.length) return items;
  const shared = (item) => (item.targetMuscles ?? []).filter((t) => selectedSlugs.includes(t));
  const ratio = (item) => {
    const count = shared(item).length;
    const total = (item.targetMuscles ?? []).length;
    return total > 0 ? count / total : 0;
  };
  return [...items].sort(
    (a, b) =>
      ratio(b) - ratio(a) ||
      shared(b).length - shared(a).length ||
      (useRating ? (b.rating ?? 0) - (a.rating ?? 0) : 0) ||
      a.name.localeCompare(b.name, "tr"),
  );
}

/** Grup başlığı altındaki listede yalnızca o grubun seçili ince kasları sayılsın. */
export function slugsForGroup(selectedSlugs, groupId, muscleMap) {
  return selectedSlugs.filter((s) => muscleMap[s]?.group === groupId);
}
