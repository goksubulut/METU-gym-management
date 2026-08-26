# Demo ve bilinen boşluklar

Sunum için **bilinçli** bırakılan yalan veriler ve henüz bağlanmayan UI.
Sunum bittikten sonra bu listedeki “kapat” notlarını uygula.

## Kasıtlı demo (şimdilik dokunma)

### Heatmap sahte geçmiş

- **Nerede:** `src/components/AppointmentHeatmap.jsx` — `generateDemoHistory()` / `withFallback`
- **Ne:** API’den 5’ten az randevu gelince sahte tamamlanmış günler karıştırılır; grafik dolu görünür.
- **Neden:** Sunumda boş heatmap kötü durur.
- **Puana karışmaz:** puan motoru yalnızca DB’deki `CHECKED_IN` / `COMPLETED` randevuları sayar.
- **Kapat:** `withFallback` satırını sil; yalnızca `mapped` kullan.

### Puan rozeti — boş hesapta 200

- **Nerede:** backend `computePoints`; `GET /auth/me` → `points` + `pointsIsDemo`; Dashboard rozeti
- **Ne:** `raw === 0` (hiç tamamlanmış/check-in randevu yok) iken gösterilen değer 200, `pointsIsDemo: true`.
- **Formül (gerçek kayıt varken):** `completedCount * 50 + streakWeeks * 25`
- **Kapat:** `pointsIsDemo` ve `raw === 0 → 200` fallback’ini kaldır; boş kullanıcıda 0 göster.

### Günlük görevler yok

- **Nerede:** spec `DESIGN.md` §3.5; Dashboard’da bölüm yok
- **Ne:** “Günlük Görevler” kartı / görev motoru yazılmadı.
- **Kapat:** görev modeli + Dashboard bölümü (sunum sonrası).

### Dashboard arama

- **Nerede:** `src/pages/user/Dashboard.jsx` arama çubuğu
- **Ne:** `/exercises` sayfasına gider; ayrı arama API’si yok.
- **Kapat:** katalog arama ucu veya sayfa-içi arama.

### Backend kapalıyken mock

- **Nerede:** birçok sayfa API hata verince `src/mock/` verisine düşer
- **Sunum:** API’yi açık tut (`npm run start:dev` + Postgres).
- **Kapat:** üretimde mock fallback’leri kaldır.

### Kullanılmayan UI kit

- `src/components/ui/machine-bucket.jsx`
- `src/components/ui/workout-builder.jsx`
- `src/components/ui/muscle-group-card.jsx`
- Hiçbir sayfa import etmiyor. Silinebilir veya bağlanabilir.

## Bu turda kapanan gerçek boşluklar

- Onboarding cinsiyet + doğum tarihi → `User.gender` / `User.birthDate`
- Profilde yaş / cinsiyet gösterimi
- Randevuda ince kas (`Appointment.targetMuscles`) + Book makine sıralaması
- Puan motoru (`raw > 0` iken gerçek hesap)

## Sunum sonrası

- BodyDiagram varsayılan silüet = profil cinsiyeti (`FEMALE` → kadın; toggle durur)
- `pointsIsDemo` kaldır
- Heatmap `withFallback` sil
- Günlük görevler
- Program oluşturmada seçilen ince kasları kaydet (şimdi yalnızca makine/egzersiz listesi gidiyor)
