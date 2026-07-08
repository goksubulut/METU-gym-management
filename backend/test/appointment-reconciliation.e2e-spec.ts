import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentStatus } from '@prisma/client';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AppointmentReconciliationService } from './../src/appointments/appointment-reconciliation.service';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Bug 1.2: Slot saati geçmiş ama hâlâ BOOKED kalan randevular saatlik iş
 * tarafından NO_SHOW'a çevrilir; diğer durumlara ve gelecekteki randevulara
 * dokunulmaz. Cron beklemeden servisi doğrudan çağırarak doğrularız.
 */
describe('Appointment reconciliation (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let service: AppointmentReconciliationService;
  let userId: string;

  const email = 'e2e-reconcile@metugym.local';
  const slotIds: string[] = [];
  const apptIds: string[] = [];

  /** Belirtilen tarih için verilen saatte bir slot oluşturur (geçmiş/gelecek). */
  async function makeSlot(dateKey: string, startTime: string, endTime: string): Promise<string> {
    const slot = await prisma.slot.create({
      data: { date: new Date(`${dateKey}T00:00:00.000Z`), startTime, endTime, capacity: 10 },
    });
    slotIds.push(slot.id);
    return slot.id;
  }

  async function makeAppointment(slotId: string, status: AppointmentStatus): Promise<string> {
    const appt = await prisma.appointment.create({
      data: { userId, slotId, status },
    });
    apptIds.push(appt.id);
    return appt.id;
  }

  function dayKey(offset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }

  async function cleanup(): Promise<void> {
    await prisma.appointment.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    if (slotIds.length) {
      await prisma.slot.deleteMany({ where: { id: { in: slotIds } } });
    }
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    service = app.get(AppointmentReconciliationService);

    await cleanup();
    const user = await prisma.user.create({
      data: { name: 'Reconcile Testi', email, passwordHash: 'x', role: 'USER' },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  it('geçmiş BOOKED randevuyu NO_SHOW yapar; geleceği ve diğer durumları değiştirmez', async () => {
    const past = dayKey(-2);
    const future = dayKey(2);

    // Izgara dışı dakikalar (:03/:07): seed'in standart slot ızgarasıyla
    // @@unique([date, startTime]) çakışmasını önler.
    const staleBookedSlot = await makeSlot(past, '08:03', '08:33');
    const staleBooked = await makeAppointment(staleBookedSlot, AppointmentStatus.BOOKED);

    const futureBookedSlot = await makeSlot(future, '08:03', '08:33');
    const futureBooked = await makeAppointment(futureBookedSlot, AppointmentStatus.BOOKED);

    const checkedInSlot = await makeSlot(past, '09:03', '09:33');
    const checkedIn = await makeAppointment(checkedInSlot, AppointmentStatus.CHECKED_IN);

    const noShowSlot = await makeSlot(past, '10:03', '10:33');
    const noShow = await makeAppointment(noShowSlot, AppointmentStatus.NO_SHOW);

    const cancelledSlot = await makeSlot(past, '11:03', '11:33');
    const cancelled = await makeAppointment(cancelledSlot, AppointmentStatus.CANCELLED);

    const completedSlot = await makeSlot(past, '12:03', '12:33');
    const completed = await makeAppointment(completedSlot, AppointmentStatus.COMPLETED);

    const changed = await service.closeStaleBookedAppointments();
    expect(changed).toBeGreaterThanOrEqual(1);

    const byId = async (id: string) =>
      (await prisma.appointment.findUnique({ where: { id } }))?.status;

    expect(await byId(staleBooked)).toBe('NO_SHOW'); // geçmiş BOOKED → NO_SHOW
    expect(await byId(futureBooked)).toBe('BOOKED'); // gelecek → dokunulmaz
    expect(await byId(checkedIn)).toBe('CHECKED_IN');
    expect(await byId(noShow)).toBe('NO_SHOW');
    expect(await byId(cancelled)).toBe('CANCELLED');
    expect(await byId(completed)).toBe('COMPLETED');
  });

  it('ikinci çalıştırmada değiştirilecek geçmiş BOOKED kalmaz (idempotent)', async () => {
    const changed = await service.closeStaleBookedAppointments();
    // Bu test kullanıcısına ait geçmiş BOOKED kalmadı; başka veri varsa da
    // aynı kaydı tekrar değiştirmez (NO_SHOW artık BOOKED değil).
    const stillStale = await prisma.appointment.findMany({
      where: { user: { email }, status: 'BOOKED', slot: { date: { lt: new Date() } } },
    });
    expect(stillStale).toHaveLength(0);
    expect(typeof changed).toBe('number');
  });
});
