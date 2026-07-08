import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import type { AccessTokenPayload, AuthResult, UserView } from './auth.types';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

/** Kimlik uçları için sıkı limit: kaba kuvvet/spam'e karşı dk'da 5 deneme. */
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } } as const;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('register')
  @ApiOperation({ summary: 'Hesap oluştur (FR-AUTH-1)' })
  register(@Body() dto: RegisterDto): Promise<AuthResult> {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Giriş yap — access + refresh token döner' })
  login(@Body() dto: LoginDto): Promise<AuthResult> {
    return this.authService.login(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Token yenile (FR-AUTH-3, rotasyonlu)' })
  refresh(@Body() dto: RefreshDto): Promise<AuthResult> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Parola sıfırlama bağlantısı iste (e-posta ile)' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto): Promise<{ sent: true }> {
    // Kullanıcı olsa da olmasa da tek tip yanıt (bilgi sızmaması).
    await this.authService.requestPasswordReset(dto.email);
    return { sent: true };
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Token ile yeni parola belirle' })
  async confirmPasswordReset(@Body() dto: ResetPasswordDto): Promise<{ success: true }> {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { success: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Oturumu kapat — refresh token iptal edilir' })
  async logout(@CurrentUser() user: AccessTokenPayload): Promise<{ loggedOut: true }> {
    await this.authService.logout(user.sub);
    return { loggedOut: true };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Oturum sahibinin bilgileri' })
  me(@CurrentUser() user: AccessTokenPayload): Promise<UserView> {
    return this.authService.me(user.sub);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'E-posta güncelle' })
  updateProfile(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserView> {
    return this.authService.updateProfile(user.sub, dto);
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Parola değiştir (mevcut parola gerekli)' })
  async changePassword(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ changed: true }> {
    await this.authService.changePassword(user.sub, dto);
    return { changed: true };
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hesabı kalıcı olarak sil' })
  async deleteAccount(@CurrentUser() user: AccessTokenPayload): Promise<{ deleted: true }> {
    await this.authService.deleteAccount(user.sub);
    return { deleted: true };
  }
}
