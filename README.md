# METU Gym Management System

Spor salonu randevu ve makine kullanım uygulaması. İki ana hedefi var:

1. **Sıra beklemeyi engellemek** — dolu makine yerine aynı kas grubunu çalıştıran
   alternatif makine/egzersiz önerisi.
2. **Body awareness** — interaktif kas haritası üzerinden hangi makinenin hangi
   kası çalıştırdığını görsel olarak öğretmek.

Detaylı gereksinimler için SRS dokümanına bakın (`SRS-ve-Mimari-v1.md`).

## Depo Yapısı

```
├── src/                  # Frontend (React 18 + Vite + Tailwind)
│   ├── pages/user/       # Mobil-öncelikli kullanıcı uygulaması
│   ├── pages/admin/      # Yönetici paneli (masaüstü)
│   ├── pages/reception/  # Resepsiyon / check-in paneli
│   └── mock/             # Geçici mock veriler (API'ye taşınıyor)
├── backend/              # REST API (NestJS + Prisma + PostgreSQL)
│   ├── prisma/           # Şema, migration'lar, seed script
│   └── src/              # Modüller: auth, health (bookings, catalog... yolda)
├── content/              # Kas grubu / makine / egzersiz içerik seti (JSON)
└── docker-compose.yml    # PostgreSQL (ileride API + Nginx)
```

## Gereksinimler

- Node.js 20+
- Docker Desktop (PostgreSQL için)

## Kurulum

### 1. Backend

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
- `DATABASE_URL` — Docker Postgres **5433** portunda yayınlanır (5432 değil;
  makinede yerel bir PostgreSQL varsa çakışmasın diye).
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — rastgele uzun değerler üretin.
- `SLOT_DURATION_MINUTES`, `SLOT_CAPACITY` — sabit slot modeli parametreleri.

Swagger (API dokümantasyonu): **http://localhost:3000/docs**

### 2. Frontend

```bash
npm install
npm run dev              # http://localhost:5173
```

## Demo Hesaplar (seed sonrası)

| Rol | E-posta | Parola |
| :-- | :------ | :----- |
| Admin | `admin@metugym.local` | `admin1234` |
| Resepsiyon | `reception@metugym.local` | `reception1234` |
| Üye | `gyeduernest@gmail.com` | `user1234` |

## API Kimlik Doğrulama

Tüm uçlar varsayılan olarak korumalıdır (JWT Bearer). Akış:

1. `POST /api/auth/register` veya `POST /api/auth/login` → `accessToken` (15 dk) + `refreshToken` (7 gün)
2. İsteklerde `Authorization: Bearer <accessToken>` başlığı
3. Access token dolunca `POST /api/auth/refresh` → yeni çift (rotasyonlu; eski refresh geçersizleşir)
4. `POST /api/auth/logout` → refresh token iptal edilir

Tüm cevaplar ortak zarf kullanır: `{ "success": true, "data": ..., "error": null }`

## Testler

```bash
cd backend
npm run test:e2e         # e2e testler (Postgres ayakta olmalı)
```

## Teknoloji Yığını

| Katman | Teknoloji |
| :----- | :-------- |
| Frontend | React 18, Vite, Tailwind CSS, react-router v6, Recharts |
| Backend | NestJS 11 (TypeScript), Prisma 6, class-validator, Swagger |
| Veritabanı | PostgreSQL 16 (Docker) |
| Kimlik | JWT (access + refresh, rotasyonlu), argon2 parola hash |

## Yol Haritası

- [x] Backend iskeleti, veri modeli, seed, health ucu
- [x] Auth modülü (kayıt/giriş, JWT, rol guard'ları)
- [x] Slot & randevu modülü (doluluk tahmini dahil)
- [ ] Katalog: makine + kas grubu + egzersiz uçları
- [ ] Alternatif öneri motoru
- [ ] Geri bildirim: puan, arıza, öneri/şikayet
- [ ] Admin raporları + resepsiyon check-in uçları
- [ ] QR üretimi ve video sunumu (Nginx)
- [ ] Frontend'in mock'tan gerçek API'ye geçirilmesi
- [ ] Docker ile tam paket (API + Nginx) ve CI
