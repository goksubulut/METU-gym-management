import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FaultSeverity, FaultStatus, SuggestionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaultDto } from './dto/create-fault.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';

export interface RatingView {
  id: string;
  machineId: string;
  machineName: string;
  score: number;
  tags: string[];
  createdAt: Date;
  machineAverageRating: number | null;
}

export interface FaultView {
  id: string;
  machineId: string;
  machineName: string;
  description: string;
  severity: FaultSeverity;
  status: FaultStatus;
  createdAt: Date;
}

export interface SuggestionView {
  id: string;
  type: SuggestionType;
  tag: string | null;
  text: string;
  createdAt: Date;
}

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  /** FR-FB-1 / FR-FB-2 */
  async createRating(userId: string, dto: CreateRatingDto): Promise<RatingView> {
    await this.assertActiveMachine(dto.machineId);

    const rating = await this.prisma.rating.create({
      data: {
        userId,
        machineId: dto.machineId,
        score: dto.score,
        tags: dto.tags ?? [],
      },
      include: { machine: { select: { name: true } } },
    });

    const machineAverageRating = await this.averageRatingForMachine(dto.machineId);

    return {
      id: rating.id,
      machineId: rating.machineId,
      machineName: rating.machine.name,
      score: rating.score,
      tags: rating.tags,
      createdAt: rating.createdAt,
      machineAverageRating,
    };
  }

  /** FR-FB-3 */
  async createFault(userId: string, dto: CreateFaultDto): Promise<FaultView> {
    await this.assertActiveMachine(dto.machineId);

    const fault = await this.prisma.faultReport.create({
      data: {
        userId,
        machineId: dto.machineId,
        description: dto.description.trim(),
        severity: dto.severity ?? FaultSeverity.MEDIUM,
      },
      include: { machine: { select: { name: true } } },
    });

    return {
      id: fault.id,
      machineId: fault.machineId,
      machineName: fault.machine.name,
      description: fault.description,
      severity: fault.severity,
      status: fault.status,
      createdAt: fault.createdAt,
    };
  }

  /** FR-FB-4 */
  async createSuggestion(userId: string, dto: CreateSuggestionDto): Promise<SuggestionView> {
    const suggestion = await this.prisma.suggestion.create({
      data: {
        userId,
        type: dto.type,
        tag: dto.tag,
        text: dto.text.trim(),
      },
    });

    return {
      id: suggestion.id,
      type: suggestion.type,
      tag: suggestion.tag,
      text: suggestion.text,
      createdAt: suggestion.createdAt,
    };
  }

  // ---------------------------------------------------------------------------

  private async assertActiveMachine(machineId: string): Promise<void> {
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
      select: { id: true, isActive: true },
    });
    if (!machine || !machine.isActive) {
      throw new NotFoundException('Makine bulunamadı');
    }
  }

  /** Makine detay/liste uçlarıyla aynı yuvarlama: 1 ondalık, puan yoksa null. */
  private async averageRatingForMachine(machineId: string): Promise<number | null> {
    const agg = await this.prisma.rating.aggregate({
      where: { machineId },
      _avg: { score: true },
      _count: { _all: true },
    });
    if (!agg._count._all) {
      return null;
    }
    const avg = agg._avg.score;
    if (avg === null) {
      throw new BadRequestException('Puan ortalaması hesaplanamadı');
    }
    return Math.round(avg * 10) / 10;
  }
}
