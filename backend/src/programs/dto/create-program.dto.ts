import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { TARGET_MUSCLE_SLUGS } from '../../catalog/machines/machine.constants';
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

  @ApiPropertyOptional({ type: [String], example: ['adductors', 'calves'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsIn([...TARGET_MUSCLE_SLUGS], { each: true })
  targetMuscles?: string[];
}
