import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/** FR-AUTH: parola sıfırlama bağlantısı iste (e-posta ile gönderilir). */
export class RequestPasswordResetDto {
  @ApiProperty({ example: 'uye@example.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta girin' })
  email!: string;
}
