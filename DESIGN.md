# Design

> ODTÜ Gym — tasarım sistemi. Apple'ın arayüz ilkelerinden (katmanlı derinlik, translucent malzeme, optik tipografi, anlık geri bildirim, kısıtlılık) beslenir; Emil Kowalski'nin motion mühendisliğiyle hareketi, anti-slop disipliniyle de "AI-generated" görüntüden uzaklığı garanti eder. Premium ama sessiz: hiçbir şey bağırmaz, her detay yerli yerindedir.

## Tasarım Yönü

**Sahne cümlesi.** ODTÜ öğrencisi, spor salonuna gelmeden önce yatakta ya da derste telefonunu açıyor; loş bir ortam, hızlı bir bakış, tek elle kullanım. Bu yüzden **varsayılan tema koyu** — göz yormaz, premium hisseder, kırmızı aksanı mürekkep gibi taşır. Açık tema, gündüz/aydınlık ortam için birebir eşdeğer kalitede bir alternatiftir, sonradan eklenmiş değil.

**Üç ilke, üç kaynak:**
- **Apple** (altın kural): Malzeme ve derinlik hiyerarşiyi taşır. Response anlıktır (basınca tepki). Hareket kesilebilir ve yerinden doğar. Tipografi boyuta göre nefes alır. Kısıtlılık lükstür.
- **Emil Kowalski**: Hareket dekor değil, işlevdir. Güçlü ease-out eğrileri, 300ms altı UI, `transform`/`opacity` disiplini, kesilebilir geçişler.
- **Anti-slop**: Tek aksan rengi (ODTÜ kırmızısı). Saf siyah yok, jenerik parlak kırmızı yok, kart-içinde-kart yok, her bölümün üstünde küçük tracked eyebrow yok.

**Kişilik:** Akıllı · Erişilebilir · Destekleyici. Bir koç gibi: durumu okur, yönlendirir, panikletmez.

---

## Tema Sistemi (Koyu varsayılan + Açık seçenek)

Tüm renkler **CSS custom property** olarak tanımlanır; tek gerçek kaynak budur. Tema `<html data-theme="dark|light">` ile değişir.

- **Varsayılan: `dark`.** İlk yüklemede kayıtlı tercih yoksa koyu tema açılır (sistem tercihi bakılmaz — ürün kararı budur).
- **Toggle:** Kullanıcı temayı değiştirir; tercih `localStorage["metu-gym-theme"]` içinde saklanır. Toggle bir köşe süsü (güneş/ay ikonu) değildir — header'daki profil/ayar alanına yerleşir, Apple tarzı bir switch veya segmented control ile.
- **Flash önleme:** `data-theme`, ilk boyamadan önce `<head>` içindeki minik inline script ile set edilir (koyu ↔ açık geçişte beyaz parlama olmaz).
- `color-scheme` her temada eşleşir (`dark` / `light`) — native form kontrolleri ve scrollbar doğru renklenir.
- Tema geçişinin kendisi 200ms `--ease-out` ile `background-color`/`color` crossfade; `prefers-reduced-motion` altında anlık.

Renkler **OKLCH** ile tanımlanır (hex karşılıkları referans içindir). OKLCH kaynak, hex türevdir.

---

## Renk

### Marka — ODTÜ Kırmızısı

