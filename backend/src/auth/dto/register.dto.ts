import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Gyedu Ernest' })
  @IsString()
  @IsNotEmpty({ message: 'Ad boş olamaz' })
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'uye@example.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta girin' })
  email!: string;

  @ApiPropertyOptional({ example: '0532 111 22 33' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'GucluParola1', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Parola en az 8 karakter olmalı' })
  @MaxLength(72)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, { message: 'Parola en az bir harf ve bir rakam içermeli' })
  password!: string;
}
