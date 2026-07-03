import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AlternativesQuery {
  @ApiPropertyOptional({
    description:
      'Verilirse her alternatif makine için o slottaki planlanma sayısı (doluluk tahmini, FR-RC-4) döner',
  })
  @IsOptional()
  @IsString()
  slotId?: string;
}
