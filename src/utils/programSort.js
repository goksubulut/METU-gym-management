/** Isınma → makine/ana egzersiz → soğuma sıralaması. */
export function sortProgramItems(items) {
  const rank = (item) => {
    if (item.itemType === "MACHINE") return 1;
    const t = item.exerciseType;
    if (t === "WARMUP") return 0;
    if (t === "COOLDOWN") return 2;
    return 1;
  };

  return [...items].sort((a, b) => rank(a) - rank(b));
}
