import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetSlotsQuery } from './dto/get-slots.query';
import { SlotsService, SlotView } from './slots.service';

@ApiTags('slots')
@ApiBearerAuth()
@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get()
  @ApiOperation({ summary: 'Bir günün slotları + doluluk tahmini (FR-BK-7)' })
  getSlots(@Query() query: GetSlotsQuery): Promise<{ date: string; slots: SlotView[] }> {
    return this.slotsService.getForDate(query.date);
  }
}
