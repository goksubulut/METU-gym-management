import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsIn, IsOptional, Matches } from 'class-validator';
import { GENDER_VALUES, type GenderValue } from './register.dto';

export class UpdateProfileDto {
  @ApiProperty({ example: 'yeni@example.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta girin' })
  email!: string;

  @ApiPropertyOptional({ enum: GENDER_VALUES })
  @IsOptional()
  @IsIn([...GENDER_VALUES])
  gender?: GenderValue;

  @ApiPropertyOptional({ example: '2003-01-14', description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsDateString({}, { message: 'Doğum tarihi YYYY-MM-DD olmalı' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Doğum tarihi YYYY-MM-DD olmalı' })
  birthDate?: string;
}
