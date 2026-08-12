import { existsSync } from 'fs';
import { join } from 'path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PHOTOS_DIR, QR_DIR } from './../src/catalog/machines/machine-media.util';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';

/** 1×1 JPEG — multipart fotoğraf testleri için. */
const MIN_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  'base64',
);

/** 1×1 PNG — QR yükleme testleri için. */
const MIN_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const TEST_MACHINE_PREFIX = 'E2E Admin Makine';

/**
 * Admin envanter uçları: CRUD, fotoğraf ve özel QR yönetimi.
 * Seed: admin@metugym.local / admin1234
 */
describe('Admin machines (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let testMachineId: string;

  async function login(email: string, password: string): Promise<string> {
    const res = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password });
    return res.body.data.accessToken as string;
  }

  async function cleanupTestMachines(): Promise<void> {
    const machines = await prisma.machine.findMany({
      where: { name: { startsWith: TEST_MACHINE_PREFIX } },
      select: { id: true, photoUrl: true, qrImageUrl: true },
    });
    for (const m of machines) {
      if (m.photoUrl?.startsWith('/media/photos/')) {
        const file = join(PHOTOS_DIR, m.photoUrl.replace('/media/photos/', ''));
        if (existsSync(file)) {
          const { unlinkSync } = await import('fs');
          unlinkSync(file);
        }
      }
      if (m.qrImageUrl?.startsWith('/media/qr/')) {
        const file = join(QR_DIR, m.qrImageUrl.replace('/media/qr/', ''));
        if (existsSync(file)) {
          const { unlinkSync } = await import('fs');
          unlinkSync(file);
        }
      }
    }
    const ids = machines.map((m) => m.id);
    if (ids.length > 0) {
      await prisma.machineMuscleGroup.deleteMany({ where: { machineId: { in: ids } } });
      await prisma.machine.deleteMany({ where: { id: { in: ids } } });
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
    await cleanupTestMachines();

    adminToken = await login('admin@metugym.local', 'admin1234');

    const reg = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Admin Machines E2E',
        email: 'e2e-admin-machines@metugym.local',
        password: 'Parola1234',
      });
    userToken = reg.body.data.accessToken as string;
  });

  afterAll(async () => {
    await cleanupTestMachines();
    await prisma.user.deleteMany({ where: { email: 'e2e-admin-machines@metugym.local' } });
    await app.close();
  });

  describe('yetkilendirme', () => {
    it('tokensiz istek 401 döner', async () => {
      await request(app.getHttpServer()).get('/api/admin/machines').expect(401);
    });

    it('USER rolü admin makine uçlarına erişemez (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/machines')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/admin/machines', () => {
    it('tüm makineleri isActive ve qrImageUrl ile döner', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/machines')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(36);
      const m1 = res.body.data.find((m: { id: string }) => m.id === 'm1');
      expect(m1).toBeDefined();
      expect(m1).toHaveProperty('isActive', true);
      expect(m1).toHaveProperty('qrImageUrl');
      expect(Array.isArray(m1.muscleGroups)).toBe(true);
      expect(Array.isArray(m1.targetMuscles)).toBe(true);
    });
  });

  describe('POST /api/admin/machines', () => {
    it('yeni makine oluşturur (kas grupları + hedef kaslar)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/machines')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `${TEST_MACHINE_PREFIX} Leg Press`,
          category: 'Makine',
          location: 'E2E Test — Bölüm A',
          description: 'E2E test makinesi',
          tips: 'Test ipucu',
          muscleGroupIds: ['legs', 'glutes'],
          targetMuscles: ['quadriceps', 'gluteal'],
        })
        .expect(201);

      testMachineId = res.body.data.id as string;
      expect(testMachineId).toBeTruthy();
      expect(res.body.data.name).toBe(`${TEST_MACHINE_PREFIX} Leg Press`);
      expect(res.body.data.isActive).toBe(true);
      expect(res.body.data.muscleGroups.map((g: { id: string }) => g.id).sort()).toEqual(['glutes', 'legs']);
      expect(res.body.data.targetMuscles).toEqual(expect.arrayContaining(['quadriceps', 'gluteal']));
    });

    it('geçersiz kas grubunu 400 ile reddeder', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/machines')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `${TEST_MACHINE_PREFIX} Geçersiz`,
          category: 'Makine',
          location: 'Test',
          muscleGroupIds: ['yok-boyle-kas'],
        })
        .expect(400);
    });

    it('geçersiz kategoriyi 400 ile reddeder', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/machines')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `${TEST_MACHINE_PREFIX} Geçersiz Kat`,
          category: 'Uzay',
          location: 'Test',
        })
        .expect(400);
    });
  });

  describe('PATCH /api/admin/machines/:id', () => {
    it('ad, konum, kas grupları ve hedef kasları günceller', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/admin/machines/${testMachineId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `${TEST_MACHINE_PREFIX} Leg Press (Güncellendi)`,
          location: 'E2E Test — Bölüm B',
          muscleGroupIds: ['legs'],
          targetMuscles: ['quadriceps', 'hamstring'],
        })
        .expect(200);

      expect(res.body.data.name).toBe(`${TEST_MACHINE_PREFIX} Leg Press (Güncellendi)`);
      expect(res.body.data.location).toBe('E2E Test — Bölüm B');
      expect(res.body.data.muscleGroups.map((g: { id: string }) => g.id)).toEqual(['legs']);
      expect(res.body.data.targetMuscles).toEqual(expect.arrayContaining(['quadriceps', 'hamstring']));
    });

    it('olmayan makine 404 döner', async () => {
      await request(app.getHttpServer())
        .patch('/api/admin/machines/yok-boyle-makine')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('POST / DELETE /api/admin/machines/:id/photo', () => {
    it('fotoğraf yükler ve diskte dosya oluşturur', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/admin/machines/${testMachineId}/photo`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('photo', MIN_JPEG, { filename: 'test.jpeg', contentType: 'image/jpeg' })
        .expect(201);

      const photoUrl = res.body.data.photoUrl as string;
      expect(photoUrl).toBe(`/media/photos/${testMachineId}.jpeg`);
      expect(existsSync(join(PHOTOS_DIR, `${testMachineId}.jpeg`))).toBe(true);
    });

    it('fotoğrafı değiştirir (aynı alan, yeni dosya)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/admin/machines/${testMachineId}/photo`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('photo', MIN_JPEG, { filename: 'replace.png', contentType: 'image/png' })
        .expect(201);

      expect(res.body.data.photoUrl).toBe(`/media/photos/${testMachineId}.png`);
      expect(existsSync(join(PHOTOS_DIR, `${testMachineId}.png`))).toBe(true);
      expect(existsSync(join(PHOTOS_DIR, `${testMachineId}.jpeg`))).toBe(false);
    });

    it('dosya olmadan 400 döner', async () => {
      await request(app.getHttpServer())
        .post(`/api/admin/machines/${testMachineId}/photo`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('desteklenmeyen MIME tipini 400 ile reddeder', async () => {
      await request(app.getHttpServer())
        .post(`/api/admin/machines/${testMachineId}/photo`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('photo', Buffer.from('not-an-image'), { filename: 'bad.txt', contentType: 'text/plain' })
        .expect(400);
    });

    it('fotoğrafı siler ve photoUrl null olur', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/admin/machines/${testMachineId}/photo`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.photoUrl).toBeNull();
      expect(existsSync(join(PHOTOS_DIR, `${testMachineId}.png`))).toBe(false);
    });

    it('olmayan makine için fotoğraf yükleme 404 döner', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/machines/yok-boyle-makine/photo')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('photo', MIN_JPEG, { filename: 'test.jpeg', contentType: 'image/jpeg' })
        .expect(404);
    });
  });

  describe('POST / DELETE /api/admin/machines/:id/qr', () => {
    it('özel QR PNG yükler', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/admin/machines/${testMachineId}/qr`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('qr', MIN_PNG, { filename: 'qr.png', contentType: 'image/png' })
        .expect(201);

      expect(res.body.data.qrImageUrl).toBe(`/media/qr/${testMachineId}.png`);
      expect(existsSync(join(QR_DIR, `${testMachineId}.png`))).toBe(true);
    });

    it('QR servisi özel görseli kullanır', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/qr/machines/${testMachineId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.custom).toBe(true);
      expect(res.body.data.dataUrl).toBe(`/media/qr/${testMachineId}.png`);
    });

    it('JPEG dosyasını QR olarak reddeder (400)', async () => {
      await request(app.getHttpServer())
        .post(`/api/admin/machines/${testMachineId}/qr`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('qr', MIN_JPEG, { filename: 'bad.jpeg', contentType: 'image/jpeg' })
        .expect(400);
    });

    it('özel QR\'ı siler; otomatik üretime döner', async () => {
      const del = await request(app.getHttpServer())
        .delete(`/api/admin/machines/${testMachineId}/qr`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(del.body.data.qrImageUrl).toBeNull();
      expect(existsSync(join(QR_DIR, `${testMachineId}.png`))).toBe(false);

      const qr = await request(app.getHttpServer())
        .get(`/api/qr/machines/${testMachineId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(qr.body.data.custom).toBe(false);
      expect(qr.body.data.dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    });
  });

  describe('DELETE /api/admin/machines/:id', () => {
    it('makineyi pasife alır (soft-delete)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/admin/machines/${testMachineId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.deleted).toBe(true);

      await request(app.getHttpServer()).get(`/api/machines/${testMachineId}`).expect(404);

      const adminList = await request(app.getHttpServer())
        .get('/api/admin/machines')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const inactive = adminList.body.data.find((m: { id: string }) => m.id === testMachineId);
      expect(inactive.isActive).toBe(false);
    });

    it('olmayan makine 404 döner', async () => {
      await request(app.getHttpServer())
        .delete('/api/admin/machines/yok-boyle-makine')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
