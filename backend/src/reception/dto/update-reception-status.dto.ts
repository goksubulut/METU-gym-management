import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateReceptionStatusDto {
  @ApiProperty({ enum: ['pending', 'checked-in', 'no-show'] })
  @IsIn(['pending', 'checked-in', 'no-show'])
  status!: 'pending' | 'checked-in' | 'no-show';
}
