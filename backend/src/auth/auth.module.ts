import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  // Secret'lar imza anında ConfigService'ten okunur; register() boş kalır.
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    MailService,
    // Global guard sırası önemli: önce kimlik (JWT), sonra yetki (rol).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
