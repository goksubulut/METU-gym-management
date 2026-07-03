import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient'ı NestJS yaşam döngüsüne bağlar: uygulama açılırken bağlanır,
 * kapanırken bağlantıyı düzgün kapatır. Tüm modüller veri erişimi için bu
 * servisi enjekte eder (Repository katmanının temeli).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
