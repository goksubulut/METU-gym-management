import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Basit e-posta gönderimi (NFR-6: yalnızca ücretsiz/açık kaynak — Nodemailer +
 * ücretsiz SMTP, örn. Ethereal ya da Gmail uygulama şifresi).
 *
 * SMTP yapılandırılmamışsa (yerel geliştirme) sıfırlama bağlantısı sunucu
 * loguna yazılır; istek yine başarılı döner. Böylece SMTP olmadan da akış
 * uçtan uca denenebilir ve kayıtlı e-posta bilgisi sızmaz.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    this.transporter = host
      ? nodemailer.createTransport({
          host,
          port: Number(this.config.get('SMTP_PORT') ?? 587),
          auth: {
            user: this.config.get<string>('SMTP_USER'),
            pass: this.config.get<string>('SMTP_PASS'),
          },
        })
      : null;
  }

  async sendPasswordResetEmail(to: string, rawToken: string): Promise<void> {
    const baseUrl = this.config.get<string>('APP_BASE_URL') ?? 'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    if (!this.transporter) {
      // Dev fallback: SMTP yok → linki logla (gerçek gönderim yapılmaz).
      this.logger.warn(`SMTP yapılandırılmadı — parola sıfırlama bağlantısı: ${resetUrl}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('SMTP_FROM') ?? 'METU Gym <no-reply@metugym.local>',
        to,
        subject: 'Parola Sıfırlama',
        html: `<p>Parolanı sıfırlamak için <a href="${resetUrl}">buraya tıkla</a>. Bağlantı 30 dakika geçerlidir.</p>`,
      });
    } catch (error: unknown) {
      // Gönderim hatası isteği patlatmamalı (bilgi sızmaması + tek tip yanıt);
      // operasyonel hata olarak loglanır.
      const message = error instanceof Error ? error.message : 'bilinmeyen hata';
      this.logger.error(`Parola sıfırlama e-postası gönderilemedi (${to}): ${message}`);
    }
  }
}
