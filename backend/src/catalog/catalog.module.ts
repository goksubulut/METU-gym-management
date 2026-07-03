import { Module } from '@nestjs/common';
import { ExercisesController } from './exercises/exercises.controller';
import { ExercisesService } from './exercises/exercises.service';
import { MachinesController } from './machines/machines.controller';
import { MachinesService } from './machines/machines.service';
import { MuscleGroupsController } from './muscle-groups/muscle-groups.controller';
import { MuscleGroupsService } from './muscle-groups/muscle-groups.service';

/**
 * Katalog: makine + kas grubu + egzersiz okuma uçları ve öneri motoru.
 * Tamamı @Public (FR-CAT-1); yazma işlemleri (puan, arıza) feedback modülünde.
 */
@Module({
  controllers: [MachinesController, MuscleGroupsController, ExercisesController],
  providers: [MachinesService, MuscleGroupsService, ExercisesService],
  exports: [MachinesService],
})
export class CatalogModule {}
