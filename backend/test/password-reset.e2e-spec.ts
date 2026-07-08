import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { MailService } from './../src/auth/mail.service';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Güvenlik 2.3: parola sıfırlama akışı uçtan uca. Ham token e-postayla
 * gittiği için MailService mock'lanıp token yakalanır (API yanıtı token
 * döndürmez — bilinçli). Ayrı suite (taze throttler) kullanır.
 */
describe('Password reset (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Mock mail: gönderilen ham token'ları e-postaya göre saklar.
  const sentTokens = new Map<string, string>();
  const mailMock = {
    sendPasswordResetEmail: jest.fn(async (to: string, rawToken: string) => {
      sentTokens.set(to, rawToken);
    }),
  };

  const user = { name: 'Reset Testi', email: 'e2e-reset@metugym.local', password: 'Parola1234' };
  const newPassword = 'YeniParola9';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({ where: { email: user.email } });
    await request(app.getHttpServer()).post('/api/auth/register').send(user).expect(201);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: user.email } });
    await app.close();
  });

  it('kayıtlı e-posta ile istek → 200 ve e-posta gönderilir', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/password-reset/request')
      .send({ email: user.email })
      .expect(200);
    expect(sentTokens.has(user.email)).toBe(true);
  });

  it('kayıtsız e-posta ile istek → yine 200, e-posta gönderilmez (bilgi sızmaz)', async () => {
    mailMock.sendPasswordResetEmail.mockClear();
    await request(app.getHttpServer())
      .post('/api/auth/password-reset/request')
      .send({ email: 'kayitsiz@metugym.local' })
      .expect(200);
    expect(mailMock.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('geçersiz token ile sıfırlama → 400', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/password-reset/confirm')
      .send({ token: 'gecersiz-token-123', newPassword })
      .expect(400);
  });

  it('geçerli token ile sıfırlama → 200; eski parola artık geçersiz, yeni parola geçerli', async () => {
    const token = sentTokens.get(user.email)!;

    await request(app.getHttpServer())
      .post('/api/auth/password-reset/confirm')
      .send({ token, newPassword })
      .expect(200);

    // Eski parola artık çalışmamalı
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(401);

    // Yeni parola çalışmalı
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: newPassword })
      .expect(200);
  });

  it('kullanılmış token tekrar kullanılamaz → 400 (tek kullanımlık)', async () => {
    const token = sentTokens.get(user.email)!;
    await request(app.getHttpServer())
      .post('/api/auth/password-reset/confirm')
      .send({ token, newPassword: 'BaskaParola7' })
      .expect(400);
  });
});
