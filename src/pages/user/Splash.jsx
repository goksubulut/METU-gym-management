// METU MOTION §3.1 — Onboarding / Splash ekranı (adım 1/4)
//
// Giriş animasyon sırası (§3.1):
//   t=0      pose-overlay görseli opacity + brightness ile belirir (380ms)
//   t≈150ms  hero başlık satırları stagger ile girer (70ms arayla)
//   t≈150ms  pose-overlay noktaları pulse döngüsüne başlar (sonsuz)
//   t≈350ms  CTA morph reveal ile girer (burada her zaman aktif — ön koşul yok)

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PoseOverlay from "../../components/PoseOverlay.jsx";
import ProgressDots from "../../components/ProgressDots.jsx";
import PillButton from "../../components/PillButton.jsx";
import { Stagger, StaggerItem } from "../../components/motion/Stagger.jsx";
import { ONBOARDING_TOTAL } from "../../utils/onboarding.js";
import { D, EASE as E } from "../../utils/motion.js";

export default function Splash() {
  const nav = useNavigate();

  return (
    <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col overflow-hidden bg-bg">
      {/* Pose grafiği — ekranın alt 2/3'ünü kaplar, tam boy figür (§3.1) */}
      <motion.div
        className="absolute inset-x-0 bottom-0 top-[22%]"
        initial={{ opacity: 0, filter: "brightness(0.3)" }}
        animate={{ opacity: 1, filter: "brightness(1)" }}
        transition={{ duration: D.slow, ease: E.standard }}
      >
        <PoseOverlay className="h-full w-full" objectPosition="center" priority />
        {/* Metnin okunurluğu için üstte siyaha eriyen maske — figürü kesmez */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-bg to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg via-bg/70 to-transparent"
        />
      </motion.div>

      <div className="relative z-10 flex min-h-screen flex-col px-screen pb-8 pt-4">
        <ProgressDots total={ONBOARDING_TOTAL} current={0} />

        {/* Hero başlık — 3 satır, sola hizalı (§3.1) */}
        <Stagger className="mt-8" delay={0.15}>
          <StaggerItem>
            <h1 className="text-hero uppercase leading-[1.06] text-content">
              Kampüste
            </h1>
          </StaggerItem>
          <StaggerItem>
            <h1 className="text-hero uppercase leading-[1.06] text-content">
              METU Motion
            </h1>
          </StaggerItem>
          <StaggerItem>
            <h1 className="text-hero uppercase leading-[1.06] text-primary-600">
              ile formda kal
            </h1>
          </StaggerItem>
        </Stagger>

        {/* Alt CTA alanı */}
        <div className="mt-auto">
          <PillButton onClick={() => nav("/onboarding/gender")} revealDelay={0.35}>
            Başla
          </PillButton>
          <p className="mt-4 text-center text-caption text-muted">
            veya{" "}
            <button
              onClick={() => nav("/auth")}
              className="font-semibold text-content underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              Giriş Yap
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
