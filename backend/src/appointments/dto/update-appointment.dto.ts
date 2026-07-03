import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayUnique, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * FR-BK-4/6: plan güncelleme. Gönderilen alan komple değiştirilir
 * (makine listesi diff değil, yeni liste olarak gelir); gönderilmeyen alan korunur.
 */
export class UpdateAppointmentDto {
  @ApiPropertyOptional({ description: 'Randevuyu başka bir slota taşı' })
  @IsOptional()
  @IsString()
  slotId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @ArrayMaxSize(20)
  machineIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @ArrayMaxSize(8)
  muscleGroupIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
