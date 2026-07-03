import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Auth akışı uçtan uca: kayıt → giriş → korumalı uç → refresh → logout.
 * Gerçek PostgreSQL kullanır (docker compose db ayakta olmalı).
 */
describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const testUser = {
    name: 'Test Kullanıcı',
    email: 'e2e-test@metugym.local',
    password: 'Parola1234',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // main.ts ile aynı global kurulum
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('yeni kullanıcıyı kaydeder ve token çifti döner', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.role).toBe('USER');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      // Parola hash'i asla dışarı çıkmamalı
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('aynı e-postayla ikinci kaydı 409 ile reddeder', async () => {
      await request(app.getHttpServer()).post('/api/auth/register').send(testUser).expect(409);
    });

    it('zayıf parolayı 400 ile reddeder', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ name: 'X', email: 'baska@metugym.local', password: 'kisa' })
        .expect(400);
    });

    it('bilinmeyen alan gönderilirse 400 döner (whitelist)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...testUser, email: 'field@metugym.local', role: 'ADMIN' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('doğru bilgilerle giriş yapar', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(res.body.data.accessToken).toBeDefined();
    });

    it('yanlış parolayı 401 ile reddeder', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'YanlisParola1' })
        .expect(401);
    });

    it('kayıtsız e-postayı aynı 401 mesajıyla reddeder (bilgi sızdırmaz)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'yok@metugym.local', password: 'Parola1234' })
        .expect(401);
      expect(res.body.error).toBe('E-posta veya parola hatalı');
    });
  });

  describe('korumalı uçlar', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('GET /api/auth/me token olmadan 401 döner', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('GET /api/auth/me geçerli token ile kullanıcıyı döner', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('POST /api/auth/refresh yeni token çifti döner (rotasyon)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);
      expect(res.body.data.accessToken).toBeDefined();

      // Rotasyon: eski refresh token artık geçersiz olmalı
      await request(app.getHttpServer()).post('/api/auth/refresh').send({ refreshToken }).expect(401);
      refreshToken = res.body.data.refreshToken;
    });

    it('POST /api/auth/logout sonrası refresh reddedilir', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer()).post('/api/auth/refresh').send({ refreshToken }).expect(401);
    });
  });
});
