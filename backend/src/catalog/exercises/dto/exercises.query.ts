import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ExercisesQuery {
  @ApiPropertyOptional({ enum: ExerciseType })
  @IsOptional()
  @IsEnum(ExerciseType, { message: 'Geçersiz egzersiz tipi' })
  type?: ExerciseType;

  @ApiPropertyOptional({ example: 'legs' })
  @IsOptional()
  @IsString()
  muscleGroup?: string;
}
