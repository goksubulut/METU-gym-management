import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/** FR-AUTH: e-postadaki token ile yeni parola belirle. */
export class ResetPasswordDto {
  @ApiProperty({ description: 'E-posta bağlantısındaki tek kullanımlık token' })
  @IsString()
  @IsNotEmpty({ message: 'Token boş olamaz' })
  token!: string;

  // Parola kuralı register.dto ile aynı: en az 8 karakter, harf + rakam.
  @ApiProperty({ example: 'YeniParola1', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Parola en az 8 karakter olmalı' })
  @MaxLength(72)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, { message: 'Parola en az bir harf ve bir rakam içermeli' })
  newPassword!: string;
}
