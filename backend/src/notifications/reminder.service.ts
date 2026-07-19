import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppointmentStatus, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slotStartDate, toDateKey } from '../slots/slot-time.util';

/** Kaç dakika önce hatırlatma üretileceğinin varsayılanı. */
const DEFAULT_LEAD_MINUTES = 120;

/**
 * Yaklaşan randevular için kişisel "randevun yaklaşıyor" bildirimi üretir.
 * Her 10 dakikada bir çalışır; REMINDER_LEAD_MINUTES içinde başlayacak,
 * henüz hatırlatması üretilmemiş BOOKED randevuları bulur. @@unique(
 * [appointmentId, type]) sayesinde aynı randevu için tek bildirim üretilir.
 */
@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async generateUpcomingReminders(): Promise<number> {
    const leadMinutes = Number(this.config.get('REMINDER_LEAD_MINUTES') ?? DEFAULT_LEAD_MINUTES);
    const now = new Date();

    const candidates = await this.prisma.appointment.findMany({
      where: { status: AppointmentStatus.BOOKED },
      include: { slot: true, notifications: true },
    });

    const dueSoon = candidates.filter((a) => {
      const start = slotStartDate(toDateKey(a.slot.date), a.slot.startTime);
      const alreadyNotified = a.notifications.some(
        (n) => n.type === NotificationType.APPOINTMENT_REMINDER,
      );
      const msUntilStart = start.getTime() - now.getTime();
      // Randevu başladıktan veya bittikten sonra hatırlatma üretme.
      if (alreadyNotified || msUntilStart <= 0) return false;
      // REMINDER_LEAD_MINUTES penceresi içinde, henüz başlamamış randevular.
      return msUntilStart <= leadMinutes * 60_000;
    });

    let created = 0;
    for (const a of dueSoon) {
      try {
        await this.prisma.notification.create({
          data: {
            userId: a.userId,
            appointmentId: a.id,
            type: NotificationType.APPOINTMENT_REMINDER,
            title: 'Randevun Yaklaşıyor',
            body: `${toDateKey(a.slot.date)} tarihinde saat ${a.slot.startTime}'de randevun var.`,
          },
        });
        created += 1;
      } catch (error: unknown) {
        // Yarış durumunda aynı bildirim ikinci kez üretilebilir; unique kısıt
        // (P2002) bunu yakalar ve sessizce atlanır.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          continue;
        }
        throw error;
      }
    }

    if (created) {
      this.logger.log(`${created} randevu hatırlatması oluşturuldu`);
    }
    return created;
  }
}
