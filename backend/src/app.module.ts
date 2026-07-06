import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
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
})
export class AppModule {}
