/**
 * METU Gym Management System seed script.
 *
 * İki tür veri yükler:
 * 1. İÇERİK (kalıcı): content/ klasöründeki kas grubu, makine ve egzersiz seti
 *    (SRS 8.7 — içerik proje içinde üretilir ve versiyonlanır).
 * 2. DEMO (geliştirme): kullanıcılar, slotlar, randevular, arızalar, puanlar,
 *    öneriler — frontend mock verileriyle birebir uyumlu.
 *
 * Çalıştırma: npx prisma db seed
 */
import { PrismaClient, AppointmentStatus, FaultSeverity, FaultStatus, SuggestionType, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const CONTENT_DIR = path.resolve(__dirname, '../../content');

const SLOT_CAPACITY = Number(process.env.SLOT_CAPACITY ?? 10);
const SLOT_DURATION_MINUTES = Number(process.env.SLOT_DURATION_MINUTES ?? 30);
const GYM_OPEN_HOUR = 8;
const GYM_CLOSE_HOUR = 22;

// ---------------------------------------------------------------------------
// Yardımcılar
// ---------------------------------------------------------------------------

function readContent<T>(file: string): T {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
  return JSON.parse(raw) as T;
}

/** Bugüne gün ekleyip 'YYYY-MM-DD' döndürür (yerel saat). */
function dateKey(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** "08:00" + 30 dk → "08:30" */
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Açılış-kapanış arası slot başlangıç saatleri. */
function slotTimes(): string[] {
  const times: string[] = [];
  let t = `${String(GYM_OPEN_HOUR).padStart(2, '0')}:00`;
  const close = `${String(GYM_CLOSE_HOUR).padStart(2, '0')}:00`;
  while (addMinutes(t, SLOT_DURATION_MINUTES) <= close) {
    times.push(t);
    t = addMinutes(t, SLOT_DURATION_MINUTES);
  }
  return times;
}

// ---------------------------------------------------------------------------
// 1. İçerik: kas grupları, makineler, egzersizler
// ---------------------------------------------------------------------------

interface MuscleGroupContent { id: string; name: string; svgRegionCode: string }
interface MachineContent {
  id: string; name: string; category: string; muscles: string[];
  location: string; hasVideo: boolean; description: string; tips: string;
}
interface ExerciseContent {
  name: string; type: 'MACHINE' | 'FREE' | 'WARMUP' | 'COOLDOWN';
  muscles: string[]; instructions?: string; duration?: string;
}

async function seedContent() {
  const muscleGroups = readContent<MuscleGroupContent[]>('muscle-groups.json');
  const machines = readContent<MachineContent[]>('machines.json');
  const exercises = readContent<ExerciseContent[]>('exercises.json');

  for (const mg of muscleGroups) {
    await prisma.muscleGroup.upsert({
      where: { id: mg.id },
      update: { name: mg.name, svgRegionCode: mg.svgRegionCode },
      create: mg,
    });
  }

  for (const m of machines) {
    await prisma.machine.upsert({
      where: { id: m.id },
      update: {
        name: m.name, category: m.category, location: m.location,
        description: m.description, tips: m.tips,
      },
      create: {
        id: m.id, name: m.name, category: m.category, location: m.location,
        qrCode: `/machine/${m.id}`, // frontend'deki QR deep-link rotası
        description: m.description, tips: m.tips,
        muscleGroups: { create: m.muscles.map((mid) => ({ muscleGroupId: mid })) },
        videos: m.hasVideo
          ? { create: [{ title: `${m.name} Kullanım Videosu`, url: `/media/videos/${m.id}.mp4` }] }
          : undefined,
      },
    });
  }

  // Egzersizlerin stabil bir kimliği yok; tekrar çalıştırmada çift kayıt olmasın
  // diye içerik egzersizleri silinip yeniden yüklenir.
  await prisma.exercise.deleteMany();
  for (const ex of exercises) {
    await prisma.exercise.create({
      data: {
        name: ex.name, type: ex.type,
        instructions: ex.instructions, duration: ex.duration,
        muscleGroups: { create: ex.muscles.map((mid) => ({ muscleGroupId: mid })) },
      },
    });
  }

  console.log(`İçerik: ${muscleGroups.length} kas grubu, ${machines.length} makine, ${exercises.length} egzersiz`);
}

// ---------------------------------------------------------------------------
// 2. Demo kullanıcılar
// ---------------------------------------------------------------------------

async function seedUsers() {
  const memberHash = await argon2.hash('user1234');

  const staff = [
    { name: 'Salon Yöneticisi', email: 'admin@metugym.local', role: Role.ADMIN, password: 'admin1234' },
    { name: 'Resepsiyon', email: 'reception@metugym.local', role: Role.RECEPTION, password: 'reception1234' },
  ];
  for (const s of staff) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { name: s.name, email: s.email, role: s.role, passwordHash: await argon2.hash(s.password) },
    });
  }

  // Frontend mock'larındaki üyeler (resepsiyon check-in listesi + aktif kullanıcı)
  const members = [
    { name: 'Gyedu Ernest', email: 'gyeduernest@gmail.com', phone: '054 861 2354' },
    { name: 'Ahmet Yılmaz', email: 'ahmet.yilmaz@demo.metugym.local', phone: '0532 111 22 33' },
    { name: 'Elif Demir', email: 'elif.demir@demo.metugym.local', phone: '0533 222 33 44' },
    { name: 'Mehmet Kaya', email: 'mehmet.kaya@demo.metugym.local', phone: '0534 333 44 55' },
    { name: 'Zeynep Şahin', email: 'zeynep.sahin@demo.metugym.local', phone: '0535 444 55 66' },
    { name: 'Can Öztürk', email: 'can.ozturk@demo.metugym.local', phone: '0536 555 66 77' },
    { name: 'Aylin Arslan', email: 'aylin.arslan@demo.metugym.local', phone: '0537 666 77 88' },
    { name: 'Burak Doğan', email: 'burak.dogan@demo.metugym.local', phone: '0538 777 88 99' },
    { name: 'Selin Aydın', email: 'selin.aydin@demo.metugym.local', phone: '0539 888 99 00' },
    { name: 'Emre Çelik', email: 'emre.celik@demo.metugym.local', phone: '0530 999 00 11' },
  ];
  for (const m of members) {
    await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: { ...m, role: Role.USER, passwordHash: memberHash },
    });
  }

  console.log(`Kullanıcılar: ${staff.length} personel, ${members.length} üye`);
}

