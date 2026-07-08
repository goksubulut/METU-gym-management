import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slotEndDate, toDateKey } from '../slots/slot-time.util';

/**
 * Slot saati geçmiş ama hâlâ BOOKED kalan (resepsiyon hiç işaretlememiş)
 * randevuları otomatik NO_SHOW'a çevirir.
 *
 * Ürün kararı: resepsiyon check-in yapmadıysa kişi de büyük olasılıkla
 * gelmemiştir → temkinli varsayımla NO_SHOW. CHECKED_IN / NO_SHOW /
 * CANCELLED / COMPLETED kayıtlara dokunmaz; yalnızca "hiç işaretlenmemiş"
 * geçmiş BOOKED kayıtları kapatır. Böylece admin devam/gelmedi oranları
 * geçmişte kalmış "aktif" hayalet randevularla bozulmaz.
 */
@Injectable()
export class AppointmentReconciliationService {
  private readonly logger = new Logger(AppointmentReconciliationService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async closeStaleBookedAppointments(): Promise<number> {
    const now = new Date();
    const candidates = await this.prisma.appointment.findMany({
      where: { status: AppointmentStatus.BOOKED },
      include: { slot: true },
    });

    const staleIds = candidates
      .filter((a) => slotEndDate(toDateKey(a.slot.date), a.slot.endTime) < now)
      .map((a) => a.id);
    if (staleIds.length === 0) {
      return 0;
    }

    await this.prisma.appointment.updateMany({
      where: { id: { in: staleIds } },
      data: { status: AppointmentStatus.NO_SHOW },
    });
    this.logger.log(`${staleIds.length} geçmiş randevu otomatik NO_SHOW yapıldı`);
    return staleIds.length;
  }
}
