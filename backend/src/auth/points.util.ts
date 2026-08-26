export const POINTS_PER_COMPLETED = 50;
export const POINTS_PER_STREAK_WEEK = 25;
export const DEMO_POINTS = 200;

export interface PointsResult {
  points: number;
  pointsIsDemo: boolean;
}

function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Haftanın pazartesi anahtarı (takvim günü; Slot.date YYYY-MM-DD ile uyumlu). */
export function mondayKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const day = new Date(utc).getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(utc);
  monday.setUTCDate(monday.getUTCDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function shiftWeek(dateKey: string, weeks: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() + weeks * 7);
  return utc.toISOString().slice(0, 10);
}

/** Heatmap ile aynı kural: bu haftadan geriye ardışık dolu haftalar. */
export function currentStreakWeeks(completedDateKeys: string[], today = new Date()): number {
  const weeks = new Set(completedDateKeys.map((k) => mondayKey(k)));
  let streak = 0;
  let cursor = mondayKey(localDateKey(today));
  while (weeks.has(cursor)) {
    streak += 1;
    cursor = shiftWeek(cursor, -1);
  }
  return streak;
}

/**
 * raw = completedCount * 50 + streakWeeks * 25
 * raw === 0 → demo 200 (sunum; DEMO.md).
 */
export function computePoints(completedDateKeys: string[], today = new Date()): PointsResult {
  const uniqueKeys = [...new Set(completedDateKeys)];
  const streakWeeks = currentStreakWeeks(uniqueKeys, today);
  const raw = uniqueKeys.length * POINTS_PER_COMPLETED + streakWeeks * POINTS_PER_STREAK_WEEK;
  if (raw === 0) {
    return { points: DEMO_POINTS, pointsIsDemo: true };
  }
  return { points: raw, pointsIsDemo: false };
}