// ---------------------------------------------------------------------------
// 3. Slotlar: bugünden 7 gün geri, 7 gün ileri
// ---------------------------------------------------------------------------

async function seedSlots() {
  const times = slotTimes();
  let count = 0;
  for (let offset = -7; offset <= 6; offset++) {
    const date = new Date(dateKey(offset));
    for (const start of times) {
      await prisma.slot.upsert({
        where: { date_startTime: { date, startTime: start } },
        update: {},
        create: {
          date,
          startTime: start,
          endTime: addMinutes(start, SLOT_DURATION_MINUTES),
          capacity: SLOT_CAPACITY,
        },
      });
      count++;
    }
  }
  console.log(`Slotlar: 14 gün x ${times.length} slot = ${count}`);
}

// ---------------------------------------------------------------------------
// 4. Demo randevular (mock/appointments.js karşılığı, bugüne göre kaydırılmış)
// ---------------------------------------------------------------------------

async function findUser(name: string) {
  const user = await prisma.user.findFirst({ where: { name } });
  if (!user) throw new Error(`Seed hatası: kullanıcı bulunamadı: ${name}`);
  return user;
}

async function findSlot(offsetDays: number, startTime: string) {
  const slot = await prisma.slot.findUnique({
    where: { date_startTime: { date: new Date(dateKey(offsetDays)), startTime } },
  });
  if (!slot) throw new Error(`Seed hatası: slot bulunamadı: ${dateKey(offsetDays)} ${startTime}`);
  return slot;
}

interface DemoAppointment {
  user: string; dayOffset: number; time: string; status: AppointmentStatus;
  muscleGroups: string[]; machines: string[]; note?: string;
}

