import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AdminModule } from './admin/admin.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { FeedbackModule } from './feedback/feedback.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { QrModule } from './qr/qr.module';
import { ReceptionModule } from './reception/reception.module';
import { SlotsModule } from './slots/slots.module';

@Module({
  imports: [
    // .env dosyasını yükler; ConfigService her modülde kullanılabilir
    ConfigModule.forRoot({ isGlobal: true }),
    // Zamanlanmış işler (randevu otomatik sonuçlandırma vb.) için @Cron desteği
    ScheduleModule.forRoot(),
    // Kaba kuvvet koruması: genel varsayılan dk'da 100 istek. AuthModule'den
    // önce import edilir ki ThrottlerGuard, JWT/rol kontrolünden önce çalışsın.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    // FR-VD-1: video/fotoğraf dosyaları geliştirmede buradan sunulur
    // (/media/videos/m1.mp4). Üretimde aynı klasörü Nginx sunar (SRS 8.5) —
    // URL sözleşmesi değişmez.
    ServeStaticModule.forRoot({
      // cwd = backend/ (hem "nest start" hem "node dist/main" bu dizinden çalışır)
      rootPath: join(process.cwd(), 'media'),
      serveRoot: '/media',
    }),
    PrismaModule,
    AuthModule,
    CatalogModule,
    SlotsModule,
    AppointmentsModule,
    FeedbackModule,
    AnnouncementsModule,
    AdminModule,
    ReceptionModule,
    QrModule,
    HealthModule,
  ],
  providers: [
    // Global istek sınırlama guard'ı (rate limiting)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
