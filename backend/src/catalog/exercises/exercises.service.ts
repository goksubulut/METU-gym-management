import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExercisesQuery } from './dto/exercises.query';

export interface ExerciseListItem {
  id: string;
  name: string;
  type: string;
  instructions: string | null;
  duration: string | null;
  videoUrl: string | null;
  targetMuscles: string[];
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
      targetMuscles: e.targetMuscles,
      muscleGroups: e.muscleGroups.map((mg) => mg.muscleGroup),
    }));
  }

  /** Egzersiz detayı — kendi katalog/detay ekranı için (FR-WU-1 ekini genişletir). */
  async findOne(id: string): Promise<ExerciseListItem> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      include: { muscleGroups: { include: { muscleGroup: { select: { id: true, name: true } } } } },
    });
    if (!exercise) {
      throw new NotFoundException('Egzersiz bulunamadı');
    }
    return {
      id: exercise.id,
      name: exercise.name,
      type: exercise.type,
      instructions: exercise.instructions,
      duration: exercise.duration,
      videoUrl: exercise.videoUrl,
      targetMuscles: exercise.targetMuscles,
      muscleGroups: exercise.muscleGroups.map((mg) => mg.muscleGroup),
    };
  }
}