async function seedAppointments() {
  // Tekrar çalıştırmada çift kayıt olmaması için demo randevular temizlenir.
  await prisma.appointment.deleteMany();

  const demo: DemoAppointment[] = [
    // Gyedu Ernest'in randevu geçmişi (mock a1-a5)
    { user: 'Gyedu Ernest', dayOffset: 0, time: '18:30', status: 'BOOKED', muscleGroups: ['chest', 'arms'], machines: ['m3', 'm6'], note: 'Üst vücut günü' },
    { user: 'Gyedu Ernest', dayOffset: 2, time: '10:00', status: 'BOOKED', muscleGroups: ['legs'], machines: ['m1', 'm7'] },
    { user: 'Gyedu Ernest', dayOffset: -5, time: '19:00', status: 'COMPLETED', muscleGroups: ['back'], machines: ['m2', 'm10'] },
    { user: 'Gyedu Ernest', dayOffset: -6, time: '08:30', status: 'COMPLETED', muscleGroups: ['cardio'], machines: ['m4'] },
    { user: 'Gyedu Ernest', dayOffset: -3, time: '17:30', status: 'CANCELLED', muscleGroups: ['core'], machines: ['m11'] },
    // Bugünün resepsiyon check-in listesi (mock todaysCheckins c1-c9)
    { user: 'Ahmet Yılmaz', dayOffset: 0, time: '08:00', status: 'CHECKED_IN', muscleGroups: ['chest'], machines: ['m3'] },
    { user: 'Elif Demir', dayOffset: 0, time: '08:30', status: 'CHECKED_IN', muscleGroups: ['legs'], machines: ['m1', 'm7'] },
    { user: 'Mehmet Kaya', dayOffset: 0, time: '09:00', status: 'BOOKED', muscleGroups: ['back'], machines: ['m2'] },
    { user: 'Zeynep Şahin', dayOffset: 0, time: '09:30', status: 'BOOKED', muscleGroups: ['cardio'], machines: ['m4'] },
    { user: 'Can Öztürk', dayOffset: 0, time: '10:00', status: 'NO_SHOW', muscleGroups: ['arms'], machines: ['m6'] },
    { user: 'Aylin Arslan', dayOffset: 0, time: '10:30', status: 'BOOKED', muscleGroups: ['glutes'], machines: ['m12'] },
    { user: 'Burak Doğan', dayOffset: 0, time: '11:00', status: 'BOOKED', muscleGroups: ['core'], machines: ['m11'] },
    { user: 'Selin Aydın', dayOffset: 0, time: '17:30', status: 'BOOKED', muscleGroups: ['shoulders'], machines: ['m5'] },
    { user: 'Emre Çelik', dayOffset: 0, time: '18:00', status: 'BOOKED', muscleGroups: ['chest', 'back'], machines: ['m3', 'm2'] },
  ];

  for (const a of demo) {
    const user = await findUser(a.user);
    const slot = await findSlot(a.dayOffset, a.time);
    await prisma.appointment.create({
      data: {
        userId: user.id,
        slotId: slot.id,
        status: a.status,
        note: a.note,
        muscleGroups: { create: a.muscleGroups.map((id) => ({ muscleGroupId: id })) },
        machines: { create: a.machines.map((id) => ({ machineId: id })) },
      },
    });
  }
  console.log(`Randevular: ${demo.length}`);
}

// ---------------------------------------------------------------------------
// 5. Geri bildirim: arızalar, öneri/şikayet, puanlar
// ---------------------------------------------------------------------------

