import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export const GENDER_VALUES = ['MALE', 'FEMALE', 'UNSPECIFIED'] as const;
export type GenderValue = (typeof GENDER_VALUES)[number];

export class RegisterDto {
  @ApiProperty({ example: 'Göksu Bulut' })
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
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
    message: 'Parola en az bir harf ve bir rakam içermeli',
  })
  password!: string;

  @ApiPropertyOptional({ enum: GENDER_VALUES, example: 'MALE' })
  @IsOptional()
  @IsIn([...GENDER_VALUES])
  gender?: GenderValue;

  @ApiPropertyOptional({ example: '2003-01-14', description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsDateString({}, { message: 'Doğum tarihi YYYY-MM-DD olmalı' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Doğum tarihi YYYY-MM-DD olmalı' })
  birthDate?: string;
}
