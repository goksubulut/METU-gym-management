/** FR-FB-2: puanlama sonrası opsiyonel etiketler (SRS + schema.prisma ile uyumlu). */
export const RATING_TAGS = [
  'Rahattı',
  'Kalabalıktı',
  'Arızalıydı',
  'Ayarları bozuktu',
  'Kullanımı zordu',
] as const;

export type RatingTag = (typeof RATING_TAGS)[number];

/** FR-FB-4: öneri/şikayet konu etiketleri (frontend ile aynı set). */
export const SUGGESTION_TAGS = [
  'Ekipman',
  'Temizlik',
  'Personel',
  'Uygulama',
  'Diğer',
] as const;

export type SuggestionTag = (typeof SUGGESTION_TAGS)[number];
