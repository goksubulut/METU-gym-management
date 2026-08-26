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

### Marka — METU MOTION Kırmızısı

Tek aksan. **METU MOTION spec (§1.1) ile #E31837'ye taşındı** — önceki derin ton (#A6192E)
ekranda yeterince "atletik" okunmuyordu; yeni ton daha yüksek enerji taşır ama hâlâ tek
aksandır. Rampa bu değer etrafında yeniden kuruldu.

| Token | Hex | Kullanım |
|---|---|---|
| primary-50…200 | koyuda `#300E14`→`#54 16 21`, açıkta `#FEECEE`→`#FAB0BA` | Chip/badge zeminleri (temaya göre döner) |
| primary-300 | #F48A98 | Dekoratif açık ton |
| primary-400 | #ED5C6F | Hover ara tonu |
| primary-500 | #E8384F | Gradient/hover uç |
| **primary-600** | **#E31837** | **Ana marka — CTA dolgu, aktif segmented thumb, aktif progress dot, aktif tab ikonu, seçili radio/checkbox** |
| primary-700 | #C4122D | Basılı CTA |
| primary-800 | #A00E24 | En koyu vurgu; açık temada metin aksanı |
| primary-900 | #7A0A1B | Derin zemin vurgusu |

**İki ek aksan (spec §1.1):**

| Token | Hex (koyu) | Kullanım |
|---|---|---|
| `--glow` | **#FF3B4E** | Glow/pulse/highlight: kas bölgesi vurgusu, pose-overlay noktaları, ince vurgu çizgileri. Alpha varyantları Tailwind ile: `bg-glow/60`, `bg-glow/25` |
| `--gold` | **#F2A93B** | **SADECE** dashboard görev/kampanya kartı ve puan/rozet göstergesi |
| `--gold-ink` | #1A1206 | Gold zemin üstündeki metin — gold üstünde beyaz kontrastı 1.9:1 kalıyor, bu yüzden koyu kahve-siyah |