async function seedFeedback() {
  await prisma.faultReport.deleteMany();
  await prisma.suggestion.deleteMany();
  await prisma.rating.deleteMany();

  // mock/feedback.js → faults (f1-f7)
  const faults: Array<{ user: string; machineId: string; description: string; severity: FaultSeverity; status: FaultStatus; dayOffset: number }> = [
    { user: 'Ahmet Yılmaz', machineId: 'm4', description: 'Ekran donuyor, hız değişmiyor', severity: 'HIGH', status: 'OPEN', dayOffset: -2 },
    { user: 'Elif Demir', machineId: 'm8', description: 'Zincir gürültü yapıyor', severity: 'MEDIUM', status: 'OPEN', dayOffset: -3 },
    { user: 'Mehmet Kaya', machineId: 'm1', description: 'Sağ pedal gevşek', severity: 'MEDIUM', status: 'IN_PROGRESS', dayOffset: -4 },
    { user: 'Zeynep Şahin', machineId: 'm3', description: 'Minder yırtık', severity: 'LOW', status: 'RESOLVED', dayOffset: -8 },
    { user: 'Can Öztürk', machineId: 'm4', description: 'Acil durdurma çalışmıyor', severity: 'HIGH', status: 'OPEN', dayOffset: -1 },
    { user: 'Aylin Arslan', machineId: 'm7', description: 'Güvenlik kolu sıkışıyor', severity: 'HIGH', status: 'IN_PROGRESS', dayOffset: -5 },
    { user: 'Burak Doğan', machineId: 'm11', description: 'Ayar pimi kayıp', severity: 'LOW', status: 'RESOLVED', dayOffset: -11 },
  ];
  for (const f of faults) {
    const user = await findUser(f.user);
    await prisma.faultReport.create({
      data: {
        userId: user.id, machineId: f.machineId, description: f.description,
        severity: f.severity, status: f.status,
        createdAt: new Date(dateKey(f.dayOffset)),
      },
    });
  }

  // mock/feedback.js → feedbackList (s1-s7)
  const suggestions: Array<{ user: string; type: SuggestionType; tag: string; text: string; dayOffset: number }> = [
    { user: 'Selin Aydın', type: 'SUGGESTION', tag: 'Ekipman', text: 'Daha fazla dambıl seti olsa harika olur', dayOffset: -2 },
    { user: 'Emre Çelik', type: 'COMPLAINT', tag: 'Temizlik', text: 'Soyunma odaları akşam saatlerinde kalabalık', dayOffset: -3 },
    { user: 'Ahmet Yılmaz', type: 'SUGGESTION', tag: 'Uygulama', text: 'Randevu hatırlatma bildirimi eklenebilir', dayOffset: -4 },
    { user: 'Zeynep Şahin', type: 'COMPLAINT', tag: 'Personel', text: 'Resepsiyon yoğun saatlerde yavaş', dayOffset: -5 },
    { user: 'Can Öztürk', type: 'SUGGESTION', tag: 'Ekipman', text: 'Fonksiyonel antrenman alanı genişletilmeli', dayOffset: -6 },
    { user: 'Aylin Arslan', type: 'COMPLAINT', tag: 'Ekipman', text: 'Koşu bantlarından biri sürekli arızalı', dayOffset: -7 },
    { user: 'Burak Doğan', type: 'SUGGESTION', tag: 'Uygulama', text: 'Kas grubu şemasına bacak detayı eklenmeli', dayOffset: -8 },
  ];
  for (const s of suggestions) {
    const user = await findUser(s.user);
    await prisma.suggestion.create({
      data: { userId: user.id, type: s.type, tag: s.tag, text: s.text, createdAt: new Date(dateKey(s.dayOffset)) },
    });
  }

  // Puanlar: mock'taki ortalama puana yaklaşan 4'er kayıt (makine başına).
  const mockAverages: Record<string, number> = {
    m1: 4.6, m2: 4.4, m3: 4.7, m4: 4.2, m5: 4.5, m6: 4.8,
    m7: 4.9, m8: 4.3, m9: 4.1, m10: 4.6, m11: 4.0, m12: 4.7,
  };
  const raters = ['Ahmet Yılmaz', 'Elif Demir', 'Mehmet Kaya', 'Zeynep Şahin'];
  const tagPool = ['Rahattı', 'Kalabalıktı', 'Arızalıydı', 'Ayarları bozuktu', 'Kullanımı zordu'];
  let ratingCount = 0;
  for (const [machineId, avg] of Object.entries(mockAverages)) {
    const scores = [Math.ceil(avg), Math.floor(avg), Math.round(avg), Math.round(avg)];
    for (let i = 0; i < scores.length; i++) {
      const user = await findUser(raters[i]);
      await prisma.rating.create({
        data: {
          userId: user.id, machineId, score: scores[i],
          // Düşük puanlara anlamlı etiket ekle (5 → etiketsiz "Rahattı" olabilir)
          tags: scores[i] >= 5 ? ['Rahattı'] : scores[i] <= 3 ? [tagPool[2]] : [],
        },
      });
      ratingCount++;
    }
  }

  console.log(`Geri bildirim: ${faults.length} arıza, ${suggestions.length} öneri/şikayet, ${ratingCount} puan`);
}

async function seedAnnouncements() {
  await prisma.announcement.deleteMany();
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Aylık üyelik fiyat güncellemesi',
        body: '1 Ağustos 2026 itibarıyla aylık üyelik ücreti 450 TL olacaktır. Mevcut üyeler için geçiş dönemi 31 Temmuz’a kadar geçerlidir.',
        category: 'PRICE',
        createdAt: new Date(dateKey(-5)),
      },
      {
        title: 'Yaz dönemi çalışma saatleri',
        body: 'Temmuz–Ağustos arasında salon hafta içi ve hafta sonu 07:00–23:00 saatleri arasında hizmet verecektir.',
        category: 'GENERAL',
        createdAt: new Date(dateKey(-2)),
      },
    ],
  });
  console.log('Duyurular: 2 kayıt');
}

// ---------------------------------------------------------------------------

async function main() {
  console.log('Seed başlıyor...');
  await seedContent();
  await seedUsers();
  await seedSlots();
  await seedAppointments();
  await seedFeedback();
  await seedAnnouncements();
  console.log('Seed tamamlandı.');
}

main()
  .catch((e) => {
    console.error('Seed başarısız:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
