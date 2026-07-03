import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { AlternativesQuery } from './dto/alternatives.query';
import { MachinesQuery } from './dto/machines.query';
import {
  AlternativesResult,
  MachineDetail,
  MachineListItem,
  MachinesService,
} from './machines.service';

/** FR-CAT-1: genel makine listesi tüm kullanıcılara her an açıktır → @Public. */
@ApiTags('catalog')
@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Makine listesi — kategori/kas grubu filtreli (FR-CAT-1/2)' })
  findAll(@Query() query: MachinesQuery): Promise<MachineListItem[]> {
    return this.machinesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Makine detayı: video, puan, konum (FR-QR-2 hedef sayfası)' })
  findOne(@Param('id') id: string): Promise<MachineDetail> {
    return this.machinesService.findOne(id);
  }

  @Public()
  @Get(':id/alternatives')
  @ApiOperation({ summary: 'Öneri motoru: aynı kas grubunu çalıştıran alternatifler (FR-RC-1..4)' })
  findAlternatives(@Param('id') id: string, @Query() query: AlternativesQuery): Promise<AlternativesResult> {
    return this.machinesService.findAlternatives(id, query.slotId);
  }
}
