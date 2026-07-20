import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Antrenman programları: oluştur, listele, sıra güncelle (swap), sil, yetkisiz erişim.
 * sortOrder unique yok — PATCH delete+recreate ile swap çakışması önlenir.
 */
describe('Workout Programs (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;
  let otherToken: string;

  const user = { name: 'Program Testi', email: 'e2e-program@metugym.local', password: 'Parola1234' };
  const otherUser = { name: 'Program Diğer', email: 'e2e-program-2@metugym.local', password: 'Parola1234' };
  const emails = [user.email, otherUser.email];

  async function cleanup(): Promise<void> {
    await prisma.workoutProgram.deleteMany({ where: { user: { email: { in: emails } } } });
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

  it('token olmadan 401 döner', async () => {
    await request(app.getHttpServer()).get('/api/programs/me').expect(401);
  });

  describe('CRUD + sıralama', () => {
    let programId: string;
    let warmupId: string;
    let machineId: string;
    let freeId: string;
    let cooldownId: string;

    beforeAll(async () => {
      const warmupRes = await request(app.getHttpServer())
        .get('/api/exercises?type=WARMUP&muscleGroup=chest')
        .expect(200);
      warmupId = warmupRes.body.data[0].id;

      const machineRes = await request(app.getHttpServer())
        .get('/api/machines?muscleGroup=chest')
        .expect(200);
      machineId = machineRes.body.data[0].id;

      const freeRes = await request(app.getHttpServer())
        .get('/api/exercises?type=FREE&muscleGroup=chest')
        .expect(200);
      freeId = freeRes.body.data[0].id;

      const cooldownRes = await request(app.getHttpServer())
        .get('/api/exercises?type=COOLDOWN&muscleGroup=chest')
        .expect(200);
      cooldownId = cooldownRes.body.data[0].id;
    });

    it('program oluşturur (ısınma → makine → egzersiz → soğuma)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/programs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Göğüs günü',
          items: [
            { itemType: 'EXERCISE', exerciseId: warmupId },
            { itemType: 'MACHINE', machineId },
            { itemType: 'EXERCISE', exerciseId: freeId },
            { itemType: 'EXERCISE', exerciseId: cooldownId },
          ],
        })
        .expect(201);

      programId = res.body.data.id;
      expect(res.body.data.name).toBe('Göğüs günü');
      expect(res.body.data.items).toHaveLength(4);
      expect(res.body.data.items[0].sortOrder).toBe(0);
      expect(res.body.data.items[0].exerciseType).toBe('WARMUP');
      expect(res.body.data.items[1].itemType).toBe('MACHINE');
      expect(res.body.data.items[3].exerciseType).toBe('COOLDOWN');
    });

    it('GET /programs/me özet listesi döner', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/programs/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.some((p: { id: string }) => p.id === programId)).toBe(true);
      const row = res.body.data.find((p: { id: string }) => p.id === programId);
      expect(row.itemCount).toBe(4);
    });

    it('PATCH ile iki öğenin sırasını swap eder (unique çakışması olmaz)', async () => {
      const before = await request(app.getHttpServer())
        .get(`/api/programs/${programId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const items = before.body.data.items;
      expect(items).toHaveLength(4);

      const swapped = [
        { itemType: items[1].itemType, machineId: items[1].machineId, exerciseId: items[1].exerciseId },
        { itemType: items[0].itemType, machineId: items[0].machineId, exerciseId: items[0].exerciseId },
        { itemType: items[2].itemType, machineId: items[2].machineId, exerciseId: items[2].exerciseId },
        { itemType: items[3].itemType, machineId: items[3].machineId, exerciseId: items[3].exerciseId },
      ];

      const res = await request(app.getHttpServer())
        .patch(`/api/programs/${programId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ items: swapped })
        .expect(200);

      expect(res.body.data.items[0].itemType).toBe('MACHINE');
      expect(res.body.data.items[1].exerciseType).toBe('WARMUP');
    });

    it('başka kullanıcı programa erişemez (404)', async () => {
      await request(app.getHttpServer())
        .get(`/api/programs/${programId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });

    it('programı siler', async () => {
      await request(app.getHttpServer())
        .delete(`/api/programs/${programId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/programs/${programId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
