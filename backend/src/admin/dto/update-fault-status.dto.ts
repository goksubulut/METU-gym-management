import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateFaultStatusDto {
  @ApiProperty({ enum: ['open', 'in-progress', 'resolved'] })
  @IsIn(['open', 'in-progress', 'resolved'])
  status!: 'open' | 'in-progress' | 'resolved';
}
