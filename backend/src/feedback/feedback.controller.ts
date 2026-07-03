import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateFaultDto } from './dto/create-fault.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { FeedbackService, FaultView, RatingView, SuggestionView } from './feedback.service';

@ApiTags('feedback')
@ApiBearerAuth()
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('ratings')
  @ApiOperation({ summary: 'Makine puanla — 1–5 yıldız + opsiyonel etiketler (FR-FB-1, FR-FB-2)' })
  createRating(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateRatingDto,
  ): Promise<RatingView> {
    return this.feedbackService.createRating(user.sub, dto);
  }

  @Post('faults')
  @ApiOperation({ summary: 'Makine arızası bildir — QR deep-link hedefi (FR-FB-3)' })
  createFault(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateFaultDto,
  ): Promise<FaultView> {
    return this.feedbackService.createFault(user.sub, dto);
  }

  @Post('suggestions')
  @ApiOperation({ summary: 'Genel öneri veya şikayet bırak (FR-FB-4)' })
  createSuggestion(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateSuggestionDto,
  ): Promise<SuggestionView> {
    return this.feedbackService.createSuggestion(user.sub, dto);
  }
}
