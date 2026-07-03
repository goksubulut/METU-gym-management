import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { OccupancyQueryDto, PreferencesQueryDto } from './dto/preferences-query.dto';
import { UpdateFaultStatusDto } from './dto/update-fault-status.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'Genel bakış — özet, haftalık doluluk, top makineler (FR-AD-1)' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('analytics/preferences')
  @ApiOperation({ summary: 'Tercih analizi — makine ve kas grubu (FR-AD-1)' })
  getPreferences(@Query() query: PreferencesQueryDto) {
    return this.adminService.getPreferences(query.days ?? 30);
  }

  @Get('analytics/quality')
  @ApiOperation({ summary: 'Kalite metrikleri — puan, arıza, şikayet (FR-AD-2)' })
  getQuality() {
    return this.adminService.getQuality();
  }

  @Get('analytics/occupancy')
  @ApiOperation({ summary: 'Yoğunluk — saatlik / günlük / haftalık (FR-AD-3)' })
  getOccupancy(@Query() query: OccupancyQueryDto) {
    return this.adminService.getOccupancy(query.period ?? 'daily');
  }

  @Get('analytics/matrix')
  @ApiOperation({ summary: 'Tercih × Memnuniyet matrisi (FR-AD-4)' })
  getMatrix() {
    return this.adminService.getMatrix();
  }

  @Get('faults')
  @ApiOperation({ summary: 'Arıza bildirimleri listesi (FR-AD-5)' })
  listFaults() {
    return this.adminService.listFaults();
  }

  @Patch('faults/:id')
  @ApiOperation({ summary: 'Arıza durumu güncelle (FR-AD-5)' })
  updateFault(@Param('id') id: string, @Body() dto: UpdateFaultStatusDto) {
    return this.adminService.updateFaultStatus(id, dto.status);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Öneri/şikayet listesi + etiket dağılımı (FR-AD-5)' })
  listSuggestions() {
    return this.adminService.listSuggestions();
  }
}
