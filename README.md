# METU MOTION — ODTÜ Gym

> Kuyruktaki bekleyişi bitiren spor salonu rezervasyon ve yönlendirme sistemi.
> Dolu makine = anında alternatif. Ne çalışacağını bilmeyene kas haritası.
> Premium, sessiz, tek elle kullanılan; kurumsal portal estetiği yok.

ODTÜ öğrencisi salona gelmeden telefonundan slot ayırır. Uygulama, dolu bir
makineyle karşılaşan kişiyi boşa göndermek yerine **aynı kas grubunu çalıştıran
alternatifi** önerir; hangi makinenin neyi çalıştırdığını **interaktif kas
haritasıyla** öğretir. Başarı ölçütü tek cümle: öğrenci salona geldiğinde hiçbir
şey ona sürpriz gelmez.

İki temel hedef:

1. **Sıra beklemeyi engellemek** — dolu makine yerine alternatif makine/egzersiz önerisi.
2. **Body awareness** — kas haritası üzerinden makine ↔ kas ilişkisini görsel öğretmek.

Ürün, tasarım ve demo notları için: [`PRODUCT.md`](PRODUCT.md) ·
[`DESIGN.md`](DESIGN.md) · [`DEMO.md`](DEMO.md).

---

## Üç yüzey, üç kullanıcı

| Panel | Kim | Bağlam | Öne çıkanlar |
| :---- | :-- | :----- | :----------- |
| **Üye** (mobil-öncelikli) | ODTÜ öğrencisi | Koridorda, soyunma odasında, makine başında | Slot ayırma, kas haritası, alternatif öneri, QR ile giriş, antrenman programları, ısınma, geri bildirim/arıza bildirimi, bildirimler, puan rozeti |
| **Admin** (masaüstü) | Salon yönetimi | Ofis, geniş ekran | Doluluk & tercih raporları, makine envanteri, arıza takibi, kalite/tercih matrisi, duyuru yönetimi, geri bildirim panosu |
| **Resepsiyon** | Görevli | Girişteki tek ekran | QR okutma / check-in, günün randevu listesi, randevu detayı |

Aynı tarayıcıda üç panel farklı sekmelerde açık kalabilir: oturumlar
(`admin` / `reception` / `user`) ayrı `localStorage` anahtarlarında tutulur,
biri diğerinin üzerine yazmaz.

---

## Depo Yapısı

```
├── src/                  # Frontend (React 18 + Vite + Tailwind)
│   ├── pages/user/       # Mobil-öncelikli üye uygulaması (+ onboarding akışı)
│   ├── pages/admin/      # Yönetici paneli (masaüstü)
│   ├── pages/reception/  # Resepsiyon / check-in paneli
│   ├── components/       # Paylaşılan UI + tasarım sistemi (glassmorphism, motion)
│   ├── api/              # REST istemcisi (token yenileme, panel bazlı oturum)
│   └── mock/             # Backend kapalıyken devreye giren fallback veriler
│                         #   + paylaşılan sabitler (MUSCLE_GROUPS, CATEGORIES…)
├── backend/              # REST API (NestJS 11 + Prisma 6 + PostgreSQL 16)
│   ├── prisma/           # Şema, migration'lar, seed script
│   └── src/              # auth · slots · appointments · catalog · programs
│                         #   · feedback · admin · reception · notifications · qr
├── content/              # İçerik seti: 36 makine, 100 egzersiz, 8 kas grubu (JSON)
└── docker-compose.yml    # Tam yığın: PostgreSQL + API + Nginx
```

Frontend, backend'e ulaşamazsa ilgili ekranlar `src/mock/` verisine düşer;
böylece API olmadan da arayüz gezilebilir (bkz. [`DEMO.md`](DEMO.md)).

---

## Gereksinimler

- Node.js 20+
- Docker Desktop (PostgreSQL için)

## Kurulum

### Seçenek A — Tek komutla tam yığın (Docker; okul sunucusu / demo)

```bash
docker compose up -d --build
# Uygulama:  http://localhost:8080   (Nginx: SPA + /api + /media + /docs)
# İlk kurulumda içerik/demo verisi için (host'tan, bir kez):
cd backend && npm install && npx prisma db seed
```

Migration'lar API konteyneri açılırken otomatik uygulanır. Üretimde
`JWT_ACCESS_SECRET` ve `JWT_REFRESH_SECRET` değişkenlerini **mutlaka** rastgele
uzun değerlerle verin. Videolar `backend/media/videos/` altına konur; Nginx
bunları `/media` üzerinden range destekli sunar.

