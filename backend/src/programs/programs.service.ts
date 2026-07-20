import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseType, ProgramItemType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { ProgramItemDto } from './dto/program-item.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

export interface ProgramItemView {
  id: string;
  sortOrder: number;
  itemType: ProgramItemType;
  machineId: string | null;
  exerciseId: string | null;
  name: string;
  exerciseType: ExerciseType | null;
  unavailable: boolean;
}

export interface ProgramSummaryView {
  id: string;
  name: string;
  itemCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface ProgramDetailView extends ProgramSummaryView {
  items: ProgramItemView[];
}

type ItemRow = {
  id: string;
  sortOrder: number;
  itemType: ProgramItemType;
  machineId: string | null;
  exerciseId: string | null;
  machine: { name: string } | null;
  exercise: { name: string; type: ExerciseType } | null;
};

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string): Promise<ProgramSummaryView[]> {
    const rows = await this.prisma.workoutProgram.findMany({
      where: { userId },
      include: { _count: { select: { items: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      itemCount: r._count.items,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async findOne(userId: string, id: string): Promise<ProgramDetailView> {
    const program = await this.prisma.workoutProgram.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            machine: { select: { name: true } },
            exercise: { select: { name: true, type: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { items: true } },
      },
    });
    if (!program || program.userId !== userId) {
      throw new NotFoundException('Program bulunamadı');
    }
    return this.toDetailView(program, program.items);
  }

  async create(userId: string, dto: CreateProgramDto): Promise<ProgramDetailView> {
    await this.validateItems(dto.items);

    const program = await this.prisma.workoutProgram.create({
      data: {
        userId,
        name: dto.name.trim(),
        items: {
          create: dto.items.map((item, index) => ({
            sortOrder: index,
            itemType: item.itemType,
            machineId: item.machineId ?? null,
            exerciseId: item.exerciseId ?? null,
          })),
        },
      },
      include: {
        items: {
          include: {
            machine: { select: { name: true } },
            exercise: { select: { name: true, type: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { items: true } },
      },
    });

    return this.toDetailView(program, program.items);
  }

  async update(userId: string, id: string, dto: UpdateProgramDto): Promise<ProgramDetailView> {
    const existing = await this.prisma.workoutProgram.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Program bulunamadı');
    }

    if (dto.items) {
      await this.validateItems(dto.items);
    }

    await this.prisma.$transaction(async (tx) => {
      if (dto.name !== undefined) {
        await tx.workoutProgram.update({
          where: { id },
          data: { name: dto.name.trim() },
        });
      }

      if (dto.items) {
        await tx.workoutProgramItem.deleteMany({ where: { programId: id } });
        if (dto.items.length) {
          await tx.workoutProgramItem.createMany({
            data: dto.items.map((item, index) => ({
              programId: id,
              sortOrder: index,
              itemType: item.itemType,
              machineId: item.machineId ?? null,
              exerciseId: item.exerciseId ?? null,
            })),
          });
        }
      }
    });

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.prisma.workoutProgram.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Program bulunamadı');
    }
    await this.prisma.workoutProgram.delete({ where: { id } });
  }

  private async validateItems(items: ProgramItemDto[]): Promise<void> {
    for (const item of items) {
      if (item.itemType === ProgramItemType.MACHINE) {
        if (!item.machineId || item.exerciseId) {
          throw new BadRequestException('Makine öğesi için yalnızca machineId gerekli');
        }
        const machine = await this.prisma.machine.findFirst({
          where: { id: item.machineId, isActive: true },
        });
        if (!machine) throw new BadRequestException(`Makine bulunamadı: ${item.machineId}`);
      } else {
        if (!item.exerciseId || item.machineId) {
          throw new BadRequestException('Egzersiz öğesi için yalnızca exerciseId gerekli');
        }
        const exercise = await this.prisma.exercise.findUnique({ where: { id: item.exerciseId } });
        if (!exercise) throw new BadRequestException(`Egzersiz bulunamadı: ${item.exerciseId}`);
      }
    }
  }

  private toDetailView(
    program: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      _count: { items: number };
    },
    items: ItemRow[],
  ): ProgramDetailView {
    return {
      id: program.id,
      name: program.name,
      itemCount: program._count.items,
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
      items: items.map((item) => ({
        id: item.id,
        sortOrder: item.sortOrder,
        itemType: item.itemType,
        machineId: item.machineId,
        exerciseId: item.exerciseId,
        name: item.machine?.name ?? item.exercise?.name ?? 'Silinmiş öğe',
        exerciseType: item.exercise?.type ?? null,
        unavailable: !item.machine && !item.exercise,
      })),
    };
  }
}
