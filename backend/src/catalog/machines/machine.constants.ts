/** Makine kategorileri — content/machines.json ve frontend CATEGORIES ile aynı. */
export const MACHINE_CATEGORIES = [
  'Kardiyo',
  'Serbest Ağırlık',
  'Kablolu',
  'Makine',
  'Fonksiyonel',
] as const;

export type MachineCategory = (typeof MACHINE_CATEGORIES)[number];

/** Kaba kas grubu id'leri — content/muscle-groups.json. */
export const MUSCLE_GROUP_IDS = [
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'core',
  'glutes',
  'cardio',
] as const;

/** İnce hedef kas slug'ları — BodyDiagram MUSCLES. */
export const TARGET_MUSCLE_SLUGS = [
  'chest',
  'trapezius',
  'upper-back',
  'lower-back',
  'deltoids',
  'biceps',
  'triceps',
  'forearm',
  'abs',
  'obliques',
  'gluteal',
  'quadriceps',
  'hamstring',
  'adductors',
  'abductors',
  'calves',
  'tibialis',
] as const;
