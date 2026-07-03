import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'Login/refresh cevabındaki refreshToken' })
  @IsJWT({ message: 'Geçerli bir refresh token girin' })
  refreshToken!: string;
}
