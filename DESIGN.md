# Design

## Theme

Light. Soğuk açık gri zemin (#eef0f3), beyaz içerik yüzeyleri, koyu mürekkep paneller. Kırmızı tek aksanttır — güç ve hareket, fazlası değil.

---

## Color Palette

### Brand / Primary — Kırmızı

| Token | Hex | Kullanım |
|---|---|---|
| primary-50 | #fef2f2 | Soft badge arka planı, hover tonu |
| primary-100 | #fee2e2 | Soft kart çerçevesi, secondary buton bg hover |
| primary-200 | #fecaca | Selection rengi, secondary buton border |
| primary-300 | #fca5a5 | İkon vurgusu, dekoratif |
| primary-400 | #f87171 | Gradient ara ton |
| **primary-500** | **#ef4444** | Gradient başlangıcı (primary button from) |
| **primary-600** | **#dc2626** | Ana marka rengi — CTA, aktif durum, link |
| primary-700 | #b91c1c | Gradient bitiş, secondary metin |
| primary-800 | #991b1b | Hover CTA |
| primary-900 | #7f1d1d | Koyu vurgu, nadiren |

### Nötr

| Token | Değer | Kullanım |
|---|---|---|
| bg-app | #eef0f3 | Uygulama zemin rengi (body bg) |
| white | #ffffff | Kart yüzeyler |
| soft | #fdf1f1 | Kırmızı-nötr kart zemini (uyarı / teşvik) |
| gray-100 | Tailwind | Kart çerçevesi |
| gray-400 | Tailwind | Yardımcı metin, alt etiket |
| gray-500 | Tailwind | Boş durum metni |
| gray-600 | Tailwind | Gövde metni |
| gray-900 | Tailwind | Ana gövde metni, dark buton |

### Ink — Koyu Paneller

| Token | Hex | Kullanım |
|---|---|---|
| ink-800 | #1f2430 | Hero kart gradyanı başlangıcı |
| ink-900 | #151923 | Hero kart orta ton |
| ink-950 | #0d1017 | Hero kart bitiş, en derin ton |

---

## Typography

### Font Families

- **Sans (gövde)**: Inter — 400, 500, 600, 700, 800. Tüm UI metinleri, etiketler, formlar.
- **Display (başlıklar)**: Space Grotesk — 500, 600, 700. `h1`, `h2`, `h3`, hero sayılar.

### Scale (Tailwind defaults + project kullanımı)

| Kullanım | Boyut | Ağırlık | Yorum |
|---|---|---|---|
| Sayfa başlığı (h1) | text-2xl (1.5rem) | font-bold (700) | Space Grotesk, -0.02em letter-spacing |
| Bölüm başlığı (h2) | text-base–xl | font-bold | Space Grotesk |
| Kart başlığı | text-sm | font-bold | Inter |
| Gövde | text-sm | font-normal/medium | Inter |
| Yardımcı / etiket | text-xs | font-semibold | Inter, uppercase tracking-wide özel durumlarda |
| Hero sayı | text-4xl | font-bold | Space Grotesk, tracking-tight |
| Küçük etiket | text-[10px]–text-[11px] | font-semibold | uppercase + letter-spacing |

Letter-spacing: `-0.02em` tüm display başlıklarda.

---

## Shadows

| Token | Değer | Kullanım |
|---|---|---|
| shadow-card | `0 1px 2px rgba(16,20,28,0.04), 0 4px 16px rgba(16,20,28,0.06)` | Tüm kartlar |
| shadow-pop | `0 4px 12px rgba(16,20,28,0.08), 0 16px 40px rgba(16,20,28,0.14)` | Hover kartlar, dropdown |
| shadow-glow | `0 8px 24px rgba(220,38,38,0.35)` | Primary (kırmızı) buton |
| shadow-nav-float | `0 8px 32px rgba(16,20,28,0.16)` | Float navigasyon |

---

## Border Radius

| Token | Değer | Kullanım |
|---|---|---|
| rounded-full | 9999px | Butonlar, badge, pill etiketler |
| rounded-2xl | 1rem | Kartlar (default) |
| rounded-xl | 0.75rem | İkon container, ufak kart |
| rounded-xl2 | 1.25rem | Custom, büyük kart varyantları |

---

## Components

### Button

Altı varyant, üç boyut. Her zaman `rounded-full`. Transition 150ms.

**Varyantlar:**
- `primary`: Kırmızı gradient (primary-500 → primary-700) + shadow-glow. Ana CTA.
- `secondary`: primary-50 bg, primary-700 metin, primary-100 border.
- `outline`: Beyaz bg, primary-700 metin, primary-200 border.
- `ghost`: Şeffaf, gray-600 metin, hover gray-100 bg.
- `danger`: red-600 bg, beyaz metin.
- `dark`: gray-900 bg, beyaz metin.

**Boyutlar:** sm (h-9 px-4 text-sm) | md (h-11 px-5 text-sm) | lg (h-13 px-6 text-base)

Active state: `scale-[0.98]`. Disabled: `opacity-50 cursor-not-allowed`.

### Card

İki mod:
- **Default**: beyaz bg, gray-100 border, shadow-card, rounded-2xl.
- **Soft**: soft (#fdf1f1) bg, primary-100/60 border.

Tıklanabilir kart: hover `-translate-y-0.5` + shadow-pop. Active: geri dön.

### Badge

Küçük pill etiketler. `primary` tone: primary-50 bg, primary-700 metin.

### Input

Çerçeveli input. Focus state: primary renk ring.

### Tabs

Segmented control tarzı — aktif tab primary renginde.

### Modal

Overlay + ortalanmış kart. Backdrop blur.

---

## Motion

### Keyframes

```css
@keyframes rise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**`animate-rise`**: 450ms, `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out). Sayfa yüklemesinde içerik bloğu girişi.
**`animate-rise-late`**: aynı, 0.12s gecikme. İkincil içerik için sıralı giriş.

### Prensip

Geçişler 150–200ms. Yalnızca durum değişimini temsil eder — dekoratif değil. `prefers-reduced-motion` durumunda geçiş instant ya da opacity-only.

### Hero Sheen

`.hero-sheen`: `::before` pseudo-element ile koyu kart üzerine radial ışık efekti. `pointer-events: none`, layout'u etkilemez.

---

## Spacing & Layout

- Sayfa padding: `px-4` (mobil), `py-5` üst boşluk.
- Kart arası gap: `gap-3`.
- İçerik bölümleri arası: `mt-5` / `mt-6`.
- Hızlı aksiyon grid: `grid-cols-2 gap-3`.
- Mobil-öncelikli SPA; bottom navigation ile ana yönlendirme.

---

## Icons

Özel `<Icon>` component — `name` prop ile seçilen SVG icon. Boyut prop ile px değeri. Kullanılan ikonlar: `calendar`, `dumbbell`, `flame`, `body`, `message`, `chevronRight`, `plus` vb.

---

## Surfaces

| Yüzey | Zemin | Yönlendirme | Not |
|---|---|---|---|
| Kullanıcı app | #eef0f3 | Bottom nav, mobil-öncelikli | Birincil yüzey |
| Hero kart | ink-800 → ink-950 gradient | — | Koyu, beyaz metin |
| Soft kart | #fdf1f1 | — | Uyarı / empty state |
| Admin panel | #eef0f3 | Top/sidebar nav, masaüstü | Tablo-yoğun |
| Resepsiyon | #eef0f3 | Tek ekran, check-in odaklı | Basit |
