# METU Gym Management System — Spor Salonu Randevu & Makine Uygulaması

Referans gym uygulamasının tasarım dilini (kart yapıları, badge/buton stilleri, alt
navigasyon, boşluk ve tipografi) koruyan; ancak **kırmızı tema** ve tamamen farklı
içerik/akışla kurulmuş bir frontend. Backend yoktur — tüm veriler mock.

## Stack
- React 18 + Vite
- Tailwind CSS (kırmızı palet `tailwind.config.js > theme.colors.primary` içinde tek yerden)
- react-router-dom v6
- recharts (admin grafikleri)

## Çalıştırma
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # üretim derlemesi
```

## Üç arayüz / route grupları

### A. Kullanıcı (mobil-first, ~430px çerçeve)
`/` splash · `/qr-info` · `/auth` · `/home` · `/book` (3 adım: tarih+slot → kas grubu/makine → özet)
`/muscle-groups` (tıklanabilir vücut şeması) · `/machines` · `/machines/:id` · `/alternatives/:id`
`/warmup/:group` · `/feedback` (sekmeli: arıza/öneri/puanla) · `/appointments` (randevular + profil)

### B. Yönetici (masaüstü, `/admin/*`)
`login · dashboard · preferences · quality · matrix · faults · feedback · inventory`

### C. Resepsiyon / Check-in (masaüstü/tablet, `/reception/*`)
`login · check-in (ana) · appointment/:id (detay)`

## İş kuralları (varsayımlar)
- Randevu için login zorunlu; walk-in / misafir yok.
- Randevu saatleri sabit 30 dk slotlardan seçilir; slot doluluğu mock (`src/mock/slots.js`).
- Randevuda makine/kas grubu seçimi opsiyoneldir (atla butonu var).
- Makine listesi yalnızca **katalog**tur; gerçek zamanlı doluluk gösterilmez.
- "Alternatif göster" kullanıcının kendi eylemidir; sistem proaktif bildirim göndermez.

## Klasör yapısı
```
src/
├── components/   # design system: Button, Badge, Card, Modal, Toast, EmptyState,
│                 #   Input, StarRating, Tabs, StatCard, SlotButton, Spinner, Logo
├── layouts/      # UserLayout, AdminLayout, ReceptionLayout
├── mock/         # machines, slots, appointments, feedback, analytics, user
└── pages/        # user/ (12), admin/ (8), reception/ (3)
```

## Tema değiştirme
Kırmızı tonlarını değiştirmek için sadece `tailwind.config.js` içindeki `primary`
paletini düzenle; tüm ekranlar otomatik güncellenir.
