import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AccessTokenPayload, AuthResult, RefreshTokenPayload, UserView } from './auth.types';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from './mail.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

/** Parola sıfırlama token'ı geçerlilik süresi (dakika). */
const PASSWORD_RESET_TTL_MINUTES = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /** FR-AUTH-1: hesap oluşturma. Kayıt olan herkes USER rolündedir;
   *  admin/resepsiyon hesapları yalnızca seed/yönetici eliyle açılır. */
  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Bu e-posta ile kayıtlı bir hesap zaten var');
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash: await argon2.hash(dto.password),
        role: Role.USER,
      },
    });
    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Hesap yok / parola yanlış ayrımı yapılmaz — hangi e-postaların kayıtlı
    // olduğu bilgisini sızdırmamak için tek mesaj (NFR-3).
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('E-posta veya parola hatalı');
    }
    return this.issueTokens(user);
  }

  /** FR-AUTH-3: token yenileme (rotasyonlu — her refresh yeni çift üretir,
   *  eski refresh token geçersizleşir). */
  async refresh(refreshToken: string): Promise<AuthResult> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token geçersiz veya süresi dolmuş');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    // Kayıtlı hash ile karşılaştırma: logout sonrası ya da rotasyonla
    // eskiyen token'lar (hash tutmadığı için) reddedilir.
    if (
      !user ||
      !user.refreshTokenHash ||
      !(await argon2.verify(user.refreshTokenHash, refreshToken))
    ) {
      throw new UnauthorizedException('Oturum sonlandırılmış, yeniden giriş yapın');
    }
    return this.issueTokens(user);
  }

  /** Refresh token'ı iptal eder; access token doğal ömrüyle (≤15 dk) ölür. */
  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  async me(userId: string): Promise<UserView> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }
    return this.toView(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserView> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    const email = dto.email.trim().toLowerCase();
    if (email !== user.email) {
      const taken = await this.prisma.user.findUnique({ where: { email } });
      if (taken) {
        throw new ConflictException('Bu e-posta ile kayıtlı bir hesap zaten var');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { email },
    });
    return this.toView(updated);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!valid) {
      throw new BadRequestException('Mevcut parola hatalı');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await argon2.hash(dto.newPassword),
        refreshTokenHash: null,
      },
    });
  }

  /**
   * Parola sıfırlama isteği. Kullanıcı yoksa da sessizce başarı döner —
   * hangi e-postaların kayıtlı olduğu bilgisini sızdırmamak için (login'deki
   * aynı prensip). Ham token e-postayla gider; DB'de yalnızca argon2 hash'i
   * ve son kullanma anı saklanır.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return;
    }

    const rawToken = randomUUID() + randomUUID();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: await argon2.hash(rawToken),
        passwordResetExpiresAt: expiresAt,
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, rawToken);
  }

  /**
   * E-postadaki token ile yeni parola belirle. Token hash'lenerek saklandığı
   * için (tek yönlü) doğrudan sorgulayamayız; süresi geçmemiş tüm sıfırlama
   * kayıtlarını çekip argon2.verify ile eşleştiririz (küçük kullanıcı
   * sayısında sorun değil). Başarıda tüm oturumlar sonlanır ve token tek
   * kullanımlık olur (null'lanır).
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const candidates = await this.prisma.user.findMany({
      where: {
        passwordResetTokenHash: { not: null },
        passwordResetExpiresAt: { gt: new Date() },
      },
    });

    const match = await this.findMatchingResetUser(candidates, token);
    if (!match) {
      throw new BadRequestException('Bağlantı geçersiz veya süresi dolmuş');
    }

    await this.prisma.user.update({
      where: { id: match.id },
      data: {
        passwordHash: await argon2.hash(newPassword),
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        refreshTokenHash: null, // tüm oturumlar sonlanır
      },
    });
  }

  private async findMatchingResetUser(users: User[], rawToken: string): Promise<User | null> {
    for (const user of users) {
      if (user.passwordResetTokenHash && (await argon2.verify(user.passwordResetTokenHash, rawToken))) {
        return user;
      }
    }
    return null;
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    await this.prisma.$transaction([
      this.prisma.suggestion.deleteMany({ where: { userId } }),
      this.prisma.rating.deleteMany({ where: { userId } }),
      this.prisma.faultReport.deleteMany({ where: { userId } }),
      this.prisma.appointment.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  private async issueTokens(user: User): Promise<AuthResult> {
    const accessPayload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role };
    const refreshPayload: RefreshTokenPayload = { sub: user.id, tokenType: 'refresh', jti: randomUUID() };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ ...accessPayload }, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.expiry('JWT_ACCESS_EXPIRES', '30m'),
      }),
      this.jwtService.signAsync({ ...refreshPayload }, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.expiry('JWT_REFRESH_EXPIRES', '7d'),
      }),
    ]);

    // Ham refresh token değil, argon2 hash'i saklanır — DB sızsa bile
    // token'lar kullanılamaz (parola hash'iyle aynı prensip).
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await argon2.hash(refreshToken) },
    });

    return { user: this.toView(user), accessToken, refreshToken };
  }

  /** .env'deki süre değerini jsonwebtoken'ın beklediği tipe köprüler ("15m", "7d"...). */
  private expiry(key: string, fallback: string): JwtSignOptions['expiresIn'] {
    return (this.config.get<string>(key) ?? fallback) as JwtSignOptions['expiresIn'];
  }

  private toView(user: User): UserView {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }
}
