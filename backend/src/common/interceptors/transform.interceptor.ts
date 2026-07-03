import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Tüm API cevapları için ortak zarf (bkz. patterns: API Response Format). */
export interface ApiResponse<T> {
  success: true;
  data: T;
  error: null;
}

/**
 * Controller'ların döndürdüğü ham veriyi { success, data, error } zarfına sarar.
 * Frontend tek bir cevap biçimiyle çalışır; hata zarfı HttpExceptionFilter'da.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(map((data) => ({ success: true as const, data, error: null })));
  }
}
