// Sabit 30 dakikalık slotlar. Serbest saat girişi yok.
function gen(times) {
  return times.map(([time, booked, capacity]) => ({ time, booked, capacity }));
}

export const slotsByDate = {
  today: gen([
    ["08:00", 8, 10],
    ["08:30", 10, 10],
    ["09:00", 6, 10],
    ["09:30", 4, 10],
    ["10:00", 9, 10],
    ["10:30", 3, 10],
    ["11:00", 2, 10],
    ["11:30", 7, 10],
    ["17:00", 10, 10],
    ["17:30", 9, 10],
    ["18:00", 8, 10],
    ["18:30", 5, 10],
    ["19:00", 3, 10],
    ["19:30", 1, 10],
    ["20:00", 2, 10],
    ["20:30", 0, 10],
  ]),
};

// Önümüzdeki 7 gün için tarih listesi.
export function upcomingDates(count = 7) {
  const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const out = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    out.push({
      key: d.toISOString().slice(0, 10),
      day: days[d.getDay()],
      date: d.getDate(),
      month: d.toLocaleDateString("tr-TR", { month: "short" }),
      isToday: i === 0,
    });
  }
  return out;
}

// Her tarih için slot üret (bugünkü şablonu tekrar kullanıp hafif rastgeleleştir).
export function getSlots(dateKey) {
  const base = slotsByDate.today;
  let seed = dateKey.split("-").reduce((a, c) => a + Number(c), 0);
  return base.map((s) => {
    seed = (seed * 9301 + 49297) % 233280;
    const jitter = Math.floor((seed / 233280) * 5) - 2;
    const booked = Math.max(0, Math.min(s.capacity, s.booked + jitter));
    return { ...s, booked };
  });
}
