/** Slot tarih/saat yardımcıları — hem SlotsService hem AppointmentsService kullanır. */

/** 'YYYY-MM-DD' biçim kontrolü (DTO'daki regex'e ek güvence). */
export const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Date → 'YYYY-MM-DD' (UTC; Slot.date @db.Date olarak UTC gece yarısı tutulur). */
export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Bugünün 'YYYY-MM-DD' karşılığı (yerel saat). */
export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** "08:00" + 30 → "08:30" */
export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Slotun gerçek başlangıç anı (yerel saat) — geçmiş slot kontrolü için. */
export function slotStartDate(dateKey: string, startTime: string): Date {
  return new Date(`${dateKey}T${startTime}:00`);
}

/** Slotun gerçek bitiş anı (yerel saat) — otomatik sonuçlandırma için. */
export function slotEndDate(dateKey: string, endTime: string): Date {
  return new Date(`${dateKey}T${endTime}:00`);
}
