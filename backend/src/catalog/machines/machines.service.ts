import { Injectable, NotFoundException } from '@nestjs/common';
import { FaultStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OCCUPYING_STATUSES } from '../../slots/slots.service';
import { MachinesQuery } from './dto/machines.query';

export interface MachineListItem {
  id: string;
  name: string;
  category: string;
  location: string;
  photoUrl: string | null;
  description: string | null;
  tips: string | null;
  muscleGroups: { id: string; name: string }[];
  targetMuscles: string[]; // ince hedef kas slug'ları (hibrit öneri)
  rating: number | null; // ortalama puan (1 ondalık) — hiç puan yoksa null
  reviews: number;
  openFaults: number;
  hasVideo: boolean;
}

export interface MachineDetail extends MachineListItem {
  videos: { id: string; title: string; url: string }[];
  qrCode: string;
}

export interface AlternativeMachine extends MachineListItem {
  sharedMuscleGroups: string[]; // istenen makineyle ortak kas grubu id'leri
  sharedTargets: string[]; // istenen makineyle ortak ince hedef kaslar (hibrit sıralama)
  plannedCount?: number; // slotId verildiyse: o slotta bu makineyi planlayan onaylı randevu sayısı
}

export interface AlternativesResult {
  machine: { id: string; name: string; muscleGroups: string[]; targetMuscles: string[] };
  slotId: string | null;
  // true: salonda bu makinenin ince hedef kasını birebir paylaşan başka makine yok
  // (ör. Adductor & Abductor). UI'da bilgilendirme banner'ı gösterilir.
  noDirectMatch: boolean;
  alternativeMachines: AlternativeMachine[];
  alternativeExercises: {
    id: string;
    name: string;
    type: string;
    instructions: string | null;
    targetMuscles: string[];
    sharedTargets: string[];
    muscleGroups: { id: string; name: string }[];
  }[];
}

const MACHINE_INCLUDE = {
  muscleGroups: { include: { muscleGroup: { select: { id: true, name: true } } } },
  videos: { select: { id: true, title: true, url: true } },
} satisfies Prisma.MachineInclude;

type MachineRecord = Prisma.MachineGetPayload<{ include: typeof MACHINE_INCLUDE }>;

/** Puan ve arıza sayıları makine başına toplanmış halde. */
interface MachineStats {
  rating: Map<string, { avg: number; count: number }>;
  openFaults: Map<string, number>;
}

@Injectable()
export class MachinesService {
  constructor(private readonly prisma: PrismaService) {}

  /** FR-CAT-1/2: genel makine listesi; kategori ve kas grubu filtreli. */
  async findAll(query: MachinesQuery): Promise<MachineListItem[]> {
    const machines = await this.prisma.machine.findMany({
      where: {
        isActive: true,
        category: query.category,
        muscleGroups: query.muscleGroup ? { some: { muscleGroupId: query.muscleGroup } } : undefined,
      },
      include: MACHINE_INCLUDE,
      orderBy: { name: 'asc' },
    });
    const stats = await this.loadStats(machines.map((m) => m.id));
    return machines.map((m) => this.toListItem(m, stats));
  }

  /** FR-CAT-4 / FR-QR-2: makine detayı (video + puan; arıza/puanlama uçları feedback modülünde). */
  async findOne(id: string): Promise<MachineDetail> {
    const machine = await this.prisma.machine.findUnique({ where: { id }, include: MACHINE_INCLUDE });
    if (!machine || !machine.isActive) {
      throw new NotFoundException('Makine bulunamadı');
    }
    const stats = await this.loadStats([id]);
    return { ...this.toListItem(machine, stats), videos: machine.videos, qrCode: machine.qrCode };
  }

