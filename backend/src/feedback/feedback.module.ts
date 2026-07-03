import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

/**
 * Geri bildirim modülü (SRS §3.8, §9): puanlama, arıza bildirimi, öneri/şikayet.
 * Makine ortalama puanı catalog/machines uçlarında aggregate edilir.
 */
@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
