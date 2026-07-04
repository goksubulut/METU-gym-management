import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { MachineQrView, QrService, QrView } from './qr.service';

/** QR üretimi baskı amaçlıdır ve yalnızca admin panelinden yapılır. */
@ApiTags('qr')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get('door')
  @ApiOperation({ summary: 'Kapı QR\'ı — bilgilendirme sayfası deep-link\'i (FR-QR-1)' })
  getDoorQr(): Promise<QrView> {
    return this.qrService.forDoor();
  }

  @Get('machines/:id')
  @ApiOperation({ summary: 'Makine QR\'ı — makine detay deep-link\'i (FR-QR-2/3)' })
  getMachineQr(@Param('id') id: string): Promise<MachineQrView> {
    return this.qrService.forMachine(id);
  }
}
