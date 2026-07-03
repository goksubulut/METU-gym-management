import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AppointmentStatus,
  FaultStatus,
  SuggestionType,
} from '@prisma/client';
import {
  addDaysToKey,
  shortReporterName,
  todayKey,
  turkishDayLabel,
} from '../common/utils/ui-mapper.util';
import { PrismaService } from '../prisma/prisma.service';
import { OCCUPYING_STATUSES } from '../slots/slots.service';
import { toDateKey } from '../slots/slot-time.util';

export interface AdminSummary {
  todayAppointments: number;
  occupancy: number;
  avgRating: number;
  openFaults: number;
}

export interface OccupancyTrendPoint {
  day: string;
  occupancy: number;
}

export interface TopMachinePoint {
  name: string;
  rating: number;
  uses: number;
}

export interface MachinePreferencePoint {
  name: string;
  count: number;
}

export interface MuscleGroupPopularityPoint {
  group: string;
  value: number;
}

export interface MostFaultyPoint {
  name: string;
  faults: number;
  rating: number;
}

export interface MostComplainedPoint {
  name: string;
  complaints: number;
}

export interface MatrixPoint {
  name: string;
  uses: number;
  rating: number;
}

export interface FeedbackTagPoint {
  tag: string;
  value: number;
}

export interface AdminFaultRow {
  id: string;
  machineId: string;
  machine: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'open' | 'in-progress' | 'resolved';
  date: string;
  reporter: string;
}

export interface AdminSuggestionRow {
  id: string;
  type: 'Öneri' | 'Şikayet';
  tag: string;
  text: string;
  date: string;
  user: string;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(): Promise<{
    summary: AdminSummary;
    occupancyTrend: OccupancyTrendPoint[];
    topMachines: TopMachinePoint[];
  }> {
    const [summary, occupancyTrend, topMachines] = await Promise.all([
      this.getSummary(),
      this.getWeeklyOccupancyTrend(),
      this.getTopMachines(5),
    ]);
    return { summary, occupancyTrend, topMachines };
  }

  async getPreferences(days: number): Promise<{
    machinePreference: MachinePreferencePoint[];
    muscleGroupPopularity: MuscleGroupPopularityPoint[];
  }> {
    const since = this.sinceDate(days);
    const [machinePreference, muscleGroupPopularity] = await Promise.all([
      this.getMachinePreference(since),
      this.getMuscleGroupPopularity(since),
    ]);
    return { machinePreference, muscleGroupPopularity };
  }

  async getQuality(): Promise<{
    summary: AdminSummary & { totalReviews: number; resolutionRate: number };
    mostFaulty: MostFaultyPoint[];
    mostComplained: MostComplainedPoint[];
  }> {
    const summary = await this.getSummary();
    const totalReviews = await this.prisma.rating.count();
    const resolvedFaults = await this.prisma.faultReport.count({ where: { status: FaultStatus.RESOLVED } });
    const totalFaults = await this.prisma.faultReport.count();
    const resolutionRate = totalFaults ? Math.round((resolvedFaults / totalFaults) * 100) : 0;

    const [mostFaulty, mostComplained] = await Promise.all([
      this.getMostFaulty(4),
      this.getMostComplained(4),
    ]);

    return {
      summary: { ...summary, totalReviews, resolutionRate },
      mostFaulty,
      mostComplained,
    };
  }

  async getOccupancy(period: 'hourly' | 'daily' | 'weekly'): Promise<{ label: string; occupancy: number }[]> {
    if (period === 'hourly') return this.getHourlyOccupancyToday();
    if (period === 'weekly') return this.getWeeklyOccupancyByWeek();
    const trend = await this.getWeeklyOccupancyTrend();
    return trend.map((p) => ({ label: p.day, occupancy: p.occupancy }));
  }

  async getMatrix(): Promise<{ matrixData: MatrixPoint[] }> {
    const matrixData = await this.getMatrixData();
    return { matrixData };
  }