### Seçenek B — Geliştirme (frontend + backend ayrı)

**1. Backend**

```bash
cd backend
npm install
copy .env.example .env   # değerleri doldurun (aşağıya bakın)

npm run db:up            # PostgreSQL konteynerini başlatır (host portu 5433)
npm run db:migrate       # tablo şemasını uygular
npm run db:seed          # içerik + demo verileri yükler
npm run start:dev        # API: http://localhost:3000/api
```

`.env` notları:
- `DATABASE_URL` — Docker Postgres **5433** portunda yayınlanır (yerel bir
  PostgreSQL 5432 ile çakışmasın diye).
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — rastgele uzun değerler üretin.
- `SLOT_DURATION_MINUTES`, `SLOT_CAPACITY` — sabit slot modeli parametreleri.

Swagger (API dokümantasyonu): **http://localhost:3000/docs**

**2. Frontend**

```bash
npm install
npm run dev              # http://localhost:5173
```

API adresi varsayılan `/api`'dir; farklı bir backend'e bağlanmak için
`VITE_API_URL` ortam değişkenini verin.

---

## Demo Hesaplar (seed sonrası)

| Rol | E-posta | Parola |
| :-- | :------ | :----- |
| Admin | `admin@metugym.local` | `admin1234` |
| Resepsiyon | `reception@metugym.local` | `reception1234` |
| Üye (Göksu Bulut) | `goksu.bulut0@gmail.com` | `user1234` |

Seed ayrıca resepsiyon check-in listesini doldurmak için 9 demo üye daha
oluşturur (`*.demo.metugym.local`); hepsinin parolası `user1234`.

---

## API Kimlik Doğrulama

Tüm uçlar varsayılan olarak korumalıdır (JWT Bearer). Akış:

1. `POST /api/auth/register` veya `POST /api/auth/login` → `accessToken` (30 dk) + `refreshToken` (7 gün)
2. İsteklerde `Authorization: Bearer <accessToken>` başlığı
3. Access token dolunca `POST /api/auth/refresh` → yeni çift (rotasyonlu; eski refresh geçersizleşir)
4. `POST /api/auth/logout` → refresh token iptal edilir

Tüm cevaplar ortak zarf kullanır: `{ "success": true, "data": ..., "error": null }`

## Testler

```bash
cd backend
npm run test:e2e         # e2e testler (Postgres ayakta olmalı)
```

---

## Teknoloji Yığını

| Katman | Teknoloji |
| :----- | :-------- |
| Frontend | React 18, Vite, Tailwind CSS, react-router v6, Framer Motion |
| Grafik | Recharts + Reaviz (admin raporları, heatmap) |
| Diğer FE | lucide-react + özel ikon seti, jsQR (QR okuma), clsx / tailwind-merge |
| Backend | NestJS 11 (TypeScript), Prisma 6, class-validator, Swagger |
| Veritabanı | PostgreSQL 16 (Docker) |
| Kimlik | JWT (access + refresh, rotasyonlu), argon2 parola hash |
| Altyapı | Docker Compose (db + API + Nginx), GitHub Actions CI |

Tasarım dili **koyu-varsayılan, tek aksanlı (ODTÜ kırmızısı) Spatial
Glassmorphism**; Apple arayüz ilkeleri + Emil Kowalski motion disiplini +
anti-slop kuralları. Ayrıntı: [`DESIGN.md`](DESIGN.md).

## Özellikler (durum)

- [x] Backend iskeleti, veri modeli, seed, health ucu
- [x] Auth modülü (kayıt/giriş, JWT, rol guard'ları, parola sıfırlama)
- [x] Slot & randevu modülü (doluluk tahmini dahil)
- [x] Katalog: makine + kas grubu + egzersiz uçları
- [x] Alternatif öneri motoru (`GET /machines/:id/alternatives`)
- [x] Antrenman programları (oluşturma, düzenleme, sıralama)
- [x] Geri bildirim: puan, arıza, öneri/şikayet
- [x] Admin raporları + resepsiyon check-in uçları
- [x] Bildirimler ve randevu hatırlatmaları
- [x] QR üretimi (`GET /qr/door`, `GET /qr/machines/:id`) ve video sunumu (`/media`)
- [x] Frontend'in gerçek API'ye geçişi (tüm ekranlar; backend kapalıyken mock'a düşer)
- [x] Docker ile tam paket (`docker compose up -d --build`) ve GitHub Actions CI
