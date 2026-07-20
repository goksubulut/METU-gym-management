import { ExerciseType, ProgramItemType } from '@prisma/client';

export interface SortableProgramItem {
  itemType: ProgramItemType;
  machineId?: string | null;
  exerciseId?: string | null;
  exerciseType?: ExerciseType | null;
}

/** Isınma → makine/ana egzersiz → soğuma sıralaması. */
export function sortProgramItems<T extends SortableProgramItem>(items: T[]): T[] {
  const rank = (item: T): number => {
    if (item.itemType === ProgramItemType.MACHINE) return 1;
    const t = item.exerciseType;
    if (t === ExerciseType.WARMUP) return 0;
    if (t === ExerciseType.COOLDOWN) return 2;
    return 1;
  };

  return [...items].sort((a, b) => rank(a) - rank(b) || 0);
}
