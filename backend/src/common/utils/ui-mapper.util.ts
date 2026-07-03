import { AppointmentStatus, FaultSeverity, FaultStatus } from '@prisma/client';

/** Frontend resepsiyon paneli durumları ↔ Prisma AppointmentStatus */
export type ReceptionUiStatus = 'pending' | 'checked-in' | 'no-show';

export function toReceptionUiStatus(status: AppointmentStatus): ReceptionUiStatus {
  switch (status) {
    case AppointmentStatus.CHECKED_IN:
    case AppointmentStatus.COMPLETED:
      return 'checked-in';
    case AppointmentStatus.NO_SHOW:
      return 'no-show';
    default:
      return 'pending';
  }
}

export function fromReceptionUiStatus(status: ReceptionUiStatus): AppointmentStatus {
  switch (status) {
    case 'checked-in':
      return AppointmentStatus.CHECKED_IN;
    case 'no-show':
      return AppointmentStatus.NO_SHOW;
    default:
      return AppointmentStatus.BOOKED;
  }
}

export function toFaultSeverityUi(severity: FaultSeverity): 'low' | 'medium' | 'high' {
  return severity.toLowerCase() as 'low' | 'medium' | 'high';
}

export function toFaultStatusUi(
  status: FaultStatus,
): 'pending' | 'open' | 'in-progress' | 'resolved' {
  switch (status) {
    case FaultStatus.PENDING:
      return 'pending';
    case FaultStatus.IN_PROGRESS:
      return 'in-progress';
    case FaultStatus.RESOLVED:
      return 'resolved';
    default:
      return 'open';
  }
}

export function fromFaultStatusUi(status: 'open' | 'in-progress' | 'resolved'): FaultStatus {
  switch (status) {
    case 'in-progress':
      return FaultStatus.IN_PROGRESS;
    case 'resolved':
      return FaultStatus.RESOLVED;
    default:
      return FaultStatus.OPEN;
  }
}

/** Kullanıcı adından kısa bildiren etiketi: "Ahmet Yılmaz" → "Ahmet Y." */
export function shortReporterName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

const TR_DAY = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'] as const;

export function turkishDayLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  return TR_DAY[d.getDay()];
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Bugünün 'YYYY-MM-DD' karşılığı (yerel saat). */
export function todayKey(): string {
  return formatDateKey(new Date());
}

export function addDaysToKey(dateKey: string, offset: number): string {
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() + offset);
  return formatDateKey(d);
}