  /**
   * Öneri motoru (FR-RC-1..4): aynı kas grubunu çalıştıran alternatif
   * makineler + egzersizler. Ayrı tablo yok — kas grubu bağlarından türetilir.
   *
   * Kurallar:
   * 1. Kardiyo ↔ kuvvet ayrımı: kardiyo makinesi dolunca yalnızca kardiyo,
   *    kuvvet makinesi dolunca kardiyo hariç makineler önerilir (koşu bandı
   *    dolunca leg press önerilmesin, tersi de).
   * 2. Sıralama: önce ortak ince hedef kas (targetMuscles) sayısı, sonra
   *    "hedef paylaşma oranı" (ortak hedef / adayın toplam hedefi) — böylece en
   *    isabetli/özel makine öne gelir (biceps curl dolunca preacher curl, triceps
   *    press'ten önce). Puan sıralamada KULLANILMAZ; puansız makineler
   *    cezalandırılmaz.
   * 3. noDirectMatch: hiçbir aday ince hedef kası paylaşmıyorsa (ör. Adductor &
   *    Abductor) UI'da "birebir muadil yok" bilgilendirmesi için işaretlenir.
   */
  async findAlternatives(id: string, slotId?: string): Promise<AlternativesResult> {
    const machine = await this.prisma.machine.findUnique({ where: { id }, include: MACHINE_INCLUDE });
    if (!machine || !machine.isActive) {
      throw new NotFoundException('Makine bulunamadı');
    }
    const groupIds = machine.muscleGroups.map((mg) => mg.muscleGroup.id);
    const sourceTargets = machine.targetMuscles;
    const sourceIsCardio = groupIds.includes('cardio');

    const rawCandidates = await this.prisma.machine.findMany({
      where: {
        isActive: true,
        id: { not: id },
        muscleGroups: { some: { muscleGroupId: { in: groupIds } } },
      },
      include: MACHINE_INCLUDE,
    });
    // Kural 1: kaynakla aynı sınıf (kardiyo/kuvvet) makineler kalsın.
    const candidates = rawCandidates.filter(
      (m) => m.muscleGroups.some((mg) => mg.muscleGroup.id === 'cardio') === sourceIsCardio,
    );
    const stats = await this.loadStats(candidates.map((m) => m.id));
    const planned = slotId ? await this.loadPlannedCounts(slotId) : undefined;

    // Hedef paylaşma oranı: ortak ince hedef / adayın toplam hedef sayısı.
    const targetRatio = (sharedLen: number, total: number) => (total > 0 ? sharedLen / total : 0);

    const alternativeMachines = candidates
      .map((m) => {
        const shared = m.muscleGroups.map((mg) => mg.muscleGroup.id).filter((g) => groupIds.includes(g));
        const sharedTargets = m.targetMuscles.filter((t) => sourceTargets.includes(t));
        return {
          ...this.toListItem(m, stats),
          sharedMuscleGroups: shared,
          sharedTargets,
          plannedCount: planned ? (planned.get(m.id) ?? 0) : undefined,
        };
      })
      .sort(
        (a, b) =>
          b.sharedTargets.length - a.sharedTargets.length ||
          targetRatio(b.sharedTargets.length, b.targetMuscles.length) -
            targetRatio(a.sharedTargets.length, a.targetMuscles.length) ||
          b.sharedMuscleGroups.length - a.sharedMuscleGroups.length ||
          a.name.localeCompare(b.name),
      );

    // Kural 3: ince hedef kası paylaşan hiçbir makine yoksa bilgilendir.
    const noDirectMatch =
      sourceTargets.length > 0 && alternativeMachines.every((m) => m.sharedTargets.length === 0);

    // Alternatif egzersizler: aynı kas grubunu çalıştıran serbest/makine egzersizleri
    // (ısınma-soğuma hariç — onlar FR-WU-1 kapsamında ayrı sunulur).
    // Makinelerle aynı mantık: önce ince hedef örtüşmesi, sonra paylaşma oranı, sonra ad.
    const exercises = await this.prisma.exercise.findMany({
      where: {
        type: { in: ['FREE', 'MACHINE'] },
        muscleGroups: { some: { muscleGroupId: { in: groupIds } } },
      },
      include: { muscleGroups: { include: { muscleGroup: { select: { id: true, name: true } } } } },
      orderBy: { name: 'asc' },
    });

    const alternativeExercises = exercises
      .map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        instructions: e.instructions,
        targetMuscles: e.targetMuscles,
        sharedTargets: e.targetMuscles.filter((t) => sourceTargets.includes(t)),
        muscleGroups: e.muscleGroups.map((mg) => mg.muscleGroup),
      }))
      .sort(
        (a, b) =>
          b.sharedTargets.length - a.sharedTargets.length ||
          targetRatio(b.sharedTargets.length, b.targetMuscles.length) -
            targetRatio(a.sharedTargets.length, a.targetMuscles.length) ||
          a.name.localeCompare(b.name),
      );

    return {
      machine: { id: machine.id, name: machine.name, muscleGroups: groupIds, targetMuscles: sourceTargets },
      slotId: slotId ?? null,
      noDirectMatch,
      alternativeMachines,
      alternativeExercises,
    };
  }

  // ---------------------------------------------------------------------------

  /** Puan ortalaması ve açık arıza sayısı — makine başına ikişer groupBy (N+1 yok). */
  private async loadStats(machineIds: string[]): Promise<MachineStats> {
    const [ratings, faults] = await Promise.all([
      this.prisma.rating.groupBy({
        by: ['machineId'],
        where: { machineId: { in: machineIds } },
        _avg: { score: true },
        _count: { _all: true },
      }),
      this.prisma.faultReport.groupBy({
        by: ['machineId'],
        where: { machineId: { in: machineIds }, status: { not: FaultStatus.RESOLVED } },
        _count: { _all: true },
      }),
    ]);
    return {
      rating: new Map(
        ratings.map((r) => [r.machineId, { avg: r._avg.score ?? 0, count: r._count._all }]),
      ),
      openFaults: new Map(faults.map((f) => [f.machineId, f._count._all])),
    };
  }

  /** Slottaki onaylı randevuların makine planı sayıları (SRS: doluluk tahmini kaynağı). */
  private async loadPlannedCounts(slotId: string): Promise<Map<string, number>> {
    const rows = await this.prisma.appointmentMachine.groupBy({
      by: ['machineId'],
      where: { appointment: { slotId, status: { in: OCCUPYING_STATUSES } } },
      _count: { _all: true },
    });
    return new Map(rows.map((r) => [r.machineId, r._count._all]));
  }

  private toListItem(machine: MachineRecord, stats: MachineStats): MachineListItem {
    const rating = stats.rating.get(machine.id);
    return {
      id: machine.id,
      name: machine.name,
      category: machine.category,
      location: machine.location,
      photoUrl: machine.photoUrl,
      description: machine.description,
      tips: machine.tips,
      muscleGroups: machine.muscleGroups.map((mg) => mg.muscleGroup),
      targetMuscles: machine.targetMuscles,
      rating: rating ? Math.round(rating.avg * 10) / 10 : null,
      reviews: rating?.count ?? 0,
      openFaults: stats.openFaults.get(machine.id) ?? 0,
      hasVideo: machine.videos.length > 0,
    };
  }
}
