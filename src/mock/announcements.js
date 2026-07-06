export const announcements = [
  {
    id: "a1",
    title: "Aylık üyelik fiyat güncellemesi",
    body: "1 Ağustos 2026 itibarıyla aylık üyelik ücreti 450 TL olacaktır. Mevcut üyeler için geçiş dönemi 31 Temmuz'a kadar geçerlidir.",
    category: "price",
    date: "2026-07-01",
    isActive: true,
  },
  {
    id: "a2",
    title: "Yaz dönemi çalışma saatleri",
    body: "Temmuz–Ağustos arasında salon hafta içi ve hafta sonu 07:00–23:00 saatleri arasında hizmet verecektir.",
    category: "general",
    date: "2026-07-04",
    isActive: true,
  },
];

export const CATEGORY_LABELS = {
  price: "Fiyat",
  general: "Duyuru",
  event: "Etkinlik",
};

export const CATEGORY_TONES = {
  price: "yellow",
  general: "primary",
  event: "blue",
};
