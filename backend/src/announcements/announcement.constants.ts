/** Duyuru kategorileri — schema.prisma AnnouncementCategory ile uyumlu. */
export const ANNOUNCEMENT_CATEGORIES = ['GENERAL', 'PRICE', 'EVENT'] as const;

export type AnnouncementCategoryValue = (typeof ANNOUNCEMENT_CATEGORIES)[number];

export const ANNOUNCEMENT_CATEGORY_DEFAULT: AnnouncementCategoryValue = 'GENERAL';
