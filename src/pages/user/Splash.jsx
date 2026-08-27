// METU MOTION §3.1 — Onboarding / Splash ekranı (adım 1/4)
//
// Spatial Glassmorphism yönü: tam ekran koşucu fotoğrafı (kullanıcının kırmızı
// görseli) net olarak arka planı doldurur; başlık ve CTA ise fotoğrafın üstünde
// yüzen buzlu cam bir bento kart içinde durur.
//
// Giriş sırası:
//   t=0      hero fotoğraf opacity + brightness ile belirir (500ms)
//   t≈150ms  başlık satırları stagger ile girer (90ms arayla)
//   t≈350ms  cam CTA kartı + pill morph reveal ile girer

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProgressDots from "../../components/ProgressDots.jsx";
import PillButton from "../../components/PillButton.jsx";
import { Stagger, StaggerItem } from "../../components/motion/Stagger.jsx";
import { ONBOARDING_TOTAL } from "../../utils/onboarding.js";
import { D, EASE as E } from "../../utils/motion.js";

const HERO = "/images/onboarding-hero.jpg";
const HERO_FALLBACK = "/images/pose-base.jpg";

export default function Splash() {
  const nav = useNavigate();

  return (
    <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col overflow-hidden bg-bg">
      {/* Tam ekran hero fotoğraf — net, arka planı doldurur */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, filter: "brightness(0.3)" }}
        animate={{ opacity: 1, filter: "brightness(1)" }}
        transition={{ duration: D.slow, ease: E.standard }}
      >
        <img
          src={HERO}
          alt=""
          aria-hidden="true"
          draggable="false"
          className="h-full w-full select-none object-cover"
          onError={(e) => {
            if (e.currentTarget.src.indexOf(HERO_FALLBACK) === -1)
              e.currentTarget.src = HERO_FALLBACK;
          }}
        />
        {/* Metin okunurluğu için üst + alt karartma */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-bg via-bg/40 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-bg via-bg/75 to-transparent"
        />
      </motion.div>

      <div className="relative z-10 flex min-h-screen flex-col px-screen pb-8 pt-4">
        <ProgressDots total={ONBOARDING_TOTAL} current={0} />

        {/* Hero başlık — 3 satır, sola hizalı */}
        <Stagger className="mt-8" delay={0.15}>
          <StaggerItem>
            <h1 className="text-hero uppercase leading-[1.06] text-content">Kampüste</h1>
          </StaggerItem>
          <StaggerItem>
            <h1 className="text-hero uppercase leading-[1.06] text-content">METU Motion</h1>
          </StaggerItem>
          <StaggerItem>
            <h1 className="text-hero uppercase leading-[1.06] text-primary-400">
              ile formda kal
            </h1>
          </StaggerItem>
        </Stagger>

        {/* Alt CTA — buzlu cam bento kart içinde */}
        <motion.div
          className="glass-panel mt-auto rounded-[28px] p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.slow, ease: E.standard, delay: 0.28 }}
        >
          <p className="mb-4 text-caption text-white/70">
            Randevunu al, programını oluştur, <span className="text-glow">ilerlemeni</span> takip et.
          </p>
          <PillButton onClick={() => nav("/onboarding/gender")} revealDelay={0.35}>
            Başla
          </PillButton>
          <p className="mt-4 text-center text-caption text-white/60">
            veya{" "}
            <button
              onClick={() => nav("/auth")}
              className="font-semibold text-white underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              Giriş Yap
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
