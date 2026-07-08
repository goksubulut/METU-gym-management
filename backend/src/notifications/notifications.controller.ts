import { Controller, Get, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService, NotificationView } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Kişisel bildirimlerim (en yeni önce)' })
  findMine(@CurrentUser() user: AccessTokenPayload): Promise<NotificationView[]> {
    return this.notificationsService.findMine(user.sub);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bildirimi okundu işaretle' })
  markRead(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<NotificationView> {
    return this.notificationsService.markRead(user.sub, id);
  }
}
