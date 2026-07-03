import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class GetSlotsQuery {
  @ApiProperty({ example: '2026-07-03', description: 'YYYY-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tarih YYYY-MM-DD biçiminde olmalı' })
  date!: string;
}
