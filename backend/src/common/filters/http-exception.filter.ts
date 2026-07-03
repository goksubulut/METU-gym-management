import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

/**
 * Tüm hataları ortak { success: false, data: null, error } zarfıyla döndürür.
 * Beklenmeyen hatalarda detay sızdırılmaz (NFR: hata mesajları hassas veri
 * içermez); tam hata sunucu tarafında loglanır.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Beklenmeyen bir hata oluştu';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null && 'message' in body) {
        const m = (body as { message: string | string[] }).message;
        message = Array.isArray(m) ? m.join(', ') : m;
      }
    } else {
      // Beklenmeyen hata: tam içerik loglanır, istemciye genel mesaj döner.
      this.logger.error('İşlenmemiş hata', exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json({ success: false, data: null, error: message });
  }
}
