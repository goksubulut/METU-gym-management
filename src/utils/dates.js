const TR_DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

/** Bugün dahil önümüzdeki N gün — gerçek takvimden üretilir. */
export function upcomingDates(count = 7) {
  const out = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    out.push({
      key: formatDateKey(d),
      day: TR_DAYS[d.getDay()],
      date: d.getDate(),
      month: d.toLocaleDateString("tr-TR", { month: "short" }),
      isToday: i === 0,
    });
  }
  return out;
}

export function formatDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey() {
  return formatDateKey(new Date());
}

/** Randevu penceresi; mevcut randevu tarihi listede yoksa eklenir (düzenleme ekranı). */
export function bookingDates(count = 14, ensureKey) {
  const dates = upcomingDates(count);
  if (ensureKey && !dates.some((d) => d.key === ensureKey)) {
    const d = new Date(`${ensureKey}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d >= today) {
      dates.push({
        key: ensureKey,
        day: TR_DAYS[d.getDay()],
        date: d.getDate(),
        month: d.toLocaleDateString("tr-TR", { month: "short" }),
        isToday: ensureKey === formatDateKey(new Date()),
      });
      dates.sort((a, b) => a.key.localeCompare(b.key));
    }
  }
  return dates;
}
