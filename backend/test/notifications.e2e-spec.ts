import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentStatus } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';
import { ReminderService } from './../src/notifications/reminder.service';
import { PrismaService } from './../src/prisma/prisma.service';

const GYM_TIMEZONE = 'Europe/Istanbul';

/** offsetMinutes sonra başlayan slot — salon saat diliminde (CI UTC olsa da tutarlı). */
function slotAt(offsetMinutes: number): { dateKey: string; startTime: string; endTime: string } {
  const target = new Date(Date.now() + offsetMinutes * 60_000);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: GYM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .formatToParts(target)
      .map(({ type, value }) => [type, value]),
  ) as Record<string, string>;

  let hh = Number(parts.hour);
  let mm = Number(parts.minute);
  if (mm % 30 === 0) mm += 7;

  const dateKey = `${parts.year}-${parts.month}-${parts.day}`;
  const startTime = `${String(hh).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`;
  const endTotal = hh * 60 + mm + 5;
  const endTime = `${String(Math.floor(endTotal / 60) % 24).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`;
  return { dateKey, startTime, endTime };
}

/**
 * Ürün eksiği 3 (Faz 1): randevu hatırlatma bildirimi. Pencere içinde
 * (REMINDER_LEAD_MINUTES) başlayacak BOOKED randevu için bir kez bildirim
 * üretilir; pencere dışı ve geçmiş randevular için üretilmez; ikinci
 * çalıştırmada tekrar üretilmez. Cron beklemeden servis doğrudan çağrılır.
 */
describe('Appointment reminder notifications (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let reminder: ReminderService;

  const user = { name: 'Bildirim Testi', email: 'e2e-notif@metugym.local', password: 'Parola1234' };
  const other = { name: 'Diğer', email: 'e2e-notif-2@metugym.local', password: 'Parola1234' };
  const emails = [user.email, other.email];

  let token = '';
  let otherToken = '';
  let userId = '';
  const slotIds: string[] = [];

  async function makeBookedAppointment(offsetMinutes: number): Promise<string> {
    const { dateKey, startTime, endTime } = slotAt(offsetMinutes);
    const slot = await prisma.slot.create({
      data: { date: new Date(`${dateKey}T00:00:00.000Z`), startTime, endTime, capacity: 10 },
    });
    slotIds.push(slot.id);
    const appt = await prisma.appointment.create({
      data: { userId, slotId: slot.id, status: AppointmentStatus.BOOKED },
    });
    return appt.id;
  }

  async function cleanup(): Promise<void> {
    await prisma.notification.deleteMany({ where: { user: { email: { in: emails } } } });
    await prisma.appointment.deleteMany({ where: { user: { email: { in: emails } } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    if (slotIds.length) {
      await prisma.slot.deleteMany({ where: { id: { in: slotIds } } });
    }
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
    reminder = app.get(ReminderService);
    await cleanup();

    const reg = await request(app.getHttpServer()).post('/api/auth/register').send(user).expect(201);
    token = reg.body.data.accessToken;
    userId = reg.body.data.user.id;

    const reg2 = await request(app.getHttpServer()).post('/api/auth/register').send(other).expect(201);
    otherToken = reg2.body.data.accessToken;
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  let reminderId = '';

  it('yalnızca pencere içindeki randevu için hatırlatma üretir', async () => {
    const withinId = await makeBookedAppointment(45); // pencere içi (< 120 dk)
    await makeBookedAppointment(5 * 24 * 60); // çok ileri → üretilmez
    await makeBookedAppointment(-2 * 24 * 60); // geçmiş → üretilmez
    await makeBookedAppointment(-36); // az önce geçti → üretilmez

    await reminder.generateUpcomingReminders();

    const res = await request(app.getHttpServer())
      .get('/api/notifications/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].appointmentId).toBe(withinId);
    expect(res.body.data[0].type).toBe('APPOINTMENT_REMINDER');
    expect(res.body.data[0].isRead).toBe(false);
    reminderId = res.body.data[0].id;
  });

  it('ikinci çalıştırmada aynı randevu için tekrar üretmez', async () => {
    await reminder.generateUpcomingReminders();
    const res = await request(app.getHttpServer())
      .get('/api/notifications/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.data).toHaveLength(1); // hâlâ tek bildirim
  });

  it('başka kullanıcı bildirimi okundu işaretleyemez (404)', async () => {
    await request(app.getHttpServer())
      .patch(`/api/notifications/${reminderId}/read`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
  });

  it('sahibi bildirimi okundu işaretler', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/notifications/${reminderId}/read`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.data.isRead).toBe(true);
  });
});
