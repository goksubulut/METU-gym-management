// METU MOTION §4.1 — Dip-to-Black Screen Transition
//
// Her ekran-arası geçişte, istisnasız. Spec §5.1: ekrana özel custom geçiş kodu
// yazılmaz — tüm route'lar bu TEK wrapper'dan geçer.
//
// Üç faz:
//   FAZ 1 — Exit  (150ms, --ease-motion): giden ekran opacity 1 → 0.
//           Zemin zaten --color-bg (saf siyah) olduğu için içerik kaybolunca
//           ekran kendiliğinden siyah kalır. "Dip to black" tam olarak budur.
//   FAZ 2 — Enter (380ms, --ease-standard): gelen ekran opacity 0 → 1.
//   FAZ 3 — Gelen ekranın kendi <Stagger>'ı (§4.2) devreye girer.
//
// FİLTRE NOTU (spec'ten bilinçli sapma): §4.1 FAZ 2 hero görseline
// `brightness(0.3) → brightness(1)` uygular. Bunu ekranın TAMAMINA veren bir
// wrapper `filter` oluşturur; CSS'te filter'lı bir eleman `position: fixed`
// çocukları için yeni bir containing block yaratır — yani alt tab bar viewport
// yerine wrapper'a göre konumlanır ve kayar. Bu yüzden brightness rampası
// wrapper'da DEĞİL, hero görselini taşıyan ekranın kendisinde uygulanır
// (bkz. Splash.jsx). Wrapper yalnızca opacity taşır.

import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";
import { D, EASE as E } from "../../utils/motion.js";

const EASE_MOTION = E.motion;
const EASE_STANDARD = E.standard;

// NEDEN children DEĞİL de useOutlet(): <Outlet /> bir yer tutucudur, render
// anında router context'inden O ANKİ rotayı okur. AnimatePresence çıkış için
// eski elemanı DOM'da tutar ama o eleman yeniden render olduğunda context artık
// YENİ rotayı gösterir — yani çıkış animasyonu eski ekranı değil, yeni ekranı
// soldurur. useOutlet() ise çözülmüş eleman ağacını (kendi RouteContext'iyle
// birlikte) döndürür; AnimatePresence onu tuttuğunda eski ekran eski kalır.
export default function ScreenTransition({ className = "" }) {
  const { pathname } = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: D.slow, ease: EASE_STANDARD } }}
        exit={{ opacity: 0, transition: { duration: D.exit, ease: EASE_MOTION } }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
