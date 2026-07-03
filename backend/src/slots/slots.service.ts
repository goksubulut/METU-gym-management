import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppointmentStatus, Slot } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { addMinutes, slotStartDate, toDateKey, todayKey } from './slot-time.util';

/** Doluluk sayımına giren durumlar: iptal ve gelmedi hariç her şey.
 *  (FR-RC-4 / FR-BK-7: doluluk = onaylanmış rezervasyon sayısı) */
export const OCCUPYING_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.BOOKED,
  AppointmentStatus.CHECKED_IN,
  AppointmentStatus.COMPLETED,
];

export interface SlotView {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  remaining: number;
  isFull: boolean;
  isPast: boolean;
}

@Injectable()
export class SlotsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Bir günün slotlarını doluluk tahminiyle döndürür (FR-BK-2, FR-BK-7).
   * Slotlar o gün için henüz açılmamışsa konfigürasyondan üretilir (lazy):
   * böylece takvim ilerledikçe elle slot açmak gerekmez.
   */
  async getForDate(dateKey: string): Promise<{ date: string; slots: SlotView[] }> {
    this.assertWithinBookingWindow(dateKey);

    const date = new Date(dateKey);
    let slots = await this.prisma.slot.findMany({
      where: { date },
      orderBy: { startTime: 'asc' },
    });
    if (slots.length === 0) {
      slots = await this.generateForDate(date);
    }

    // Tüm slotların dolulukları tek sorguda (N+1 yok)
    const counts = await this.prisma.appointment.groupBy({
      by: ['slotId'],
      where: { slotId: { in: slots.map((s) => s.id) }, status: { in: OCCUPYING_STATUSES } },
      _count: { _all: true },
    });
    const bookedBySlot = new Map(counts.map((c) => [c.slotId, c._count._all]));

    const now = new Date();
    return {
      date: dateKey,
      slots: slots.map((s) => {
        const booked = bookedBySlot.get(s.id) ?? 0;
        return {
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          capacity: s.capacity,
          booked,
          remaining: Math.max(0, s.capacity - booked),
          isFull: booked >= s.capacity,
          isPast: slotStartDate(dateKey, s.startTime) < now,
        };
      }),
    };
  }

  /** Randevu penceresi: geçmiş gün yok, bugün + BOOKING_WINDOW_DAYS ileri en fazla. */
  private assertWithinBookingWindow(dateKey: string): void {
    const today = todayKey();
    if (dateKey < today) {
      throw new BadRequestException('Geçmiş bir tarih için slot görüntülenemez');
    }
    const windowDays = Number(this.config.get('BOOKING_WINDOW_DAYS') ?? 14);
    const max = new Date();
    max.setDate(max.getDate() + windowDays - 1);
    if (dateKey > toDateKey(max)) {
      throw new BadRequestException(`En fazla ${windowDays} gün ilerisi için randevu alınabilir`);
    }
  }

  /** Açılış-kapanış saatleri arasında sabit süreli slotları üretir (2 Temmuz kararı). */
  private async generateForDate(date: Date): Promise<Slot[]> {
    const duration = Number(this.config.get('SLOT_DURATION_MINUTES') ?? 30);
    const capacity = Number(this.config.get('SLOT_CAPACITY') ?? 10);
    const openHour = Number(this.config.get('GYM_OPEN_HOUR') ?? 8);
    const closeHour = Number(this.config.get('GYM_CLOSE_HOUR') ?? 22);

    const data: { date: Date; startTime: string; endTime: string; capacity: number }[] = [];
    let start = `${String(openHour).padStart(2, '0')}:00`;
    const close = `${String(closeHour).padStart(2, '0')}:00`;
    while (addMinutes(start, duration) <= close) {
      data.push({ date, startTime: start, endTime: addMinutes(start, duration), capacity });
      start = addMinutes(start, duration);
    }

    // skipDuplicates: eşzamanlı iki istek aynı günü üretmeye kalkarsa çakışma olmaz
    await this.prisma.slot.createMany({ data, skipDuplicates: true });
    return this.prisma.slot.findMany({ where: { date }, orderBy: { startTime: 'asc' } });
  }
}