Tek aksan. Pantone 187 ailesinden derin, olgun bir kırmızı. Parlak "AI kırmızısı" (#dc2626) terk edildi.

| Token | OKLCH | Hex | Kullanım |
|---|---|---|---|
| red-50  | 0.96 0.015 20 | #FBEAEC | Açık tema soft badge zemini |
| red-100 | 0.91 0.035 20 | #F6D3D8 | Soft kart çerçevesi (açık tema) |
| red-200 | 0.83 0.075 21 | #ECAAB3 | Selection, ince vurgu |
| red-300 | 0.72 0.115 22 | #DF7C8B | **Koyu tema link/metin aksanı** (kontrast için) |
| red-400 | 0.63 0.15 23 | #CE4E63 | Dekoratif ara ton, hover (koyu) |
| red-500 | 0.55 0.175 24 | #B92D45 | Gradient/hover uç |
| **red-600** | **0.47 0.175 25** | **#A6192E** | **Ana marka — CTA dolgu, aktif durum (ODTÜ kırmızısı)** |
| red-700 | 0.41 0.155 25 | #8C1526 | Basılı CTA, koyu vurgu |
| red-800 | 0.35 0.13 25 | #71101F | En koyu vurgu |
| red-900 | 0.28 0.10 25 | #560C17 | Nadiren, derin zemin vurgusu |

**Adaptif aksan (kritik erişilebilirlik kuralı):**
- **Dolgu (buton) üzerinde:** `red-600` zemin + beyaz metin (kontrast ≥ 5:1 ✓).
- **Metin/link olarak koyu temada:** `red-600` koyu zeminde okunmaz. `--accent-text` koyu temada **red-300 (#DF7C8B)** olur (kontrast ≥ 4.5:1 ✓).
- **Metin/link olarak açık temada:** `--accent-text` = **red-700 (#8C1526)** (beyaz üstünde ≥ 7:1 ✓).
- Apple mantığı: aynı semantik renk, temaya göre parlaklığını ayarlar.

### Nötr yüzey merdiveni (Apple katmanlı derinlik)

Derinlik gölgeyle değil, **yüzey açıklığıyla** kurulur. Her katman bir üsttekinden bir tık açıktır; üst kenarında ışık yakalayan ince bir hairline vardır. Nötrler saf gri değil — markaya kravat atacak kadar (chroma ~0.005) sıcağa/kırmızıya kaçar; monokültür sıcak-gri değil.

**Koyu tema** (`data-theme="dark"`):

| Token | OKLCH | Hex | Kullanım |
|---|---|---|---|
| `--bg`         | 0.17 0.006 25 | #131013 | Uygulama zemini (near-black, saf siyah DEĞİL) |
| `--surface`    | 0.22 0.006 25 | #1C181B | Kart, panel (1. kat elevasyon) |
| `--surface-2`  | 0.26 0.007 25 | #262124 | Popover, dropdown, yükseltilmiş kart |
| `--surface-3`  | 0.30 0.008 25 | #302A2E | Hover / basılı yüzey |
| `--hairline`   | rgba(255,255,255,0.09) | — | Kart üst kenarı, ayraç (ışık yakalar) |
| `--border`     | rgba(255,255,255,0.12) | — | Belirgin çerçeve, input |
| `--ink`        | 0.96 0.004 40 | #F5F2F3 | Ana metin (near-white, saf beyaz değil) |
| `--muted`      | 0.74 0.005 30 | #ABA4A8 | İkincil metin, etiket |
| `--faint`      | 0.56 0.005 30 | #7B747A | Üçüncül, yalnızca kritik-olmayan |

**Açık tema** (`data-theme="light"`):

| Token | OKLCH | Hex | Kullanım |
|---|---|---|---|
| `--bg`         | 0.96 0.004 40 | #F2F1F2 | Uygulama zemini (krem/cream DEĞİL, nötr) |
| `--surface`    | 1.00 0 0 | #FFFFFF | Kart, panel |
| `--surface-2`  | 0.98 0.004 40 | #FAF8F9 | Yükseltilmiş yüzey |
| `--surface-3`  | 0.95 0.005 30 | #EEECEC | Hover / basılı |
| `--hairline`   | rgba(16,12,14,0.08) | — | Ayraç, kart kenarı |
| `--border`     | rgba(16,12,14,0.12) | — | Belirgin çerçeve, input |
| `--ink`        | 0.20 0.006 30 | #1A181A | Ana metin (near-black) |
| `--muted`      | 0.44 0.006 30 | #565157 | İkincil metin |
| `--faint`      | 0.60 0.005 30 | #8A858A | Üçüncül |

### Semantik durum renkleri (doluluk — UX kritik)

Marka kırmızısı **kimlik/CTA** demektir; "dolu makine" demek değil. İkisini karıştırmamak için doluluk kendi semantik ölçeğini kullanır. Yeşil = boş, kehribar = doluyor, nötr-gri = dolu. Kırmızı yalnızca gerçek hata/yıkıcı eylemde ("rezervasyonu iptal et").

| Durum | Token | OKLCH (koyu / açık) | Kullanım |
|---|---|---|---|
| Boş / uygun | `--available` | 0.72 0.14 155 / 0.52 0.13 155 | Yeşil chip — makine/slot boş |
| Doluyor | `--busy` | 0.78 0.13 75 / 0.62 0.13 70 | Kehribar chip — kısmen dolu |
| Dolu | `--full` | `--faint` tonu + "dolu" etiketi | Gri/soluk, dikkat çekmez |
| Hata / yıkıcı | `--danger` | red-300 / red-700 | Yalnızca iptal, silme, hata |
| Bilgi | `--info` | 0.72 0.10 240 / 0.52 0.11 245 | Nadiren, nötr bilgilendirme |

Kontrast notu: renkli chip'lerde metin, chip zemininin **kendi tonunun koyu/açık ucundan** alınır (yeşil zemine gri metin değil). Gövde metni her zaman `--ink`; ipuçları `--muted` ≥ 4.5:1.

---

## Tipografi

Apple yaklaşımı: hiyerarşi **boyut + ağırlık + optik ayar** ile kurulur, süslemeyle değil. **İki aile** — Apple'ın SF Pro + SF Mono modeli gibi.

### Aileler

Tek grotesk aile + tek mono. Profesyonel gerekçe: tek font sağlayıcısı (Google Fonts), daha küçük yük (mobil ana bağlam), üçüncü-taraf CDN riski yok; Impeccable'ın "tek aileyi çok ağırlıkta kullan" kuralına uyar. Karakter, ikinci bir display fontundan değil — ağırlık/boyut/tracking kontrastından ve veri için mono'dan gelir. (İki grotesk'i yan yana koymak zaten "benzer fontları eşleştirme" kuralını çiğnerdi.)

- **Geist** (400, 500, 600, 700) — tüm UI, gövde **ve** başlıklar. SF Pro'ya yakın nötr grotesk; Inter kadar aşınmamış, premium ve okunur. Hiyerarşi ağırlık + boyut + optik tracking ile kurulur; büyük başlık sıkı tracking + ağır weight ile "display" gibi davranır.
- **Geist Mono** (500, 600; tabular) — sayısal/veri: slot saatleri, doluluk %, sayaç, kalan süre, hero istatistik sayıları. `font-variant-numeric: tabular-nums` — rakamlar değişirken layout kaymaz. Premium bir "ölçüm aleti" hissi verir; spor uygulaması için tam isabet.

Yükleme: her ikisi de Google Fonts (tek origin, güvenilir, yaygın cache). Fallback: `Geist, -apple-system, "SF Pro Text", system-ui, sans-serif`; mono için `"Geist Mono", ui-monospace, "SF Mono", monospace`. Fontshare/Clash bağımlılığı yok.

### Ölçek

Mobil-öncelikli; `clamp()` ile akışkan. Hero tavanı ≤ 4rem (bağırmaz).

| Rol | Boyut | Aile / Ağırlık | Tracking | Leading |
|---|---|---|---|---|
| Hero sayı | `clamp(2.5rem, 8vw, 4rem)` | Geist Mono 600 | -0.02em | 1.0 |
| Sayfa başlığı (h1) | `clamp(1.5rem, 5vw, 2rem)` | Geist 700 | -0.025em | 1.05 |
| Bölüm başlığı (h2) | `1.25rem` | Geist 700 | -0.02em | 1.1 |
| Kart başlığı (h3) | `0.9375rem` (15px) | Geist 600 | -0.01em | 1.2 |
| Gövde | `0.9375rem` (15px) | Geist 400/500 | 0 | 1.5 |
| İkincil / alt metin | `0.8125rem` (13px) | Geist 500 | 0 | 1.45 |
| Etiket / mikro | `0.6875rem` (11px) | Geist 600 | +0.02em | 1.3 |
| Veri / sayı | boyuta göre | Geist Mono 500/600 | 0 | eşleşir |

### Kurallar (Apple optik disiplini)

- **Tracking boyuta özeldir:** büyük display negatif (`-0.02em`…`-0.03em`), gövde 0, mikro/uppercase etiket hafif pozitif (`+0.02em`). Tek sabit `letter-spacing` yanlıştır. Zemin: display'de `-0.04em`'den sıkı olma (harfler değmesin).
- **Leading boyutla ters:** büyük başlıkta sıkı (1.0–1.1), gövdede rahat (1.5).
- **Satır uzunluğu 65–75ch** ile sınırlı (uzun metin).
- `text-wrap: balance` → h1–h3; `text-wrap: pretty` → uzun paragraf. Yetim kelime yok.
- **Cümle düzeni (sentence case)**, her başlıkta Title Case değil. Uppercase yalnızca küçük etikette, ölçülü.
- Uppercase tracked eyebrow'u **her bölümün üstüne koyma** (anti-slop). En fazla bir yerde, bilinçli.

---

## Boşluk & Düzen

- **Ölçek (8pt tabanlı):** 4, 8, 12, 16, 20, 24, 32, 40, 56, 72 px. Ritim için değişkenlik: üst/alt boşluk optik ayarlanır (alt genelde bir tık fazla).
- **Sayfa padding:** mobil `16px` yanlar; içerik blokları arası `20–24px`.
- **Kart içi:** `16–20px`; kart arası gap `12px`.
- **Container:** geniş ekranda içerik `max-width` ile sınırlanır (kullanıcı app ~480px tek kolon; admin ~1280px). Kenardan kenara yayılmaz.
- **Grid:** 2B için CSS Grid, 1B için flex. Breakpoint'siz responsive: `repeat(auto-fit, minmax(160px, 1fr))`.
- **Tam ekran:** `min-height: 100dvh` (iOS Safari viewport zıplamasını önler), `100vh` değil.
- **Safe area:** bottom nav ve sheet'ler `env(safe-area-inset-bottom)` ile iPhone çentik/home bar'a saygı duyar.
- **Simetriyi kır:** her şey ortalanmış üç eşit kart değil. Sol hizalı başlık + içerik, asimetrik ağırlık, bilinçli negatif alan.
- Kartlar tembel cevaptır: yalnızca elevasyon hiyerarşi taşıdığında kullan. **Kart içinde kart asla.**

---

## Köşe Yarıçapı (Radius)

Apple'ın yumuşak, sürekli köşeleri. Büyük yüzey → büyük yarıçap; iç eleman dıştan sıkı (nested radius).

| Token | Değer | Kullanım |
|---|---|---|
| `--r-xs` | 8px | Input, küçük chip, iç eleman |
| `--r-sm` | 12px | Buton (form), küçük kart |
| `--r-md` | 16px | Kart (varsayılan) |
| `--r-lg` | 20px | Panel, büyük kart |
| `--r-xl` | 28px | Bottom sheet, hero yüzey |
| `--r-full` | 9999px | Pill buton, badge, avatar (squircle tercih), segmented control |

---

## Elevasyon & Gölge

Gölge tek ışık kaynağı varsayar (yukarıdan), siyah değil **tonlu**dur. Koyu temada elevasyon çoğunlukla yüzey açıklığı + üst hairline ile; gölge derin ve yumuşak, düşük opaklık.

**Koyu tema:**
| Token | Değer |
|---|---|
| `--shadow-card` | `0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.35)` + üstte `inset 0 1px 0 var(--hairline)` |
| `--shadow-pop` | `0 4px 12px rgba(0,0,0,0.45), 0 24px 48px rgba(0,0,0,0.5)` |
| `--shadow-cta` | `0 4px 16px rgba(166,25,46,0.35)` — kırmızı butona **ölçülü** hâle (parlak glow değil) |

**Açık tema:**
| Token | Değer |
|---|---|
| `--shadow-card` | `0 1px 2px rgba(16,12,14,0.05), 0 4px 16px rgba(16,12,14,0.07)` |
| `--shadow-pop` | `0 4px 12px rgba(16,12,14,0.09), 0 16px 40px rgba(16,12,14,0.14)` |
| `--shadow-cta` | `0 6px 20px rgba(166,25,46,0.22)` |

Yarıçap gibi gölge de bağlama göre: büyük yüzey daha derin, küçük chip neredeyse gölgesiz.

---

## Malzeme & Derinlik (Apple translucency)

Translucency **navigasyon ve overlay kromu için** kullanılır — dekoratif glassmorphism değil (o yasak). Ayrım nettir: cam yalnızca "üstte yüzen işlevsel katman"dır.

- **Bottom nav & üst bar:** `backdrop-filter: blur(20px) saturate(180%)` + yarı saydam `--surface` (koyu: `rgba(28,24,27,0.72)`; açık: `rgba(255,255,255,0.72)`). İçerik altından kayar. Üstte ışık yakalayan hairline.
- **Scroll kenar efekti:** yüzen krom ile içerik buluştuğunda 1px sert çizgi yerine küçük blur/gradient maske — Apple large-title davranışı. Yalnızca örtüşme olan yerde.
- **Modal/sheet backdrop:** karartma scrim (`rgba(0,0,0,0.5)`) + hafif blur; arka plan geri iter.
- **Vibrancy:** translucent yüzey üstündeki metin düz gri değil — daha yüksek kontrast + hafif ağırlık artışı. Renk katmanı solid tarafta, saydam ön planda değil.
- **`prefers-reduced-transparency: reduce`** → cam yüzeyler opak/donuk olur (blur kalkar, zemin opaklığı artar).

Doku: saf düzlük yerine çok ince bir grain overlay (fixed, `pointer-events:none`, ~%2 opaklık) dijital sterilliği kırabilir — isteğe bağlı, ölçülü.

---

## Motion (Emil Kowalski + Apple)

Hareket işlevdir: durum değişimini, mekânsal ilişkiyi, geri bildirimi taşır. Üniversite spor uygulaması — yoğun efekt yok; ama tamamen durağan da değil. Her hareketin bir amacı olmalı.

### Easing token'ları (güçlü eğriler — built-in zayıf easing yasak)

```css
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);      /* expo-out — giriş/çıkış, çoğu UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* ekran içi taşıma/morph */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS sheet/drawer eğrisi */
```

`ease-in` UI'da **yasak** (izlenilen anı geciktirir). Bounce/elastic yok. Sabit-hız yalnızca spinner/progress.

### Süreler (UI < 300ms)

| Eleman | Süre |
|---|---|
| Buton/press feedback | 120–160ms |
| Chip, segmented thumb, toggle | 160–200ms |
| Dropdown, popover, tooltip | 180–220ms |
| Bottom sheet, modal | 300–360ms (`--ease-drawer`) |
| İçerik yükseliş (rise) | 400–450ms |

### Spring (jest/canlı hareket için)

Bottom sheet sürükleme, segmented thumb, toggle:
```js
{ type: "spring", bounce: 0, duration: 0.4 }      // varsayılan, overshoot yok (Apple critically damped)
{ type: "spring", bounce: 0.15, duration: 0.4 }   // yalnızca momentumlu jest (flick sonrası)
```
Overshoot yalnızca kullanıcı momentum kattığında (flick, drag-release). Menü açılışında bounce yanlış.

### Kalıplar

- **Press feedback:** basılabilir her eleman `:active`'te `transform: scale(0.97)`, 120ms `--ease-out`. Response anlık (Apple: tepki basınca, bırakınca değil).
- **Origin-aware:** popover/dropdown/menü tetikleyicisinden doğar (`transform-origin` tetikleyicide). **Modal ortada kalır** (istisna).
- **`scale(0)` asla** — giriş `scale(0.96)` + `opacity: 0`'dan. Hiçbir şey yoktan belirmez.
- **Kesilebilirlik:** hızlı tetiklenen/jest hareketi (sheet, toggle, toast) keyframe değil **transition/spring** — mevcut değerden yeniden hedefler.
- **Asimetrik:** kararlı eylem yavaş (hold-to-confirm 1.5–2s), sistem yanıtı snappy (bırakış 200ms). Giriş/çıkış aynı yoldan (mekânsal tutarlılık).
- **Stagger:** liste/grid girişinde 40–60ms gecikme; yalnızca ara sıra görülen yüzeylerde, etkileşimi bloklamaz.
- **`transform` / `opacity` (+ gerekince `clip-path`, `filter: blur`, `backdrop-filter`).** Layout property (`width`/`height`/`top`/`margin`) animasyonu yok.
- **Reveal görünür varsayılanı zenginleştirir** — içeriği class-tetikli geçişe kilitleme (hidden tab / headless render'da tetiklenmez, bölüm boş çıkar).

### Reduced motion (zorunlu)

`@media (prefers-reduced-motion: reduce)`: hareket = daha az ve nazik, sıfır değil. Konum/transform hareketi kalkar; opacity/renk crossfade kalır. Sheet slide → opacity fade. Spring → anlık.

---

## Bileşenler

### Button
Kırmızı dolgu ölçülü — dev glow yok. Varyantlar:
- **primary:** `--red-600` dolgu + beyaz metin + `--shadow-cta`. Ana CTA. Pill (`--r-full`) veya `--r-sm`.
- **secondary:** `--surface-2` zemin, `--ink` metin, `--border` hairline. Nötr eylem.
- **ghost:** şeffaf, `--muted` metin, hover `--surface-3`.
- **quiet/text:** link tarzı, `--accent-text` (adaptif kırmızı).
- **danger:** `--danger` — yalnızca yıkıcı (iptal/sil). Dolgu değil, kırmızı metin/outline (primary ile karışmasın).

Boyut: sm (h-36px), md (h-44px ✓ dokunma hedefi), lg (h-52px). `:active` scale-0.97, transition 150ms. Focus: 2px `--accent-text` ring + 2px offset. Disabled: opacity-0.5, `cursor-not-allowed`.

### Card
- **default:** `--surface`, `--hairline` üst kenar, `--shadow-card`, `--r-md`.
- **interactive:** hover `translateY(-2px)` + `--shadow-pop` + kenar parlar; `:active` geri döner. 180ms `--ease-out`.
- **soft/uyarı:** kırmızı-nötr ton (koyu: red-900 %8 zemin; açık: red-50) + red-100/hairline.
- Kart-içinde-kart yok. Border+shadow+zemin üçlüsünü aynı anda yükleme; biri yeter.

### Segmented Control (Apple imzası)
Tab/filtre için: pill track (`--surface-2`), kayan aktif thumb (`--surface` + shadow), spring geçiş. Mevcut düz "tabs"ın yerini alır — doluluk filtresi, tarih seçimi, admin sekmeleri.

### List Row (Apple gruplu liste)
Rezervasyon listesi, makine listesi, ayarlar için ideal (Operate register). Yuvarlatılmış container, içerik: sol ikon/başlık, sağ değer + chevron, inset hairline ayraç. `:active` satır highlight (`--surface-3`). Dokunma hedefi ≥ 44px.

### Bottom Navigation (mobil ana yönlendirme)
Translucent + blur (yukarı bkz). 4–5 öğe, ikon + etiket. Aktif öğe `--accent-text` + dolu ikon; pasif `--muted` + çizgi ikon. Safe-area padding. Aktif geçiş 200ms.

### Input / Field
Apple form stili: hafif dolu yüzey (`--surface-2`), `--border` hairline, `--r-xs`, min 44px. Focus: `--accent-text` ring (2px). Placeholder `--muted` (≥ 4.5:1, açık gri değil). Hata: `--danger` kenar + inline mesaj (`alert()` asla).

### Toggle / Switch
Apple switch. Tema değiştirici bunun bir örneği ama köşe süsü değil — ayar/profil içinde. Açık: `--red-600` track. Spring thumb.

### Badge / Chip
Küçük pill etiket, tone sistemi: `available` (yeşil), `busy` (kehribar), `full` (soluk/gri), `brand` (red-50/red-900 zemin). Kas grubu etiketleri nötr tonda.

### Modal / Sheet
- **Mobil:** bottom sheet — drag-to-dismiss (spring + velocity: `hız > 0.11` → kapat), `--r-xl` üst köşeler, `--ease-drawer`. Sürüklerken üstte grab handle.
- **Masaüstü:** ortalanmış modal (`transform-origin: center`), `scale(0.96)`+opacity giriş, backdrop blur+dim.

---

## İkonografi

Mevcut özel `<Icon>` seti korunur — Lucide/Feather "AI varsayılanı" görüntüsünden kaçınır. Standart: **1.5px stroke**, yuvarlak linecap/linejoin (Apple/SF Symbols hissi). Boyut prop ile px. Dolu/çizgi çift varyant (aktif nav dolu). Tek stroke ağırlığı — tüm ikonlar aynı. Klişe metafor yok (roket=launch değil).

---

## Durumlar (States)

- **Empty:** boş liste = kayıp fırsat değil, kompoze "başla" görünümü (ikon + tek cümle + tek CTA). Örn. "Henüz rezervasyonun yok — bir slot ayır."
- **Loading:** spinner değil, layout şeklini taşıyan **skeleton** (kart/satır iskeleti, shimmer ölçülü).
- **Error:** inline, net, sakin: "Bağlantı kurulamadı. Tekrar dene." Ünlem yok, "Oops" yok, aktif dil.
- **Focus:** her interaktif elemanda görünür ring (klavye erişilebilirliği — opsiyonel değil).
- **Full/dolu makine:** soluk + "dolu" etiketi + **anında alternatif** yolu (ürün ilkesi: engel değil köprü).

---

## Yüzeyler

| Yüzey | Zemin | Yönlendirme | Register | Not |
|---|---|---|---|---|
| Kullanıcı app | `--bg` (koyu vars.) | Bottom nav, translucent | Operate | Birincil, mobil-öncelikli, tek kolon ~480px |
| Hero / özet kart | `--surface` + ince radial sheen | — | — | Doku pseudo-element, layout'u etkilemez |
| Admin panel | `--bg` | Üst bar + segmented, masaüstü | Operate | Tablo-yoğun, ~1280px, daraltılmaz; tabular-nums |
| Resepsiyon | `--bg` | Tek ekran, büyük dokunma hedefleri | Operate | Check-in odaklı, sade, uzaktan okunur tipografi |

Tüm yüzeyler aynı token sistemini paylaşır; tema (koyu/açık) global.

---

## Anti-slop Muhafızları (bilinçli kaçındıklarımız)

- Saf `#000` / saf `#fff` yok — near-black/near-white.
- Parlak jenerik kırmızı (#dc2626) yok — derin ODTÜ kırmızısı.
- Krem/cream/sand zemin yok (2026 AI varsayılanı).
- İkiden fazla aksan yok — tek kırmızı.
- Gradient metin yok, side-stripe (kalın sol kenar) border yok, dekoratif glassmorphism yok.
- Her bölümde küçük tracked uppercase eyebrow yok, "01/02/03" numaralı bölüm scaffold'u yok.
- Üç eşit ikon-başlık-metin kartı sırası yok.
- Inter-her-yerde yok — Geist + karakterli display.
- Metin container taşması yok (her breakpoint'te başlık test edilir).
- Layout property animasyonu, `alert()`, `console.log`, dead link (`href="#"`) yok.

**Slop testi:** biri bu arayüze bakıp tereddütsüz "AI yapmış" diyebiliyorsa başarısız. Kategori-refleks kontrolü: paleti/temayı yalnızca "spor uygulaması" kelimesinden tahmin edebiliyorsan, ilk refleks. Derinlik, kırmızının olgunluğu, tipografi kontrastı ve sessiz güven bunu kırar.
