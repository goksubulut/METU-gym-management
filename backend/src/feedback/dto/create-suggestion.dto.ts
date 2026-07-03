import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SuggestionType } from '@prisma/client';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SUGGESTION_TAGS } from '../feedback.constants';

/** FR-FB-4: genel öneri veya şikayet. */
export class CreateSuggestionDto {
  @ApiProperty({ enum: SuggestionType, example: SuggestionType.SUGGESTION })
  @IsEnum(SuggestionType, { message: 'Tip SUGGESTION veya COMPLAINT olmalı' })
  type!: SuggestionType;

  @ApiPropertyOptional({ enum: SUGGESTION_TAGS, example: 'Ekipman' })
  @IsOptional()
  @IsString()
  @IsIn([...SUGGESTION_TAGS], { message: 'Geçersiz konu etiketi' })
  tag?: string;

  @ApiProperty({ example: 'Daha fazla dambıl seti olsa harika olur' })
  @IsString()
  @MinLength(5, { message: 'Mesaj en az 5 karakter olmalı' })
  @MaxLength(1000)
  text!: string;
}
