import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface NotificationView {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  appointmentId: string;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Kullanıcının kendi bildirimleri, en yeni önce. */
  async findMine(userId: string): Promise<NotificationView[]> {
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toView(r));
  }

  /** Okundu işaretle. Sahiplik kuralı: başkasının bildirimi 404 (varlık sızmaz). */
  async markRead(userId: string, id: string): Promise<NotificationView> {
    const existing = await this.prisma.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Bildirim bulunamadı');
    }
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return this.toView(updated);
  }

  private toView(row: Notification): NotificationView {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      isRead: row.isRead,
      appointmentId: row.appointmentId,
      createdAt: row.createdAt,
    };
  }
}
