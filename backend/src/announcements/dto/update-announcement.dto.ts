import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ANNOUNCEMENT_CATEGORIES } from '../announcement.constants';

export class UpdateAnnouncementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  body?: string;

  @ApiPropertyOptional({ enum: ANNOUNCEMENT_CATEGORIES })
  @IsOptional()
  @IsIn([...ANNOUNCEMENT_CATEGORIES])
  category?: (typeof ANNOUNCEMENT_CATEGORIES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
