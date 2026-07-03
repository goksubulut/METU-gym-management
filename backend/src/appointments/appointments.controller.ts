import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/auth.types';
import { AppointmentsService, AppointmentView } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Randevu oluştur — makine/kas grubu planı opsiyonel (FR-BK-1..5)' })
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateAppointmentDto): Promise<AppointmentView> {
    return this.appointmentsService.create(user.sub, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Randevularım (FR-BK-6)' })
  findMine(@CurrentUser() user: AccessTokenPayload): Promise<AppointmentView[]> {
    return this.appointmentsService.findMine(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Randevu detayı (sahibi veya admin/resepsiyon)' })
  findOne(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<AppointmentView> {
    return this.appointmentsService.findOne(user.sub, user.role, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Randevuyu/planı güncelle (FR-BK-4, FR-BK-6)' })
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ): Promise<AppointmentView> {
    return this.appointmentsService.update(user.sub, user.role, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Randevuyu iptal et (kayıt silinmez, durum CANCELLED olur)' })
  cancel(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<AppointmentView> {
    return this.appointmentsService.cancel(user.sub, user.role, id);
  }
}
