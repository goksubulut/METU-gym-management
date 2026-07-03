import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { MuscleGroupDetail, MuscleGroupListItem, MuscleGroupsService } from './muscle-groups.service';

@ApiTags('catalog')
@Controller('muscle-groups')
export class MuscleGroupsController {
  constructor(private readonly muscleGroupsService: MuscleGroupsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Kas grupları + harita slug eşlemesi (FR-CAT-2)' })
  findAll(): Promise<MuscleGroupListItem[]> {
    return this.muscleGroupsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Kas grubunu çalıştıran makine ve egzersizler (FR-CAT-3, FR-WU-1)' })
  findOne(@Param('id') id: string): Promise<MuscleGroupDetail> {
    return this.muscleGroupsService.findOne(id);
  }
}
