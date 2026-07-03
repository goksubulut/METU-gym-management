import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Tüm uçlar /api altında (Nginx yönlendirmesi ve frontend proxy'si için net sınır)
  app.setGlobalPrefix('api');

  // Girdi doğrulama (sistem sınırında): DTO'da olmayan alanlar atılır,
  // bilinmeyen alan gelirse istek reddedilir, tipler otomatik dönüştürülür.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Ortak cevap zarfı: { success, data, error }
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Geliştirmede Vite (5173) farklı porttan istek atar
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', credentials: true });

  // Swagger (OpenAPI): mobil/web ekipleri aynı sözleşmeden çalışır (SRS 8.2)
  const config = new DocumentBuilder()
    .setTitle('METU Gym Management System API')
    .setDescription('Spor Salonu Randevu ve Makine Kullanım Uygulaması REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

void bootstrap();
