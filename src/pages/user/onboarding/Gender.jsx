// METU MOTION §3.2 — "Cinsiyetiniz" ekranı (onboarding adım 2/4)
//
// Eski form yapısı: başlık + açıklama + tekli seçim listesi. Seçenekler artık
// buzlu cam tile (SelectableListItem glass) olarak render edilir; arka planda
// kısılmış spatial aura durur.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AmbientBackdrop from "../../../components/AmbientBackdrop.jsx";
import ProgressDots from "../../../components/ProgressDots.jsx";
import SelectableListItem from "../../../components/SelectableListItem.jsx";
import PillButton from "../../../components/PillButton.jsx";
import { Stagger, StaggerItem } from "../../../components/motion/Stagger.jsx";
import { D, EASE as E } from "../../../utils/motion.js";
import { readOnboarding, saveOnboarding, ONBOARDING_TOTAL } from "../../../utils/onboarding.js";

const OPTIONS = ["Erkek", "Kadın", "Belirtmek İstemiyorum"];

export default function Gender() {
  const nav = useNavigate();
  const [gender, setGender] = useState(() => readOnboarding().gender ?? null);

  const handleNext = () => {
    saveOnboarding({ gender });
    nav("/onboarding/birthday");
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col overflow-hidden bg-bg">
      <AmbientBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col px-screen pb-8 pt-4">
        <ProgressDots total={ONBOARDING_TOTAL} current={1} />

        <Stagger className="mt-10 flex flex-1 flex-col" delay={0.15}>
          <StaggerItem>
            <h1 className="text-h1 text-content">Cinsiyetiniz</h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-2 text-caption text-white/70">
              Vücudunuzun <span className="text-glow">metabolik hızını</span> tahmin etmek için.
            </p>
          </StaggerItem>

          <div className="mt-6 space-y-2.5" role="radiogroup" aria-label="Cinsiyetiniz">
            {OPTIONS.map((o) => (
              <StaggerItem key={o}>
                <SelectableListItem
                  type="radio"
                  glass
                  full
                  label={o}
                  selected={gender === o}
                  onChange={() => setGender(o)}
                />
              </StaggerItem>
            ))}
          </div>

          {/* Buton yalnızca bir seçenek seçildiğinde belirir */}
          <div className="mt-auto flex min-h-[52px] items-end pt-8">
            {gender && (
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: D.fast, ease: E.standard }}
              >
                <PillButton onClick={handleNext}>Devam Et</PillButton>
              </motion.div>
            )}
          </div>
        </Stagger>
      </div>
    </div>
  );
}
