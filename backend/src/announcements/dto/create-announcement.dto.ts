import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  ANNOUNCEMENT_CATEGORIES,
  ANNOUNCEMENT_CATEGORY_DEFAULT,
} from '../announcement.constants';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Aylık üyelik fiyat güncellemesi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: '1 Ağustos itibarıyla aylık üyelik 450 TL olacaktır.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body!: string;

  @ApiPropertyOptional({
    enum: ANNOUNCEMENT_CATEGORIES,
    default: ANNOUNCEMENT_CATEGORY_DEFAULT,
  })
  @IsOptional()
  @IsIn([...ANNOUNCEMENT_CATEGORIES])
  category?: (typeof ANNOUNCEMENT_CATEGORIES)[number];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
