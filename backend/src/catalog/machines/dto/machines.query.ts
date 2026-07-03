import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { MACHINE_CATEGORIES } from '../../catalog.constants';

export class MachinesQuery {
  @ApiPropertyOptional({ enum: MACHINE_CATEGORIES })
  @IsOptional()
  @IsIn(MACHINE_CATEGORIES, { message: 'Geçersiz kategori' })
  category?: string;

  @ApiPropertyOptional({ example: 'chest', description: 'Kas grubu id (FR-CAT-3)' })
  @IsOptional()
  @IsString()
  muscleGroup?: string;
}
