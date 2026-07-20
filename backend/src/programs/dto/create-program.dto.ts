import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { ProgramItemDto } from './program-item.dto';

export class CreateProgramDto {
  @ApiProperty({ example: 'Üst vücut günü' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @ApiProperty({ type: [ProgramItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProgramItemDto)
  items!: ProgramItemDto[];
}
