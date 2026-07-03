import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'gyeduernest@gmail.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta girin' })
  email!: string;

  @ApiProperty({ example: 'user1234' })
  @IsString()
  @IsNotEmpty({ message: 'Parola boş olamaz' })
  password!: string;
}
