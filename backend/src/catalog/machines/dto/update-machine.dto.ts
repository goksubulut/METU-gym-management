import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  MACHINE_CATEGORIES,
  MUSCLE_GROUP_IDS,
  TARGET_MUSCLE_SLUGS,
} from '../machine.constants';

export class UpdateMachineDto {
  @ApiPropertyOptional({ example: 'Leg Press' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ enum: MACHINE_CATEGORIES })
  @IsOptional()
  @IsIn([...MACHINE_CATEGORIES])
  category?: (typeof MACHINE_CATEGORIES)[number];

  @ApiPropertyOptional({ example: 'Zemin Kat — B3' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  tips?: string;

  @ApiPropertyOptional({ type: [String], enum: MUSCLE_GROUP_IDS })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn([...MUSCLE_GROUP_IDS], { each: true })
  muscleGroupIds?: string[];

  @ApiPropertyOptional({ type: [String], enum: TARGET_MUSCLE_SLUGS })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn([...TARGET_MUSCLE_SLUGS], { each: true })
  targetMuscles?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
