// Arıza bildirimleri
export const faults = [
  { id: "f1", machineId: "m4", machine: "Koşu Bandı Pro", issue: "Ekran donuyor, hız değişmiyor", severity: "high", status: "open", date: "2026-07-01", reporter: "Ahmet Y." },
  { id: "f2", machineId: "m8", machine: "Rowing Machine", issue: "Zincir gürültü yapıyor", severity: "medium", status: "open", date: "2026-06-30", reporter: "Elif D." },
  { id: "f3", machineId: "m1", machine: "Leg Press 45°", issue: "Sağ pedal gevşek", severity: "medium", status: "in-progress", date: "2026-06-29", reporter: "Mehmet K." },
  { id: "f4", machineId: "m3", machine: "Chest Press", issue: "Minder yırtık", severity: "low", status: "resolved", date: "2026-06-25", reporter: "Zeynep Ş." },
  { id: "f5", machineId: "m4", machine: "Koşu Bandı Pro", issue: "Acil durdurma çalışmıyor", severity: "high", status: "open", date: "2026-07-02", reporter: "Can Ö." },
  { id: "f6", machineId: "m7", machine: "Squat Rack", issue: "Güvenlik kolu sıkışıyor", severity: "high", status: "in-progress", date: "2026-06-28", reporter: "Aylin A." },
  { id: "f7", machineId: "m11", machine: "Ab Crunch Machine", issue: "Ayar pimi kayıp", severity: "low", status: "resolved", date: "2026-06-22", reporter: "Burak D." },
];

// Öneri / şikayet geri bildirimleri
export const feedbackList = [
  { id: "s1", type: "Öneri", tag: "Ekipman", text: "Daha fazla dambıl seti olsa harika olur", date: "2026-07-01", user: "Selin A." },
  { id: "s2", type: "Şikayet", tag: "Temizlik", text: "Soyunma odaları akşam saatlerinde kalabalık", date: "2026-06-30", user: "Emre Ç." },
  { id: "s3", type: "Öneri", tag: "Uygulama", text: "Randevu hatırlatma bildirimi eklenebilir", date: "2026-06-29", user: "Ahmet Y." },
  { id: "s4", type: "Şikayet", tag: "Personel", text: "Resepsiyon yoğun saatlerde yavaş", date: "2026-06-28", user: "Zeynep Ş." },
  { id: "s5", type: "Öneri", tag: "Ekipman", text: "Fonksiyonel antrenman alanı genişletilmeli", date: "2026-06-27", user: "Can Ö." },
  { id: "s6", type: "Şikayet", tag: "Ekipman", text: "Koşu bantlarından biri sürekli arızalı", date: "2026-06-26", user: "Aylin A." },
  { id: "s7", type: "Öneri", tag: "Uygulama", text: "Kas grubu şemasına bacak detayı eklenmeli", date: "2026-06-25", user: "Burak D." },
];

// Isınma / soğuma hareketleri (kas grubuna göre)
export const warmups = {
  chest: [
    { name: "Kol Çevirme", duration: "2 dk", type: "Isınma" },
    { name: "Duvar Şınavı", duration: "1 dk", type: "Isınma" },
    { name: "Göğüs Esnetme (kapı)", duration: "30 sn x2", type: "Soğuma" },
  ],
  back: [
    { name: "Cat-Cow", duration: "2 dk", type: "Isınma" },
    { name: "Band Pull-Apart", duration: "1 dk", type: "Isınma" },
    { name: "Child's Pose", duration: "1 dk", type: "Soğuma" },
  ],
  legs: [
    { name: "Vücut Ağırlığı Squat", duration: "2 dk", type: "Isınma" },
    { name: "Bacak Sallama", duration: "1 dk", type: "Isınma" },
    { name: "Quad Esnetme", duration: "30 sn x2", type: "Soğuma" },
    { name: "Hamstring Esnetme", duration: "30 sn x2", type: "Soğuma" },
  ],
  shoulders: [
    { name: "Omuz Çevirme", duration: "1 dk", type: "Isınma" },
    { name: "Band Dislocate", duration: "1 dk", type: "Isınma" },
    { name: "Çapraz Kol Esnetme", duration: "30 sn x2", type: "Soğuma" },
  ],
  arms: [
    { name: "Bilek Çevirme", duration: "1 dk", type: "Isınma" },
    { name: "Triceps Esnetme", duration: "30 sn x2", type: "Soğuma" },
  ],
  core: [
    { name: "Plank Hazırlık", duration: "1 dk", type: "Isınma" },
    { name: "Cobra Esnetme", duration: "1 dk", type: "Soğuma" },
  ],
  glutes: [
    { name: "Glute Bridge", duration: "2 dk", type: "Isınma" },
    { name: "Pigeon Pose", duration: "1 dk", type: "Soğuma" },
  ],
  cardio: [
    { name: "Hafif Tempo Yürüyüş", duration: "5 dk", type: "Isınma" },
    { name: "Nefes Toparlama", duration: "3 dk", type: "Soğuma" },
  ],
};
