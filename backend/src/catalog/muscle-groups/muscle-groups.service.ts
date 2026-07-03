import { Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface MuscleGroupListItem {
  id: string;
  name: string;
  /** Kas haritası entegrasyon sözleşmesi: react-native-body-highlighter
   *  slug'ları (virgülle ayrık). Haritada tıklanan kas → bu listeyi içeren grup. */
  svgRegionCode: string | null;
  machineCount: number;
  exerciseCount: number;
}

export interface MuscleGroupDetail {
  id: string;
  name: string;
  svgRegionCode: string | null;
  machines: { id: string; name: string; category: string; location: string }[];
  exercises: Record<'free' | 'machine' | 'warmup' | 'cooldown', ExerciseItem[]>;
}

interface ExerciseItem {
  id: string;
  name: string;
  instructions: string | null;
  duration: string | null;
}

@Injectable()
export class MuscleGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  /** FR-CAT-2: interaktif iskelet haritasının veri kaynağı. */
  async findAll(): Promise<MuscleGroupListItem[]> {
    const groups = await this.prisma.muscleGroup.findMany({
      include: { _count: { select: { machines: true, exercises: true } } },
      orderBy: { name: 'asc' },
    });
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      svgRegionCode: g.svgRegionCode,
      machineCount: g._count.machines,
      exerciseCount: g._count.exercises,
    }));
  }

  /** FR-CAT-3: kasa dokununca o kası çalıştıran makineler + egzersizler.
   *  Egzersizler tipe göre gruplu döner; warmup/cooldown FR-WU-1'i karşılar. */
  async findOne(id: string): Promise<MuscleGroupDetail> {
    const group = await this.prisma.muscleGroup.findUnique({
      where: { id },
      include: {
        machines: {
          include: {
            machine: { select: { id: true, name: true, category: true, location: true, isActive: true } },
          },
        },
        exercises: {
          include: {
            exercise: { select: { id: true, name: true, type: true, instructions: true, duration: true } },
          },
        },
      },
    });
    if (!group) {
      throw new NotFoundException('Kas grubu bulunamadı');
    }

    const byType = (type: ExerciseType): ExerciseItem[] =>
      group.exercises
        .filter((e) => e.exercise.type === type)
        .map(({ exercise }) => ({
          id: exercise.id,
          name: exercise.name,
          instructions: exercise.instructions,
          duration: exercise.duration,
        }));

    return {
      id: group.id,
      name: group.name,
      svgRegionCode: group.svgRegionCode,
      machines: group.machines
        .filter((m) => m.machine.isActive)
        .map(({ machine }) => ({
          id: machine.id,
          name: machine.name,
          category: machine.category,
          location: machine.location,
        })),
      exercises: {
        free: byType(ExerciseType.FREE),
        machine: byType(ExerciseType.MACHINE),
        warmup: byType(ExerciseType.WARMUP),
        cooldown: byType(ExerciseType.COOLDOWN),
      },
    };
  }
}
