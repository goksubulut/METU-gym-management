import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { FeedbackModule } from './feedback/feedback.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReceptionModule } from './reception/reception.module';
import { SlotsModule } from './slots/slots.module';

@Module({
  imports: [
    // .env dosyasını yükler; ConfigService her modülde kullanılabilir
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CatalogModule,
    SlotsModule,
    AppointmentsModule,
    FeedbackModule,
    AdminModule,
    ReceptionModule,
    HealthModule,
  ],
})
export class AppModule {}
