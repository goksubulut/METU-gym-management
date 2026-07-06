// Admin paneli için analitik mock verisi.

export const summary = {
  todayAppointments: 142,
  occupancy: 78,
  avgRating: 4.5,
  openFaults: 4,
};

// Haftalık doluluk trendi
export const occupancyTrend = [
  { day: "Pzt", occupancy: 62 },
  { day: "Sal", occupancy: 71 },
  { day: "Çar", occupancy: 68 },
  { day: "Per", occupancy: 84 },
  { day: "Cum", occupancy: 91 },
  { day: "Cmt", occupancy: 76 },
  { day: "Paz", occupancy: 58 },
];

// Makine türü bazlı tercih (bar chart)
export const machinePreference = [
  { name: "Kıvrık Deadlift", count: 143 },
  { name: "Chest Press", count: 152 },
  { name: "Koşu Bandı", count: 210 },
  { name: "Pull Down", count: 96 },
  { name: "Leg Press", count: 128 },
  { name: "Functional Trainer", count: 188 },
];

// Kas grubu popülerlik
export const muscleGroupPopularity = [
  { group: "Bacak", value: 320 },
  { group: "Göğüs", value: 280 },
  { group: "Sırt", value: 245 },
  { group: "Kardiyo", value: 210 },
  { group: "Omuz", value: 150 },
  { group: "Kol", value: 190 },
  { group: "Karın", value: 130 },
  { group: "Kalça", value: 175 },
];

// En çok tercih edilen makineler (dashboard widget)
export const topMachines = [
  { name: "Koşu Bandı", rating: 4.2, uses: 210 },
  { name: "Functional Trainer", rating: 4.8, uses: 188 },
  { name: "Chest Press", rating: 4.7, uses: 152 },
  { name: "Kıvrık Deadlift", rating: 4.9, uses: 143 },
  { name: "Leg Press", rating: 4.6, uses: 128 },
];

// Kalite metrikleri — en çok arızalanan
export const mostFaulty = [
  { name: "Koşu Bandı", faults: 4, rating: 4.2 },
  { name: "Eliptik Bisiklet", faults: 3, rating: 4.3 },
  { name: "Leg Press", faults: 2, rating: 4.6 },
  { name: "Chest Press", faults: 1, rating: 4.7 },
];

// En çok şikayet alan
export const mostComplained = [
  { name: "Koşu Bandı", complaints: 6 },
  { name: "Eliptik Bisiklet", complaints: 3 },
  { name: "Kıvrık Deadlift", complaints: 2 },
  { name: "Abdominal Crunch", complaints: 1 },
];

// Tercih × Memnuniyet matrisi (scatter). x: kullanım, y: memnuniyet (puan)
// Kadranlar: Başarılı / Bakım Önceliği / Görünürlük Artır / Kaldırılabilir
export const matrixData = [
  { name: "Koşu Bandı", uses: 210, rating: 4.2 },
  { name: "Functional Trainer", uses: 188, rating: 4.8 },
  { name: "Chest Press", uses: 152, rating: 4.7 },
  { name: "Kıvrık Deadlift", uses: 143, rating: 4.9 },
  { name: "Leg Press", uses: 128, rating: 4.6 },
  { name: "Pull Down", uses: 96, rating: 4.4 },
  { name: "Hip Thrust", uses: 98, rating: 4.7 },
  { name: "Eliptik Bisiklet", uses: 89, rating: 4.3 },
  { name: "Horizontal Leg Curl", uses: 67, rating: 4.1 },
  { name: "Low Row", uses: 55, rating: 4.6 },
  { name: "Abdominal Crunch", uses: 41, rating: 4.0 },
  { name: "Pec Fly & Rear Delt", uses: 74, rating: 4.5 },
];

// Geri bildirim etiket dağılımı (pie)
export const feedbackTags = [
  { tag: "Ekipman", value: 12 },
  { tag: "Temizlik", value: 5 },
  { tag: "Uygulama", value: 8 },
  { tag: "Personel", value: 3 },
];

export const CHART_COLORS = ["#dc2626", "#f87171", "#fca5a5", "#991b1b", "#fecaca"];
