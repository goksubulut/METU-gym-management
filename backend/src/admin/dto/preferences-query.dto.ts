import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class PreferencesQueryDto {
  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number = 30;
}

export class OccupancyQueryDto {
  @ApiPropertyOptional({ enum: ['hourly', 'daily', 'weekly'], default: 'daily' })
  @IsOptional()
  @IsIn(['hourly', 'daily', 'weekly'])
  period?: 'hourly' | 'daily' | 'weekly' = 'daily';
}
