import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { RATING_TAGS } from '../feedback.constants';

/** FR-FB-1 / FR-FB-2: makine puanlama (1–5 yıldız + opsiyonel etiketler). */
export class CreateRatingDto {
  @ApiProperty({ example: 'm3' })
  @IsString()
  @MaxLength(50)
  machineId!: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  score!: number;

  @ApiPropertyOptional({
    type: [String],
    enum: RATING_TAGS,
    example: ['Rahattı'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn([...RATING_TAGS], { each: true, message: 'Geçersiz puanlama etiketi' })
  tags?: string[];
}
