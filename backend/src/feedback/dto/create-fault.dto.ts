import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FaultSeverity } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** FR-FB-3: makine QR üzerinden arıza bildirimi. */
export class CreateFaultDto {
  @ApiProperty({ example: 'm4' })
  @IsString()
  @MaxLength(50)
  machineId!: string;

  @ApiProperty({ example: 'Ekran donuyor, hız değişmiyor' })
  @IsString()
  @MinLength(5, { message: 'Açıklama en az 5 karakter olmalı' })
  @MaxLength(500)
  description!: string;

  @ApiPropertyOptional({ enum: FaultSeverity, default: FaultSeverity.MEDIUM })
  @IsOptional()
  @IsEnum(FaultSeverity, { message: 'Geçersiz öncelik seviyesi' })
  severity?: FaultSeverity;
}
