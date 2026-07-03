import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Ucu belirli rollere kısıtlar (FR-AUTH-2, NFR-3: rol bazlı yetkilendirme).
 * Örnek: @Roles(Role.ADMIN) — yalnızca admin erişir.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
