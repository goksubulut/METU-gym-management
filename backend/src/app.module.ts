import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // .env dosyasını yükler; ConfigService her modülde kullanılabilir
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
