import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '../auth.types';

/**
 * Controller parametresine, JwtAuthGuard'ın doğruladığı token içeriğini verir.
 * Örnek: me(@CurrentUser() user: AccessTokenPayload)
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AccessTokenPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AccessTokenPayload }>();
    return request.user;
  },
);