**Adaptif aksan (kritik erişilebilirlik kuralı):**
- **Dolgu (buton) üzerinde:** `primary-600` zemin + **her zaman beyaz** metin/ikon. Siyah/koyu metin kullanılmaz.
- **Metin/link olarak koyu temada:** `--accent` = `--glow` (#FF3B4E), saf siyah üstünde ≥5:1 ✓
- **Metin/link olarak açık temada:** `--accent` = #9E0D25 (beyaz üstünde ≥6:1 ✓). Açık temada `--glow` ve `--gold` da beyaz zeminde okunacak şekilde koyulaştırılır.

**Hata/uyarı state'i (spec §1.1):** marka rengi zaten kırmızı olduğundan form validasyon hataları
**sadece renkle gösterilmez** — her hata mesajı bir uyarı ikonu VE açık metin taşır.

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
--ease-out:      cubic-bezier(0.16, 1, 0.3, 1);    /* expo-out — giriş/çıkış, çoğu UI */
--ease-standard: cubic-bezier(0.16, 1, 0.3, 1);    /* spec §1.5 adı — --ease-out ile aynı eğri */
--ease-in-out:   cubic-bezier(0.77, 0, 0.175, 1);  /* ekran içi taşıma/morph (mevcut) */
--ease-motion:   cubic-bezier(0.4, 0, 0.2, 1);     /* spec §1.5 ease-in-out — fade + flip */
--ease-pop:      cubic-bezier(0.34, 1.56, 0.64, 1);/* hafif overshoot — highlight, checkmark */
--ease-drawer:   cubic-bezier(0.32, 0.72, 0, 1);   /* iOS sheet/drawer eğrisi */
```

**Süre token'ları (spec §1.5)** — `--duration-instant` 120ms · `--duration-fast` 180ms ·
`--duration-base` 220ms · `--duration-slow` 380ms · `--duration-flip` 260ms ·
`--duration-pulse` 2000ms · `--stagger-step` 70ms. Tailwind karşılıkları:
`duration-instant/fast/base/slow/flip`, `ease-standard/motion/pop`.

**`--ease-pop` istisnası:** aşağıdaki "bounce/elastic yok" kuralının tek muafiyeti. Yalnızca
seçim onayı (radio/checkbox dolgusu, checkmark, kas bölgesi highlight) için — kullanıcının
kendi dokunuşuna verilen fiziksel tepki. Menü/sheet açılışında hâlâ yasak.

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

> **METU MOTION bileşenleri (Part 2).** Aşağıdaki altı bileşen spec §2 ve §4'e göre
> yazıldı. Canlı önizleme: **`/dev/motion`** (ürün akışının parçası değil, silinebilir).
>
> | Bileşen | Dosya | Spec | Hareket |
> |---|---|---|---|
> | Primary Pill Button | `components/PillButton.jsx` | §2.1 | §4.3 çizgi→hap morph'u |
> | Selectable List Item | `components/SelectableListItem.jsx` | §2.2 | §4.4 pop'lu indicator |
> | Segmented Control | `components/SegmentedControl.jsx` | §2.3 | §4.5 kayan thumb |
> | Wheel Picker | `components/WheelPicker.jsx` | §2.4 | — (native snap) |
> | Progress Dots | `components/ProgressDots.jsx` | §2.5 | §4.7 uzayan çubuk |
> | Stagger / StaggerItem | `components/motion/Stagger.jsx` | §4.2 | 70ms kademeli fade-up |
>
> **Hareket bölüşümü kuralı (uygulamaya özel, spec'te yok).** Framer Motion
> `rgb(var(--token))` biçimindeki değerleri interpolate **edemez** — token'lara bağlı
> her renk geçişi bu yüzden CSS `transition` ile yapılır, Framer yalnızca
> `transform`/`opacity`/`width` taşır. Bu aynı zamanda §5.2 ile de örtüşür.
>
> **Eski `Button.jsx` ve `Tabs.jsx` duruyor.** Uygulamanın mevcut 25+ ekranı onları
> kullanıyor; PillButton/SegmentedControl önce onboarding akışında devreye girer,
> geriye dönük geçiş Part 6'da değerlendirilir.


### Button

> Yeni: `PillButton.jsx` (spec §2.1 + §4.3) — 52px hap CTA, girişte çizgi→hap morph'u.
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

> Yeni: `SegmentedControl.jsx` (spec §2.3 + §4.5) — kırmızı dolgulu thumb, `translateX` ile kayar.
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

## Onboarding Akışı (METU MOTION §3)

Splash → Cinsiyet → Doğum Tarihi → Hedef Kas → Dashboard. Durum
`utils/onboarding.js` üzerinden localStorage'da tutulur; akış yarıda kalırsa
kullanıcı kaldığı yerden devam eder. Onboarding ekranlarında uygulama kromu
(header + tab bar) gizlidir — `UserLayout` `/onboarding/*` yolunu `bare` sayar.

| Ekran | Yol | Spec | CTA koşulu |
|---|---|---|---|
| Splash | `/` | §3.1 | Her zaman aktif |
| Cinsiyetiniz | `/onboarding/gender` | §3.2 | **Sadece bir seçenek seçilince belirir** (morph reveal ilk kez orada tetiklenir) |
| Doğum Tarihiniz | `/onboarding/birthday` | §3.3 | Her zaman aktif (picker varsayılanla gelir) |
| Hedef Kas Grubu | `/onboarding/target-muscle` | §3.4 | Her zaman aktif (0 seçimle de geçilebilir) |

### Hedef Kas Ekranı (§3.4 + §2.8 + §4.4 + §4.6)

`pages/user/onboarding/TargetMuscle.jsx` + `components/MuscleSilhouette.jsx`.

**Neden `BodyDiagram.jsx` kullanılmadı.** Mevcut `BodyDiagram` her kası kendi
anatomik paletiyle boyar (göğüs turuncu, biceps mavi…) — öğretici amaçlı ve beş
ekranda kullanılıyor, bozulmamalı. Spec §1.1 ise tek aksan istiyor: seçili bölge
`--glow`, seçilmemiş `--surface-3`. İki model bağdaşmadığı için onboarding'e
ayrı bir bileşen yazıldı; ikisi de aynı `BODY_DATA` ve `MUSCLES` kataloğunu
paylaşır, yani kas tanımları tek kaynakta kalır.

**§4.4'ün kritik kuralı — tek state.** Liste chip'i ve silüet bölgesi tek bir
`toggleMuscle(slug)` çağrısından tetiklenir. İki ayrı event zinciri yok; ikisi
de aynı render cycle'da güncellenir, bu yüzden senkron hissettirir.

**§2.8 / §5.3 — path şekli asla animasyonlanmaz.** Highlight tamamen CSS'te:
`.muscle-region` → `.muscle-region.is-active`. Yalnızca `fill`, `filter`
(drop-shadow) ve `transform: scale(0.94 → 1)` değişir. `d` attribute'una
dokunulmaz. `transform-box: fill-box` sayesinde ölçek merkezi path'in kendi
bounding-box'ıdır (§4.4'ün istediği davranış).

**§4.6 — sahte flip.** Gerçek `rotateY` yerine `scaleX: 1 → 0 → 1` (2 × 130ms).
Görünmez anda (scaleX = 0) hem silüet görünümü hem sol liste içeriği değişir.

İki tuzak vardı:
1. **Thumb paralel kaymalıydı.** Segmented control `view` state'ine bağlanırsa
   thumb 130ms geç kayar ve flip'ten kopar. Çözüm: `pendingView` (thumb için,
   anında güncellenir) ile `view` (silüet + liste için, flip ortasında güncellenir)
   ayrıldı. Kullanıcı ikisini aynı anda görür.
2. **Preload (§5.4).** Ön ve arka path setlerinin ikisi de DOM'da durur, flip'te
   yalnızca `display` değişir — hiçbir path yeniden parse edilmez, flip ortasında
   jank olmaz.

Vücut modeli onboarding'de seçilen cinsiyetten türetilir (Kadın → `female`,
diğerleri → `male`).

### Pose-Overlay (§2.9 + §4.8)

`components/PoseOverlay.jsx` — desatüre koşucu fotoğrafı + üstünde eklem
nokta-çizgi grafiği. İki katman da `object-fit: cover`, aynı hizada.

**Katmanlar ayrı tutulur — bu bir tercih değil, zorunluluk.** Nabız yalnızca
nokta/çizgi katmanına uygulanır; fotoğraf sabit ve animasyonsuzdur (§2.9). İki
katman tek bir düz görselde birleştirilirse `drop-shadow` nabzı fotoğrafın
tamamını, yani koşucunun gövdesini de parlatır ve §4.8 kırılır.

`pose-overlay.png` (960×1200, şeffaf) base ile birebir aynı çerçevede ve
iskelet koşucunun anatomisine hizalanmış. Kaynak olarak elle birleştirilmiş bir
görsel geldiğinde katmanlar geri ayrıştırılabilir: fotoğraf desatüre olduğu için
(R≈G≈B) `R − max(G,B)` "kırmızılık" değeri iskelette yüksek, fotoğrafta ~0 →
temiz bir alfa maskesi verir. Sonuç `#FF3B4E` (`--color-glow-red`) ile boyanır.

`mode="svg"` yedek olarak duruyor: iskelet 12 eklemli bir SVG olarak koda
çizilir (spec §6: *"SVG — kod içinde çizilebilir, ayrı bir görsel dosyaya gerek
yok"*). Overlay asseti olmadan da ekran çalışsın diye korundu.

**viewBox tuzağı:** SVG `viewBox`'ı fotoğrafın en-boy oranıyla birebir aynı
olmalı (`baseWidth`/`baseHeight` prop'ları). Kare bir viewBox kullanılırsa
`preserveAspectRatio="… slice"` ölçeklemesi fotoğrafın `object-fit: cover`
ölçeklemesinden sapar ve noktalar kayar. `objectPosition` ile
`preserveAspectRatio` hizası da eşleşmek zorundadır.

**Nabız kuralları (§4.8):** saf CSS `@keyframes pulse-glow` — JS interval/rAF
yasak. `filter: drop-shadow` kullanılır, **`box-shadow` değil**: box-shadow
elemanın dikdörtgen sınırını parlatır, drop-shadow ise alfa kanalının gerçek
şeklini takip eder. Sekme arka plana geçince `visibilitychange` ile
`animation-play-state: paused` (pil). Ölçek nefesi istenirse ayrı bir
keyframe'dir (`pulse-scale`), glow keyframe'ine karıştırılmaz.

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

## Ekran Geçişi & Dashboard (METU MOTION §4.1, §3.5, §2.6, §2.7)

### Dip-to-Black geçiş (§4.1)

`components/motion/ScreenTransition.jsx` — tek ortak wrapper, `UserLayout`
içinde hem `bare` hem kromlu akışı sarar. Ekrana özel geçiş kodu yazılmaz (§5.1).
Giden ekran 150ms'te söner, zemin zaten saf siyah olduğu için ekran kendiliğinden
kararır; gelen ekran 380ms'te açılır, ardından kendi `<Stagger>`'ı devreye girer.

**İki tuzak, ikisi de kod yorumlarında açıklandı:**

1. **`filter` wrapper'a verilmez.** §4.1 FAZ 2 hero görseline
   `brightness(0.3 → 1)` uygular. Bunu ekranın tamamına veren bir wrapper CSS'te
   `position: fixed` çocukları için yeni bir *containing block* yaratır — alt tab
   bar viewport yerine wrapper'a göre konumlanır ve kayar. Bu yüzden brightness
   rampası wrapper'da değil, hero'yu taşıyan ekranın kendisinde uygulanır
   (`Splash.jsx`). Wrapper sadece `opacity` taşır; opacity containing block
   yaratmaz, tab bar güvende.

2. **`children` değil `useOutlet()`.** `<Outlet />` bir yer tutucudur, render
   anında router context'inden o anki rotayı okur. AnimatePresence çıkış için eski
   elemanı DOM'da tutar, ama o eleman yeniden render olduğunda context artık YENİ
   rotayı gösterir — çıkış animasyonu eski ekranı değil yeni ekranı soldurur.
   `useOutlet()` çözülmüş eleman ağacını kendi RouteContext'iyle döndürdüğü için
   eski ekran eski kalır.

### Reduced motion — Framer kapsam dışıydı

`index.css`'teki `@media (prefers-reduced-motion: reduce)` kuralı yalnızca CSS
animasyon ve transition'larını susturur. Framer Motion inline style ile JS'ten
animasyon yaptığı için o kuralın **dışında** kalıyordu. `main.jsx`'te
`<MotionConfig reducedMotion="user">` ile Framer işletim sistemi ayarına uyar:
transform/layout hareketi kalkar, opacity crossfade korunur.

### Bottom Tab Bar (§2.6)

Yüzen translucent hap navigasyon **düz bara** çevrildi: 56px + safe-area, üstte
1px `--border-subtle`, opak `--color-bg` zemin (şeffaf değil), aktif ikon+etiket
`--color-brand-red`, pasif `--color-text-secondary` %60 opacity. Ortadaki
yükseltilmiş "Randevu" butonu kaldırıldı — spec: *"Ekstra efekt yok; bu alan sık
kullanıldığı için gösterişli animasyon dikkat dağıtır."* Beş hedefin hepsi
korundu (spec 4 item gösteriyor ama sayı ürüne bağlı).

### Görev Kartı (§2.7)

`components/QuestCard.jsx` — uygulamadaki **tek altın aksanlı yüzey** ve bilinçli
olarak marka kırmızısı kullanmaz; kırmızı yoğunluğu içinde bir nefes alma alanı.
Keskin diagonal `clip-path` ile iki bölge (gradient/blur yok). Altın zeminde beyaz
metin 1.9:1 kaldığı için metin `--gold-ink` (#1A1206) ile yazılır.

### Dashboard (§3.5)

Giriş sırası: başlık bloğu → arama çubuğu → "Günlük Görevler" + banner →
yaklaşan randevu → "Öne Çıkan Antrenmanlar" + "Tümünü Gör" → ipucu kartı.
Eski `animate-rise` / `stagger-N` CSS sınıfları `<Stagger>`/`<StaggerItem>` ile
değiştirildi. Wave randevu kartındaki 11 adet Tailwind `indigo-*` sınıfı
`--glow` token'ına taşındı.

---

## METU MOTION Uygulama Durumu (spec §0.1 checklist)

| # | Madde | Durum |
|---|---|---|
| 1 | Renk token'ları (§1.1) | ✅ Part 1 |
| 2 | Spacing / radius / tipografi (§1.2-1.4) | ✅ Part 1 |
| 3 | Motion token'ları (§1.5) | ✅ Part 1 |
| 4 | Primary Button + morph reveal (§2.1, §4.3) | ✅ Part 2 (`PillButton`) + Part 6 (`Button`) |
| 5 | Selectable List Item (§2.2, §4.4) | ✅ Part 2 |
| 6 | Segmented Control (§2.3, §4.5) | ✅ Part 2 (`SegmentedControl`) + Part 6 (`Tabs`) |
| 7 | Progress Dots (§2.5, §4.7) | ✅ Part 2 |
| 8 | Bottom Tab Bar (§2.6) | ✅ Part 5 |
| 9 | Banner / Quest Card (§2.7) | ✅ Part 5 |
| 10 | Target Muscle bölge-highlight (§2.8, §4.4) | ✅ Part 4 |
| 11 | Pose-overlay pulse-glow (§2.9, §4.8) | ✅ Part 3 |
| 12 | Ekran geçişleri tek wrapper (§4.1) | ✅ Part 5 |
| 13 | Onboarding + Dashboard metinleri (§3.1, §3.5) | ✅ Part 3 + Part 5 |
| 14 | Performans kuralları (§5) | ✅ Part 6 — 8/8 doğrulandı |

**§5 denetimi (8/8):** tek geçiş wrapper'ı · stagger yalnızca opacity+translateY ·
path `d` hiç animasyonlanmıyor · ön/arka setler preload · pulse saf CSS + arka
planda duruyor · thumb `translateX` · morph tek container · hardcode renk yok.

**Bilinçli sapmalar** (gerekçeleri ilgili bölümlerde): §4.1 brightness rampası
wrapper yerine hero'yu taşıyan ekranda (fixed tab bar bozulmasın); §4.6 gerçek
`rotateY` yerine spec'in önerdiği ucuz `scaleX` sahte flip'i; tab bar 4 değil
5 hedef taşıyor (ürün gereksinimi).

---

## Token Disiplini (Part 3.5 denetimi)

Token'lar CSS değişkeni olduğu için `index.css` değiştiğinde tüm ekranlara
kendiliğinden yayılır — **ama sabit yazılmış (hardcode) renkler bu yayılıma
katılmaz.** Part 1'den sonra uygulamada iki farklı kırmızı yan yana duruyordu.
Temizlenenler:

| Dosya | Sorun | Çözüm |
|---|---|---|
| `ui/gym-auth-screen.jsx` | CTA ve linkler sabit `#A6192E`/`#8C1526` — giriş ekranı eski kırmızıda kalmıştı | `bg-primary-600` + `shadow-cta` + `text-accent` |
| `index.css` `.card-border` / `.gradient-border` / `.inner-glow` | indigo-mor gradient (`rgba(99,88,229)` ailesi) — tek aksan kuralını çiğniyordu | `--glow` + `--primary-*` |
| `pages/user/Dashboard.jsx` | wave canvas ve grid indigo çiziyordu | token'lar computed style'dan okunur |
| `components/AppointmentHeatmap.jsx` | ısı rampası eski kırmızı rampasında | token'dan üretilen rampa |
| `components/QRScanner.jsx` | tarama çizgisi gölgesi sabit | `--glow` |

**Canvas / grafik kütüphanesi istisnası.** `<canvas>` 2D context'i ve reaviz gibi
kütüphaneler CSS değişkeni kabul etmez, düz renk stringi ister. Bu dosyalarda
token `getComputedStyle(document.documentElement).getPropertyValue("--x")` ile
bir kez okunup sayıya çevrilir. Hardcode hex yazmak yerine **her zaman bu yol
kullanılır** — böylece marka veya tema değişince grafik de takip eder.

### Part 6 — tam yayma

**Paylaşılan bileşenler spec geometrisine çekildi, 30 ekran bedavaya uydu.**
22 dosyayı tek tek `PillButton`'a taşımak yerine `Button.jsx`'in kendisi hap
radius + token ölçeklerine geçirildi; aynı şekilde `Tabs.jsx` §2.3 renklerine
(kırmızı dolgulu aktif segment). API'ler değişmedi.

`Button.jsx` ile `PillButton.jsx` neden ayrı duruyor: PillButton §4.3'ün
çizgi→hap **morph reveal**'ını taşır ve bu yalnızca bir ekranın ANA ilerleme
aksiyonu için anlamlıdır. Listedeki her butonun morph etmesi gürültü olurdu.

**Hazır Tailwind paleti tamamen kaldırıldı — 46 sınıf, 12 dosya.** Sorun sadece
marka tutarlılığı değildi: `bg-green-50`, `bg-blue-50` gibi **açık tonlar** saf
siyah temada parlak blok oluyordu. Eşleme: yeşil/emerald → `available`,
amber/yellow → `busy`, mavi/indigo/mor → `info`, kırmızı/rose → marka rampası.
Ayrıca `gym-auth-screen.jsx` 16 adet `zinc-*` ve iki `bg-white` ile **kalıcı
olarak açık** bir ekrandı; token'lara çevrildi, artık temayı takip ediyor.

**Grafik renkleri için token köprüsü: `utils/chartColors.js`.** Recharts, reaviz
ve `<canvas>` CSS değişkeni kabul etmez, düz renk stringi ister. `useChartColors()`
token'ları computed style'dan okur ve `themechange` olayını dinler — grafikler
artık tema değişimini de takip ediyor. Grafiklerde DESIGN.md'nin açıkça
yasakladığı jenerik `#dc2626` duruyordu (3 admin ekranı + `mock/analytics.js`'teki
`CHART_COLORS` dizisi); hepsi marka rampasından türeyen `seriesPalette()`'e taşındı.

**§1.1 hata state'i — renk tek başına anlam taşımaz.** Marka rengi kırmızı
olduğu için validasyon hataları renkle ayırt edilemez. `Input.jsx` ve
`gym-auth-screen.jsx` hata mesajlarına `alert` ikonu eklendi, input'a
`aria-invalid` verildi.

**Reduced motion (§DESIGN "zorunlu").** `main.jsx`'te
`<MotionConfig reducedMotion="user">` — detay için "Ekran Geçişi" bölümü.

**Ölü dosyalar (hiçbir yerde import edilmiyor).** `ui/machine-bucket.jsx` (42
hardcode renk), `ui/muscle-group-card.jsx`, `ui/workout-builder.jsx`. Token
denetimine dahil edilmedi; silinmeleri ayrıca değerlendirilmeli.

---

## Anti-slop Muhafızları (bilinçli kaçındıklarımız)

- ~~Saf `#000` yok~~ → **METU MOTION spec (§1.1) bu kuralı geçersiz kıldı:** koyu tema zemini artık saf `#000000`. Gerekçe: spec'in glow/pulse efektleri (kas highlight, pose-overlay) saf siyah zeminde tasarlandı; near-black üstünde `#FF3B4E` glow'un halesi kirli görünüyor. Saf `#fff` metin kuralı geçerli değil — `--content` koyu temada `#FFFFFF`.
- ~~Parlak jenerik kırmızı yok~~ → marka artık **#E31837**. Hâlâ jenerik `#dc2626` DEĞİL (Pantone 186 / ODTÜ kimliğinden türetilmiş), ama önceki #A6192E'den belirgin daha parlak.
- **İki aksan sınırı:** kırmızı ailesi (marka + glow) + altın. Altın yalnızca görev kartı ve puan rozetinde — üçüncü bir aksan eklenmez.
- Krem/cream/sand zemin yok (2026 AI varsayılanı).
- İkiden fazla aksan yok — tek kırmızı.
- Gradient metin yok, side-stripe (kalın sol kenar) border yok, dekoratif glassmorphism yok.
- Her bölümde küçük tracked uppercase eyebrow yok, "01/02/03" numaralı bölüm scaffold'u yok.
- Üç eşit ikon-başlık-metin kartı sırası yok.
- Inter-her-yerde yok — Geist + karakterli display.
- Metin container taşması yok (her breakpoint'te başlık test edilir).
- Layout property animasyonu, `alert()`, `console.log`, dead link (`href="#"`) yok.

**Slop testi:** biri bu arayüze bakıp tereddütsüz "AI yapmış" diyebiliyorsa başarısız. Kategori-refleks kontrolü: paleti/temayı yalnızca "spor uygulaması" kelimesinden tahmin edebiliyorsan, ilk refleks. Derinlik, kırmızının olgunluğu, tipografi kontrastı ve sessiz güven bunu kırar.
