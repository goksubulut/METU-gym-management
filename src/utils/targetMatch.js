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

export function sharedTargetCount(item, selectedSlugs) {
  if (!selectedSlugs?.length) return 0;
  return (item.targetMuscles ?? []).filter((t) => selectedSlugs.includes(t)).length;
}

/** Uzmanlar (ortak hedef > 0) önde; eşleşmeyen kaba-grup öğeleri ayrı. */
export function splitByTargetMatch(items, selectedSlugs) {
  const sorted = sortByTargetMatch(items, selectedSlugs);
  if (!selectedSlugs?.length) return { matched: sorted, other: [] };
  const matched = [];
  const other = [];
  for (const item of sorted) {
    if (sharedTargetCount(item, selectedSlugs) > 0) matched.push(item);
    else other.push(item);
  }
  return { matched, other };
}

/**
 * Tek düz liste: önce ince hedef, sonra kaba grup, sonra isim.
 * Filtre yok — tüm katalog durur.
 */
export function sortByFineThenCoarse(items, selectedSlugs, muscleMap) {
  if (!selectedSlugs?.length) return items;
  const groups = [...new Set(selectedSlugs.map((s) => muscleMap[s]?.group).filter(Boolean))];
  const coarse = (item) => (item.muscles ?? []).filter((g) => groups.includes(g)).length;
  const ratio = (item) => {
    const count = sharedTargetCount(item, selectedSlugs);
    const total = (item.targetMuscles ?? []).length;
    return total > 0 ? count / total : 0;
  };
  return [...items].sort(
    (a, b) =>
      ratio(b) - ratio(a) ||
      sharedTargetCount(b, selectedSlugs) - sharedTargetCount(a, selectedSlugs) ||
      coarse(b) - coarse(a) ||
      a.name.localeCompare(b.name, "tr"),
  );
}
