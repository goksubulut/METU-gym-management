import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProgramItemType } from '@prisma/client';

export class ProgramItemDto {
  @ApiProperty({ enum: ProgramItemType })
  @IsEnum(ProgramItemType)
  itemType!: ProgramItemType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  machineId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exerciseId?: string;
}
