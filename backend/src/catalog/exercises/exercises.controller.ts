import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { ExercisesQuery } from './dto/exercises.query';
import { ExerciseListItem, ExercisesService } from './exercises.service';

@ApiTags('catalog')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Egzersiz listesi — tip/kas grubu filtreli (FR-WU-1 dahil)' })
  findAll(@Query() query: ExercisesQuery): Promise<ExerciseListItem[]> {
    return this.exercisesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Egzersiz detayı — kendi katalog ekranı için' })
  findOne(@Param('id') id: string): Promise<ExerciseListItem> {
    return this.exercisesService.findOne(id);
  }
}
