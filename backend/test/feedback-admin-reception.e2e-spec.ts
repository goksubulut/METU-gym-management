import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Geri bildirim + admin raporları + resepsiyon + QR uçları.
 * Seed verisine dayanır (admin/reception hesapları, m1 makinesi).
 */
describe('Feedback, Admin, Reception, QR (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userToken: string;
  let adminToken: string;
  let receptionToken: string;

  const testUser = { name: 'Feedback Testi', email: 'e2e-fb@metugym.local', password: 'Parola1234' };

  async function login(email: string, password: string): Promise<string> {
    const res = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password });
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
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    const reg = await request(app.getHttpServer()).post('/api/auth/register').send(testUser);
    userToken = reg.body.data.accessToken;
    adminToken = await login('admin@metugym.local', 'admin1234');
    receptionToken = await login('reception@metugym.local', 'reception1234');
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await app.close();
  });

  describe('feedback (FR-FB-1..4)', () => {
    it('tokensiz puanlama 401 döner (login zorunlu kararı)', async () => {
      await request(app.getHttpServer())
        .post('/api/feedback/ratings')
        .send({ machineId: 'm1', score: 5 })
        .expect(401);
    });

    it('puan + etiket kaydeder ve makine ortalamasını döner', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/feedback/ratings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ machineId: 'm1', score: 4, tags: ['Rahattı'] })
        .expect(201);
      expect(res.body.data.machineName).toBeTruthy();
      expect(typeof res.body.data.machineAverageRating).toBe('number');
    });

    it('6 puanı 400 ile reddeder (skala 1–5)', async () => {
      await request(app.getHttpServer())
        .post('/api/feedback/ratings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ machineId: 'm1', score: 6 })
        .expect(400);
    });

    it('arıza bildirir; başlangıç durumu PENDING', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/feedback/faults')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ machineId: 'm1', description: 'e2e testi: pedal gevşek', severity: 'LOW' })
        .expect(201);
      expect(res.body.data.status).toBe('PENDING');
    });

    it('öneri/şikayet kaydeder', async () => {
      await request(app.getHttpServer())
        .post('/api/feedback/suggestions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: 'SUGGESTION', tag: 'Uygulama', text: 'e2e testi önerisi' })
        .expect(201);
    });
  });

  describe('admin raporları (FR-AD-1..5)', () => {
    it('USER rolü admin uçlarına erişemez (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/analytics/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('dashboard özeti döner', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.data).toBeDefined();
    });

    it('tercih analizi, kalite, yoğunluk ve matris uçları 200 döner', async () => {
      for (const path of [
        '/api/admin/analytics/preferences',
        '/api/admin/analytics/quality',
        '/api/admin/analytics/occupancy?period=hourly',
        '/api/admin/analytics/matrix',
      ]) {
        await request(app.getHttpServer())
          .get(path)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      }
    });

    it('arıza durumunu günceller (FR-AD-5)', async () => {
      const list = await request(app.getHttpServer())
        .get('/api/admin/faults')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const fault = list.body.data.faults?.[0] ?? list.body.data[0];
      expect(fault).toBeDefined();

      const res = await request(app.getHttpServer())
        .patch(`/api/admin/faults/${fault.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(200);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });
  });

  describe('resepsiyon', () => {
    it('USER rolü resepsiyon uçlarına erişemez (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/reception/appointments/today')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('bugünün listesi döner; check-in durumu güncellenir', async () => {
      const today = await request(app.getHttpServer())
        .get('/api/reception/appointments/today')
        .set('Authorization', `Bearer ${receptionToken}`)
        .expect(200);
      const rows = today.body.data.appointments ?? today.body.data;
      expect(Array.isArray(rows)).toBe(true);
      if (rows.length === 0) return; // seed günü dışında koşulursa atla

      const res = await request(app.getHttpServer())
        .patch(`/api/reception/appointments/${rows[0].id}/status`)
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({ status: 'checked-in' })
        .expect(200);
      expect(res.body.data.status).toBe('checked-in');
    });
  });

  describe('QR üretimi (FR-QR-1..3)', () => {
    it('USER rolü QR üretemez (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/qr/door')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('kapı QR\'ı PNG data URL döner', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/qr/door')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.data.url).toContain('/qr-info');
      expect(res.body.data.dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    });

    it('makine QR\'ı deep-link taşır', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/qr/machines/m1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.data.url).toContain('/machine/m1');
      expect(res.body.data.machineName).toBeTruthy();
    });

    it('olmayan makine için 404 döner', async () => {
      await request(app.getHttpServer())
        .get('/api/qr/machines/yok-makine')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
