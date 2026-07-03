import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @Global: her feature modülünde tekrar import etmemek için.
 * Veritabanı erişimi tek PrismaService örneği üzerinden yapılır.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
