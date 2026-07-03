import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayUnique, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'GET /slots cevabındaki slot id' })
  @IsString()
  slotId!: string;

  // FR-BK-3: makine seçimi OPSİYONEL. Boş bırakılırsa Yol B (yalnızca
  // tarih/saat randevusu); doldurulursa Yol A (kişisel plan).
  @ApiPropertyOptional({ type: [String], example: ['m3', 'm6'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @ArrayMaxSize(20)
  machineIds?: string[];

  @ApiPropertyOptional({ type: [String], example: ['chest', 'arms'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @ArrayMaxSize(8)
  muscleGroupIds?: string[];

  @ApiPropertyOptional({ example: 'Üst vücut günü' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
