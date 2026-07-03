import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import {
  fromReceptionUiStatus,
  ReceptionUiStatus,
  toReceptionUiStatus,
  todayKey,
} from '../common/utils/ui-mapper.util';
import { PrismaService } from '../prisma/prisma.service';

export interface ReceptionAppointmentRow {
  id: string;
  time: string;
  name: string;
  phone: string;
  status: ReceptionUiStatus;
  muscleGroups: string[];
  machines: string[];
  note: string | null;
}

const RECEPTION_INCLUDE = {
  slot: true,
  user: { select: { name: true, phone: true } },
  machines: { include: { machine: { select: { id: true } } } },
  muscleGroups: { include: { muscleGroup: { select: { id: true } } } },
} as const;

@Injectable()
export class ReceptionService {
  constructor(private readonly prisma: PrismaService) {}

  /** Bugünün randevuları — yalnızca iptal edilmemiş kayıtlar. */
  async getTodayAppointments(): Promise<ReceptionAppointmentRow[]> {
    const today = new Date(todayKey());
    const records = await this.prisma.appointment.findMany({
      where: {
        slot: { date: today },
        status: { not: AppointmentStatus.CANCELLED },
      },
      include: RECEPTION_INCLUDE,
      orderBy: [{ slot: { startTime: 'asc' } }],
    });
    return records.map((r) => this.toRow(r));
  }

  async getAppointment(id: string): Promise<ReceptionAppointmentRow> {
    const record = await this.prisma.appointment.findFirst({
      where: {
        id,
        slot: { date: new Date(todayKey()) },
        status: { not: AppointmentStatus.CANCELLED },
      },
      include: RECEPTION_INCLUDE,
    });
    if (!record) {
      throw new NotFoundException('Bugün için randevu bulunamadı');
    }
    return this.toRow(record);
  }

  /**
   * Check-in / no-show / bekliyor güncelleme.
   * NO_SHOW → CHECKED_IN (gelmedi → geldi) desteklenir.
   */
  async updateStatus(id: string, uiStatus: ReceptionUiStatus): Promise<ReceptionAppointmentRow> {
    const record = await this.prisma.appointment.findFirst({
      where: {
        id,
        slot: { date: new Date(todayKey()) },
        status: { not: AppointmentStatus.CANCELLED },
      },
      include: RECEPTION_INCLUDE,
    });
    if (!record) {
      throw new NotFoundException('Bugün için randevu bulunamadı');
    }

    const nextStatus = fromReceptionUiStatus(uiStatus);
    this.assertTransitionAllowed(record.status, nextStatus);

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: nextStatus },
      include: RECEPTION_INCLUDE,
    });
    return this.toRow(updated);
  }

  private assertTransitionAllowed(current: AppointmentStatus, next: AppointmentStatus): void {
    if (current === AppointmentStatus.CANCELLED || current === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Bu randevunun durumu değiştirilemez');
    }
    const allowed: AppointmentStatus[] = [
      AppointmentStatus.BOOKED,
      AppointmentStatus.CHECKED_IN,
      AppointmentStatus.NO_SHOW,
    ];
    if (!allowed.includes(next)) {
      throw new BadRequestException('Geçersiz durum');
    }
  }

  private toRow(record: {
    id: string;
    status: AppointmentStatus;
    note: string | null;
    slot: { startTime: string };
    user: { name: string; phone: string | null };
    machines: { machine: { id: string } }[];
    muscleGroups: { muscleGroup: { id: string } }[];
  }): ReceptionAppointmentRow {
    return {
      id: record.id,
      time: record.slot.startTime,
      name: record.user.name,
      phone: record.user.phone ?? '—',
      status: toReceptionUiStatus(record.status),
      muscleGroups: record.muscleGroups.map((mg) => mg.muscleGroup.id),
      machines: record.machines.map((m) => m.machine.id),
      note: record.note,
    };
  }
}
