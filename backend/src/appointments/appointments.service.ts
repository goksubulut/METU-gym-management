import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OCCUPYING_STATUSES } from '../slots/slots.service';
import { slotStartDate, toDateKey } from '../slots/slot-time.util';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

/** Randevu için "hâlâ yer kaplıyor" durumları — kapasite ve çifte kayıt kontrolünde. */
const ACTIVE_STATUSES: AppointmentStatus[] = [AppointmentStatus.BOOKED, AppointmentStatus.CHECKED_IN];

/** İstemciye dönen randevu görünümü için ortak include. */
const APPOINTMENT_INCLUDE = {
  slot: true,
  machines: { include: { machine: { select: { id: true, name: true, category: true } } } },
  muscleGroups: { include: { muscleGroup: { select: { id: true, name: true } } } },
} satisfies Prisma.AppointmentInclude;

type AppointmentRecord = Prisma.AppointmentGetPayload<{ include: typeof APPOINTMENT_INCLUDE }>;

export interface AppointmentView {
  id: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  note: string | null;
  machines: { id: string; name: string; category: string }[];
  muscleGroups: { id: string; name: string }[];
  createdAt: Date;
}

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** FR-BK-1/3/5: slot seçerek randevu; makine/kas grubu planı opsiyonel. */
  async create(userId: string, dto: CreateAppointmentDto): Promise<AppointmentView> {
    await this.assertCatalogIdsExist(dto.machineIds, dto.muscleGroupIds);

    const created = await this.runSlotTransaction(async (tx) => {
      const slot = await this.getBookableSlot(tx, dto.slotId);

      const existing = await tx.appointment.findFirst({
        where: { userId, slotId: slot.id, status: { in: ACTIVE_STATUSES } },
      });
      if (existing) {
        throw new ConflictException('Bu slotta zaten aktif bir randevunuz var');
      }
      await this.assertSlotHasCapacity(tx, slot.id, slot.capacity);

      return tx.appointment.create({
        data: {
          userId,
          slotId: slot.id,
          note: dto.note,
          machines: this.machinesCreate(dto.machineIds),
          muscleGroups: this.muscleGroupsCreate(dto.muscleGroupIds),
        },
        include: APPOINTMENT_INCLUDE,
      });
    });

    return this.toView(created);
  }

  /** FR-BK-6: kullanıcının kendi randevuları (yaklaşanlar önce). */
  async findMine(userId: string): Promise<AppointmentView[]> {
    const records = await this.prisma.appointment.findMany({
      where: { userId },
      include: APPOINTMENT_INCLUDE,
      orderBy: [{ slot: { date: 'desc' } }, { slot: { startTime: 'desc' } }],
    });
    return records.map((r) => this.toView(r));
  }

  /** Sahiplik kuralı: kullanıcı yalnızca kendi randevusunu görür;
   *  ADMIN ve RECEPTION (check-in akışı için) hepsini görebilir. */
  async findOne(userId: string, role: Role, id: string): Promise<AppointmentView> {
    const record = await this.getOwnedRecord(userId, role, id);
    return this.toView(record);
  }

  /** FR-BK-4/6: plan güncelleme; slot değişiyorsa kapasite yeniden kontrol edilir. */
  async update(userId: string, role: Role, id: string, dto: UpdateAppointmentDto): Promise<AppointmentView> {
    const record = await this.getOwnedRecord(userId, role, id);
    this.assertModifiable(record);
    this.assertNoShowReschedule(record, dto);
    await this.assertCatalogIdsExist(dto.machineIds, dto.muscleGroupIds);

    const updated = await this.runSlotTransaction(async (tx) => {
      const rescheduleNoShow = record.status === AppointmentStatus.NO_SHOW;
      const slotChanged = Boolean(dto.slotId && dto.slotId !== record.slotId);

      if (dto.slotId && (slotChanged || rescheduleNoShow)) {
        const slot = await this.getBookableSlot(tx, dto.slotId);
        if (rescheduleNoShow && dto.slotId === record.slotId) {
          throw new BadRequestException('Gelmedi randevusu için yeni bir tarih veya saat seçin');
        }
        const duplicate = await tx.appointment.findFirst({
          where: {
            userId: record.userId,
            slotId: slot.id,
            status: { in: ACTIVE_STATUSES },
            id: { not: id },
          },
        });
        if (duplicate) {
          throw new ConflictException('Bu slotta zaten aktif bir randevunuz var');
        }
        await this.assertSlotHasCapacity(tx, slot.id, slot.capacity);
      }

      // Liste alanları "komple değiştir" anlamı taşır: önce eski bağlar silinir.
      if (dto.machineIds) {
        await tx.appointmentMachine.deleteMany({ where: { appointmentId: id } });
      }
      if (dto.muscleGroupIds) {
        await tx.appointmentMuscleGroup.deleteMany({ where: { appointmentId: id } });
      }

      return tx.appointment.update({
        where: { id },
        data: {
          slotId: dto.slotId,
          note: dto.note,
          status: record.status === AppointmentStatus.NO_SHOW ? AppointmentStatus.BOOKED : undefined,
          machines: this.machinesCreate(dto.machineIds),
          muscleGroups: this.muscleGroupsCreate(dto.muscleGroupIds),
        },
        include: APPOINTMENT_INCLUDE,
      });
    });

    return this.toView(updated);
  }

  /** İptal: kayıt silinmez, durum CANCELLED olur (admin raporları geçmişi kullanır). */
  async cancel(userId: string, role: Role, id: string): Promise<AppointmentView> {
    const record = await this.getOwnedRecord(userId, role, id);
    this.assertModifiable(record);

    const cancelled = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
      include: APPOINTMENT_INCLUDE,
    });
    return this.toView(cancelled);
  }

  // ---------------------------------------------------------------------------

  /** Kapasite kontrolü yarış durumuna açıktır (iki istek aynı anda sayım yapabilir);
   *  Serializable izolasyon bunu DB seviyesinde engeller, çakışan işlem P2034 alır. */
  private async runSlotTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    try {
      return await this.prisma.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2034') {
        throw new ConflictException('Yoğunluk nedeniyle işlem tamamlanamadı, lütfen tekrar deneyin');
      }
      throw e;
    }
  }

  private async getBookableSlot(tx: Prisma.TransactionClient, slotId: string) {
    const slot = await tx.slot.findUnique({ where: { id: slotId } });
    if (!slot) {
      throw new NotFoundException('Slot bulunamadı');
    }
    if (slotStartDate(toDateKey(slot.date), slot.startTime) < new Date()) {
      throw new BadRequestException('Geçmiş bir slota randevu alınamaz');
    }
    return slot;
  }

  private async assertSlotHasCapacity(tx: Prisma.TransactionClient, slotId: string, capacity: number): Promise<void> {
    const active = await tx.appointment.count({
      where: { slotId, status: { in: OCCUPYING_STATUSES } },
    });
    if (active >= capacity) {
      throw new ConflictException('Bu slot dolu — lütfen başka bir saat seçin');
    }
  }

  private async getOwnedRecord(userId: string, role: Role, id: string): Promise<AppointmentRecord> {
    const record = await this.prisma.appointment.findUnique({ where: { id }, include: APPOINTMENT_INCLUDE });
    if (!record) {
      throw new NotFoundException('Randevu bulunamadı');
    }
    if (record.userId !== userId && role !== Role.ADMIN && role !== Role.RECEPTION) {
      // Sahibi olmayan USER için 404: başkasının randevu id'sinin varlığı bile sızmaz
      throw new NotFoundException('Randevu bulunamadı');
    }
    return record;
  }

  /** BOOKED (gelecek) veya NO_SHOW (gelmedi — yeniden planlanabilir) randevular güncellenebilir. */
  private assertModifiable(record: AppointmentRecord): void {
    if (record.status === AppointmentStatus.NO_SHOW) {
      return;
    }
    if (record.status !== AppointmentStatus.BOOKED) {
      throw new BadRequestException('Yalnızca aktif (BOOKED) randevular değiştirilebilir');
    }
    if (slotStartDate(toDateKey(record.slot.date), record.slot.startTime) < new Date()) {
      throw new BadRequestException('Saati geçmiş randevu değiştirilemez');
    }
  }

  /**
   * NO_SHOW randevusu yalnızca yeni bir slot (farklı tarih/saat) seçilerek
   * güncellenebilir. Aksi halde (slotId gönderilmemiş veya aynı slot) kayıt,
   * geçmişte kalmış eski slotuyla sessizce BOOKED'a döner — bu bir veri
   * bütünlüğü hatasıdır (update() içindeki koşulsuz status yeniden atamasına
   * karşı sınır seviyesinde savunma). UI zaten bunu engeller; bu kontrol API
   * doğrudan çağrıldığında (Swagger/curl/mobil) da kuralı zorlar.
   */
  private assertNoShowReschedule(record: AppointmentRecord, dto: UpdateAppointmentDto): void {
    if (record.status !== AppointmentStatus.NO_SHOW) {
      return;
    }
    if (!dto.slotId || dto.slotId === record.slotId) {
      throw new BadRequestException(
        'Gelmedi randevusu yalnızca yeni bir tarih/saat seçilerek düzenlenebilir',
      );
    }
  }

  /** Makine/kas grubu id'lerinin katalogda var olduğunu doğrular (400, FK hatası değil). */
  private async assertCatalogIdsExist(machineIds?: string[], muscleGroupIds?: string[]): Promise<void> {
    if (machineIds?.length) {
      const found = await this.prisma.machine.count({ where: { id: { in: machineIds } } });
      if (found !== machineIds.length) {
        throw new BadRequestException('Geçersiz makine seçimi');
      }
    }
    if (muscleGroupIds?.length) {
      const found = await this.prisma.muscleGroup.count({ where: { id: { in: muscleGroupIds } } });
      if (found !== muscleGroupIds.length) {
        throw new BadRequestException('Geçersiz kas grubu seçimi');
      }
    }
  }

  private machinesCreate(machineIds?: string[]) {
    return machineIds?.length ? { create: machineIds.map((machineId) => ({ machineId })) } : undefined;
  }

  private muscleGroupsCreate(muscleGroupIds?: string[]) {
    return muscleGroupIds?.length ? { create: muscleGroupIds.map((muscleGroupId) => ({ muscleGroupId })) } : undefined;
  }

  private toView(record: AppointmentRecord): AppointmentView {
    return {
      id: record.id,
      slotId: record.slotId,
      date: toDateKey(record.slot.date),
      startTime: record.slot.startTime,
      endTime: record.slot.endTime,
      status: record.status,
      note: record.note,
      machines: record.machines.map((m) => m.machine),
      muscleGroups: record.muscleGroups.map((mg) => mg.muscleGroup),
      createdAt: record.createdAt,
    };
  }
}
