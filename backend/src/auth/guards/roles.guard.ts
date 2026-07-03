import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AccessTokenPayload } from '../auth.types';

/**
 * Rol bazlı yetkilendirme (NFR-3: admin uçları korunur).
 * JwtAuthGuard'dan SONRA çalışır; @Roles() yoksa herkese (girişli) açıktır.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: AccessTokenPayload }>();
    // @Public bir uca @Roles konursa user tanımsız kalır — güvenli taraf: reddet.
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Bu işlem için yetkiniz yok');
    }
    return true;
  }
}
