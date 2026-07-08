import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ReminderService } from './reminder.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, ReminderService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
