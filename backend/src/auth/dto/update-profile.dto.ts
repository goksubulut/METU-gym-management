import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { GENDER_VALUES, type GenderValue } from './register.dto';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'yeni@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir e-posta girin' })
  email?: string;

  @ApiPropertyOptional({ enum: GENDER_VALUES })
  @IsOptional()
  @IsIn([...GENDER_VALUES])
  gender?: GenderValue;

  @ApiPropertyOptional({ example: '2003-01-14', description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsDateString({}, { message: 'Doğum tarihi YYYY-MM-DD olmalı' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Doğum tarihi YYYY-MM-DD olmalı' })
  birthDate?: string;

  @ApiPropertyOptional({ example: 178, description: 'Boy (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Boy tam sayı (cm) olmalı' })
  @Min(100, { message: 'Boy en az 100 cm olmalı' })
  @Max(250, { message: 'Boy en fazla 250 cm olabilir' })
  heightCm?: number;

  @ApiPropertyOptional({ example: 72.5, description: 'Kilo (kg)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 }, { message: 'Kilo en fazla bir ondalık basamak olabilir' })
  @Min(30, { message: 'Kilo en az 30 kg olmalı' })
  @Max(300, { message: 'Kilo en fazla 300 kg olabilir' })
  weightKg?: number;
}
