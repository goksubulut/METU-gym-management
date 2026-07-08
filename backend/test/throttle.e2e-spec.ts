import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Güvenlik 2.1: /auth/login uçu dk'da 5 denemeyle sınırlı; 6. deneme
 * 429 döner. Ayrı bir suite (dolayısıyla taze throttler deposu) kullanır ki
 * diğer test dosyalarının login sayacını etkilemesin.
 */
describe('Auth rate limiting (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const user = { name: 'Throttle Testi', email: 'e2e-throttle@metugym.local', password: 'Parola1234' };

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
    await prisma.user.deleteMany({ where: { email: user.email } });
    await request(app.getHttpServer()).post('/api/auth/register').send(user).expect(201);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: user.email } });
    await app.close();
  });

  it('6. login denemesi 429 Too Many Requests döner', async () => {
    const creds = { email: user.email, password: user.password };

    // İlk 5 deneme limit içinde (200)
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer()).post('/api/auth/login').send(creds).expect(200);
    }
    // 6. deneme sınırı aşar
    await request(app.getHttpServer()).post('/api/auth/login').send(creds).expect(429);
  });
});
