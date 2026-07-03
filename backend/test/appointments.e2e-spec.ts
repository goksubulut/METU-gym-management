import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Slot + randevu akışı uçtan uca: slot listesi → randevu → çifte kayıt →
 * kapasite → güncelleme → iptal. Gerçek PostgreSQL kullanır.
 */
describe('Slots & Appointments (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;
  let otherToken: string;

  const user = { name: 'Randevu Testi', email: 'e2e-appt@metugym.local', password: 'Parola1234' };
  const otherUser = { name: 'Diğer Üye', email: 'e2e-appt-2@metugym.local', password: 'Parola1234' };
  const emails = [user.email, otherUser.email];

  /** Yarının tarihi — geçmiş slot kurallarına takılmayan güvenli gün. */
  function tomorrowKey(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  async function cleanup(): Promise<void> {
    await prisma.appointment.deleteMany({ where: { user: { email: { in: emails } } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
  }

  async function registerAndLogin(u: typeof user): Promise<string> {
    const res = await request(app.getHttpServer()).post('/api/auth/register').send(u);
    return res.body.data.accessToken as string;
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
    await cleanup();
    token = await registerAndLogin(user);
    otherToken = await registerAndLogin(otherUser);
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  describe('GET /api/slots', () => {
    it('token olmadan 401 döner (login zorunlu kararı)', async () => {
      await request(app.getHttpServer()).get(`/api/slots?date=${tomorrowKey()}`).expect(401);
    });

    it('günün slotlarını doluluk bilgisiyle döner', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/slots?date=${tomorrowKey()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.slots.length).toBeGreaterThan(0);
      const slot = res.body.data.slots[0];
      expect(slot).toHaveProperty('capacity');
      expect(slot).toHaveProperty('booked');
      expect(slot).toHaveProperty('isFull');
    });

    it('bozuk tarih biçimini 400 ile reddeder', async () => {
      await request(app.getHttpServer())
        .get('/api/slots?date=3-temmuz')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('pencere dışı (çok ileri) tarihi 400 ile reddeder', async () => {
      await request(app.getHttpServer())
        .get('/api/slots?date=2030-01-01')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });

  describe('randevu yaşam döngüsü', () => {
    let slotId: string;
    let appointmentId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/slots?date=${tomorrowKey()}`)
        .set('Authorization', `Bearer ${token}`);
      // Testler arası çakışmamak için boş bir slot seç
      slotId = res.body.data.slots.find((s: { booked: number }) => s.booked === 0).id;
    });

    it('makine + kas grubu planıyla randevu oluşturur (Yol A)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({ slotId, machineIds: ['m3', 'm6'], muscleGroupIds: ['chest', 'arms'], note: 'Üst vücut' })
        .expect(201);

      appointmentId = res.body.data.id;
      expect(res.body.data.status).toBe('BOOKED');
      expect(res.body.data.machines.map((m: { id: string }) => m.id).sort()).toEqual(['m3', 'm6']);
      expect(res.body.data.muscleGroups).toHaveLength(2);
    });

    it('aynı slota ikinci randevuyu 409 ile reddeder', async () => {
      await request(app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({ slotId })
        .expect(409);
    });

    it('geçersiz makine id\'sini 400 ile reddeder', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/slots?date=${tomorrowKey()}`)
        .set('Authorization', `Bearer ${token}`);
      const empty = res.body.data.slots.find((s: { booked: number }) => s.booked === 0);
      await request(app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({ slotId: empty.id, machineIds: ['olmayan-makine'] })
        .expect(400);
    });

    it('dolu slota randevuyu 409 ile reddeder', async () => {
      // Kapasiteyi doldurmak yerine slotun kapasitesini geçici olarak 1'e indir
      await prisma.slot.update({ where: { id: slotId }, data: { capacity: 1 } });
      await request(app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ slotId })
        .expect(409);
      await prisma.slot.update({ where: { id: slotId }, data: { capacity: 10 } });
    });

    it('slot dolulukta randevuyu sayar (FR-BK-7)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/slots?date=${tomorrowKey()}`)
        .set('Authorization', `Bearer ${token}`);
      const slot = res.body.data.slots.find((s: { id: string }) => s.id === slotId);
      expect(slot.booked).toBe(1);
    });

    it('GET /appointments/me randevuyu listeler', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/appointments/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.some((a: { id: string }) => a.id === appointmentId)).toBe(true);
    });

    it('başka kullanıcı randevuyu göremez (404 — varlık bilgisi sızmaz)', async () => {
      await request(app.getHttpServer())
        .get(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });

    it('planı günceller: makine listesi komple değişir (FR-BK-4)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ machineIds: ['m1'], note: 'Bacak günü oldu' })
        .expect(200);
      expect(res.body.data.machines.map((m: { id: string }) => m.id)).toEqual(['m1']);
      expect(res.body.data.note).toBe('Bacak günü oldu');
      // Gönderilmeyen alan (kas grupları) korunur
      expect(res.body.data.muscleGroups).toHaveLength(2);
    });

    it('iptal eder; slot doluluğu düşer, ikinci iptal 400', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.status).toBe('CANCELLED');

      const slots = await request(app.getHttpServer())
        .get(`/api/slots?date=${tomorrowKey()}`)
        .set('Authorization', `Bearer ${token}`);
      expect(slots.body.data.slots.find((s: { id: string }) => s.id === slotId).booked).toBe(0);

      await request(app.getHttpServer())
        .delete(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });
});
