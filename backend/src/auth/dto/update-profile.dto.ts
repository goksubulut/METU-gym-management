import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'yeni@example.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta girin' })
  email!: string;
}
