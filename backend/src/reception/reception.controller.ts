import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateReceptionStatusDto } from './dto/update-reception-status.dto';
import { ReceptionService } from './reception.service';

@ApiTags('reception')
@ApiBearerAuth()
@Roles(Role.RECEPTION, Role.ADMIN)
@Controller('reception')
export class ReceptionController {
  constructor(private readonly receptionService: ReceptionService) {}

  @Get('appointments/today')
  @ApiOperation({ summary: 'Bugünün randevu / check-in listesi' })
  getToday() {
    return this.receptionService.getTodayAppointments();
  }

  @Get('appointments/:id')
  @ApiOperation({ summary: 'Bugünkü randevu detayı' })
  getOne(@Param('id') id: string) {
    return this.receptionService.getAppointment(id);
  }

  @Patch('appointments/:id/status')
  @ApiOperation({ summary: 'Check-in / gelmedi / bekliyor durumu güncelle' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReceptionStatusDto) {
    return this.receptionService.updateStatus(id, dto.status);
  }
}
