import { Role } from '@prisma/client';

/** Access token'ın içine yazılan alanlar. `sub` = kullanıcı id (JWT standardı). */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

/** Refresh token yalnızca kimliği taşır; yetki bilgisi taşımaz.
 *  jti: her token'ı benzersiz kılar — aynı saniyede üretilen iki token'ın
 *  aynı string olmasını engeller (rotasyonun çalışması için şart). */
export interface RefreshTokenPayload {
  sub: string;
  tokenType: 'refresh';
  jti: string;
}

/** İstemciye dönen kullanıcı görünümü — parola hash'i asla dışarı çıkmaz. */
export interface UserView {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
}

export interface AuthResult {
  user: UserView;
  accessToken: string;
  refreshToken: string;
}