  async listFaults(): Promise<AdminFaultRow[]> {
    const rows = await this.prisma.faultReport.findMany({
      include: {
        machine: { select: { id: true, name: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((f) => ({
      id: f.id,
      machineId: f.machineId,
      machine: f.machine.name,
      issue: f.description,
      severity: f.severity.toLowerCase() as 'low' | 'medium' | 'high',
      status:
        f.status === FaultStatus.PENDING
          ? 'pending'
          : f.status === FaultStatus.IN_PROGRESS
            ? 'in-progress'
            : f.status === FaultStatus.RESOLVED
              ? 'resolved'
              : 'open',
      date: toDateKey(f.createdAt),
      reporter: shortReporterName(f.user.name),
    }));
  }

  async updateFaultStatus(id: string, status: 'open' | 'in-progress' | 'resolved'): Promise<AdminFaultRow> {
    const existing = await this.prisma.faultReport.findUnique({ where: { id } });
    if (!existing) {
      throw new BadRequestException('Arıza bildirimi bulunamadı');
    }
    const dbStatus =
      status === 'in-progress'
        ? FaultStatus.IN_PROGRESS
        : status === 'resolved'
          ? FaultStatus.RESOLVED
          : FaultStatus.OPEN;
    await this.prisma.faultReport.update({ where: { id }, data: { status: dbStatus } });
    const updated = (await this.listFaults()).find((f) => f.id === id);
    if (!updated) {
      throw new BadRequestException('Arıza güncellenemedi');
    }
    return updated;
  }

  async listSuggestions(): Promise<{ feedbackList: AdminSuggestionRow[]; feedbackTags: FeedbackTagPoint[] }> {
    const rows = await this.prisma.suggestion.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const feedbackList: AdminSuggestionRow[] = rows.map((s) => ({
      id: s.id,
      type: s.type === SuggestionType.SUGGESTION ? 'Öneri' : 'Şikayet',
      tag: s.tag ?? 'Diğer',
      text: s.text,
      date: toDateKey(s.createdAt),
      user: shortReporterName(s.user.name),
    }));

    const tagGroups = await this.prisma.suggestion.groupBy({
      by: ['tag'],
      _count: { _all: true },
      where: { tag: { not: null } },
    });
    const feedbackTags: FeedbackTagPoint[] = tagGroups
      .map((g) => ({ tag: g.tag ?? 'Diğer', value: g._count._all }))
      .sort((a, b) => b.value - a.value);

    return { feedbackList, feedbackTags };
  }

  private async getSummary(): Promise<AdminSummary> {
    const today = todayKey();
    const todayDate = new Date(today);

    const [todayAppointments, slots, avgRating, openFaults] = await Promise.all([
      this.prisma.appointment.count({
        where: { slot: { date: todayDate }, status: { not: AppointmentStatus.CANCELLED } },
      }),
      this.prisma.slot.findMany({ where: { date: todayDate } }),
      this.prisma.rating.aggregate({ _avg: { score: true } }),
      this.prisma.faultReport.count({ where: { status: { not: FaultStatus.RESOLVED } } }),
    ]);

    let occupancy = 0;
    if (slots.length > 0) {
      const totalCapacity = slots.reduce((sum, s) => sum + s.capacity, 0);
      const booked = await this.prisma.appointment.count({
        where: { slotId: { in: slots.map((s) => s.id) }, status: { in: OCCUPYING_STATUSES } },
      });
      occupancy = totalCapacity ? Math.round((booked / totalCapacity) * 100) : 0;
    }

    return {
      todayAppointments,
      occupancy,
      avgRating: Math.round((avgRating._avg.score ?? 0) * 10) / 10,
      openFaults,
    };
  }

  private async getWeeklyOccupancyTrend(): Promise<OccupancyTrendPoint[]> {
    const today = todayKey();
    const points: OccupancyTrendPoint[] = [];
    for (let offset = -6; offset <= 0; offset++) {
      const dateKey = addDaysToKey(today, offset);
      const date = new Date(dateKey);
      const slots = await this.prisma.slot.findMany({ where: { date } });
      let occupancy = 0;
      if (slots.length > 0) {
        const totalCapacity = slots.reduce((sum, s) => sum + s.capacity, 0);
        const booked = await this.prisma.appointment.count({
          where: { slotId: { in: slots.map((s) => s.id) }, status: { in: OCCUPYING_STATUSES } },
        });
        occupancy = totalCapacity ? Math.round((booked / totalCapacity) * 100) : 0;
      }
      points.push({ day: turkishDayLabel(dateKey), occupancy });
    }
    return points;
  }

  private async getHourlyOccupancyToday(): Promise<{ label: string; occupancy: number }[]> {
    const today = new Date(todayKey());
    const slots = await this.prisma.slot.findMany({ where: { date: today }, orderBy: { startTime: 'asc' } });
    const counts = await this.prisma.appointment.groupBy({
      by: ['slotId'],
      where: { slotId: { in: slots.map((s) => s.id) }, status: { in: OCCUPYING_STATUSES } },
      _count: { _all: true },
    });
    const bookedMap = new Map(counts.map((c) => [c.slotId, c._count._all]));
    return slots.map((s) => ({
      label: s.startTime,
      occupancy: s.capacity ? Math.round(((bookedMap.get(s.id) ?? 0) / s.capacity) * 100) : 0,
    }));
  }

  private async getWeeklyOccupancyByWeek(): Promise<{ label: string; occupancy: number }[]> {
    const today = todayKey();
    const points: { label: string; occupancy: number }[] = [];
    for (let week = 3; week >= 0; week--) {
      const endOffset = -week * 7;
      const startOffset = endOffset - 6;
      let totalCapacity = 0;
      let totalBooked = 0;
      for (let offset = startOffset; offset <= endOffset; offset++) {
        const dateKey = addDaysToKey(today, offset);
        const date = new Date(dateKey);
        const slots = await this.prisma.slot.findMany({ where: { date } });
        totalCapacity += slots.reduce((sum, s) => sum + s.capacity, 0);
        if (slots.length) {
          totalBooked += await this.prisma.appointment.count({
            where: { slotId: { in: slots.map((s) => s.id) }, status: { in: OCCUPYING_STATUSES } },
          });
        }
      }
      points.push({
        label: `H${4 - week}`,
        occupancy: totalCapacity ? Math.round((totalBooked / totalCapacity) * 100) : 0,
      });
    }
    return points;
  }

  private async getTopMachines(limit: number): Promise<TopMachinePoint[]> {
    const uses = await this.prisma.appointmentMachine.groupBy({
      by: ['machineId'],
      _count: { _all: true },
      orderBy: { _count: { machineId: 'desc' } },
      take: limit,
    });
    if (!uses.length) return [];

    const machineIds = uses.map((u) => u.machineId);
    const [machines, ratings] = await Promise.all([
      this.prisma.machine.findMany({ where: { id: { in: machineIds } }, select: { id: true, name: true } }),
      this.prisma.rating.groupBy({
        by: ['machineId'],
        where: { machineId: { in: machineIds } },
        _avg: { score: true },
      }),
    ]);
    const nameMap = new Map(machines.map((m) => [m.id, m.name]));
    const ratingMap = new Map(ratings.map((r) => [r.machineId, r._avg.score ?? 0]));

    return uses.map((u) => ({
      name: nameMap.get(u.machineId) ?? u.machineId,
      rating: Math.round((ratingMap.get(u.machineId) ?? 0) * 10) / 10,
      uses: u._count._all,
    }));
  }

  private async getMachinePreference(since: Date): Promise<MachinePreferencePoint[]> {
    const rows = await this.prisma.appointmentMachine.groupBy({
      by: ['machineId'],
      _count: { _all: true },
      where: { appointment: { createdAt: { gte: since } } },
      orderBy: { _count: { machineId: 'desc' } },
      take: 12,
    });
    if (!rows.length) return [];
    const machines = await this.prisma.machine.findMany({
      where: { id: { in: rows.map((r) => r.machineId) } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(machines.map((m) => [m.id, m.name]));
    return rows.map((r) => ({ name: nameMap.get(r.machineId) ?? r.machineId, count: r._count._all }));
  }

  private async getMuscleGroupPopularity(since: Date): Promise<MuscleGroupPopularityPoint[]> {
    const rows = await this.prisma.appointmentMuscleGroup.groupBy({
      by: ['muscleGroupId'],
      _count: { _all: true },
      where: { appointment: { createdAt: { gte: since } } },
      orderBy: { _count: { muscleGroupId: 'desc' } },
    });
    if (!rows.length) return [];
    const groups = await this.prisma.muscleGroup.findMany({
      where: { id: { in: rows.map((r) => r.muscleGroupId) } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(groups.map((g) => [g.id, g.name]));
    return rows.map((r) => ({ group: nameMap.get(r.muscleGroupId) ?? r.muscleGroupId, value: r._count._all }));
  }

  private async getMostFaulty(limit: number): Promise<MostFaultyPoint[]> {
    const rows = await this.prisma.faultReport.groupBy({
      by: ['machineId'],
      _count: { _all: true },
      orderBy: { _count: { machineId: 'desc' } },
      take: limit,
    });
    if (!rows.length) return [];
    const machineIds = rows.map((r) => r.machineId);
    const [machines, ratings] = await Promise.all([
      this.prisma.machine.findMany({ where: { id: { in: machineIds } }, select: { id: true, name: true } }),
      this.prisma.rating.groupBy({
        by: ['machineId'],
        where: { machineId: { in: machineIds } },
        _avg: { score: true },
      }),
    ]);
    const nameMap = new Map(machines.map((m) => [m.id, m.name]));
    const ratingMap = new Map(ratings.map((r) => [r.machineId, r._avg.score ?? 0]));
    return rows.map((r) => ({
      name: nameMap.get(r.machineId) ?? r.machineId,
      faults: r._count._all,
      rating: Math.round((ratingMap.get(r.machineId) ?? 0) * 10) / 10,
    }));
  }

  private async getMostComplained(limit: number): Promise<MostComplainedPoint[]> {
    const rows = await this.prisma.rating.groupBy({
      by: ['machineId'],
      _count: { _all: true },
      where: { score: { lte: 3 } },
      orderBy: { _count: { machineId: 'desc' } },
      take: limit,
    });
    if (!rows.length) return [];
    const machines = await this.prisma.machine.findMany({
      where: { id: { in: rows.map((r) => r.machineId) } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(machines.map((m) => [m.id, m.name]));
    return rows.map((r) => ({
      name: nameMap.get(r.machineId) ?? r.machineId,
      complaints: r._count._all,
    }));
  }

  private async getMatrixData(): Promise<MatrixPoint[]> {
    const machines = await this.prisma.machine.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });
    if (!machines.length) return [];

    const machineIds = machines.map((m) => m.id);
    const [uses, ratings] = await Promise.all([
      this.prisma.appointmentMachine.groupBy({
        by: ['machineId'],
        where: { machineId: { in: machineIds } },
        _count: { _all: true },
      }),
      this.prisma.rating.groupBy({
        by: ['machineId'],
        where: { machineId: { in: machineIds } },
        _avg: { score: true },
      }),
    ]);
    const usesMap = new Map(uses.map((u) => [u.machineId, u._count._all]));
    const ratingMap = new Map(ratings.map((r) => [r.machineId, r._avg.score ?? 0]));

    return machines
      .map((m) => ({
        name: m.name,
        uses: usesMap.get(m.id) ?? 0,
        rating: Math.round((ratingMap.get(m.id) ?? 0) * 10) / 10,
      }))
      .filter((m) => m.uses > 0 || m.rating > 0);
  }

  private sinceDate(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
