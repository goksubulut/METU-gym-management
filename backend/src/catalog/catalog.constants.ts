/** Makine kategorileri — content/machines.json ve frontend filtre çipleriyle aynı. */
export const MACHINE_CATEGORIES = [
  'Kardiyo',
  'Serbest Ağırlık',
  'Kablolu',
  'Makine',
  'Fonksiyonel',
] as const;

export type MachineCategory = (typeof MACHINE_CATEGORIES)[number];
