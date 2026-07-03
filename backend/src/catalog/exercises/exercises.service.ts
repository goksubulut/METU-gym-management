import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExercisesQuery } from './dto/exercises.query';

export interface ExerciseListItem {
  id: string;
  name: string;
  type: string;
  instructions: string | null;
  duration: string | null;
  videoUrl: string | null;
  muscleGroups: { id: string; name: string }[];
}

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Egzersiz listesi — tip (ısınma/soğuma dahil, FR-WU-1) ve kas grubu filtreli. */
  async findAll(query: ExercisesQuery): Promise<ExerciseListItem[]> {
    const exercises = await this.prisma.exercise.findMany({
      where: {
        type: query.type,
        muscleGroups: query.muscleGroup ? { some: { muscleGroupId: query.muscleGroup } } : undefined,
      },
      include: { muscleGroups: { include: { muscleGroup: { select: { id: true, name: true } } } } },
      orderBy: { name: 'asc' },
    });
    return exercises.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      instructions: e.instructions,
      duration: e.duration,
      videoUrl: e.videoUrl,
      muscleGroups: e.muscleGroups.map((mg) => mg.muscleGroup),
    }));
  }
}
