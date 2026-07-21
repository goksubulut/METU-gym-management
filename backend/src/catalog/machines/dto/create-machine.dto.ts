import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  MACHINE_CATEGORIES,
  MUSCLE_GROUP_IDS,
  TARGET_MUSCLE_SLUGS,
} from '../machine.constants';

export class CreateMachineDto {
  @ApiProperty({ example: 'Leg Press' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ enum: MACHINE_CATEGORIES, example: 'Makine' })
  @IsIn([...MACHINE_CATEGORIES])
  category!: (typeof MACHINE_CATEGORIES)[number];

  @ApiProperty({ example: 'Zemin Kat — B3' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  location!: string;

  @ApiPropertyOptional({ example: 'Bacak basma makinesi.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'Sırtını yasla, dizleri 90° geçirme.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  tips?: string;

  @ApiPropertyOptional({
    type: [String],
    enum: MUSCLE_GROUP_IDS,
    example: ['legs'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn([...MUSCLE_GROUP_IDS], { each: true })
  muscleGroupIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    enum: TARGET_MUSCLE_SLUGS,
    example: ['quadriceps', 'hamstring', 'gluteal'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn([...TARGET_MUSCLE_SLUGS], { each: true })
  targetMuscles?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
