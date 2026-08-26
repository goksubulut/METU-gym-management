// METU MOTION §3.2 — "Cinsiyetiniz" ekranı (onboarding adım 2/4)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PoseOverlay from "../../../components/PoseOverlay.jsx";
import ProgressDots from "../../../components/ProgressDots.jsx";
import SelectableListItem from "../../../components/SelectableListItem.jsx";
import PillButton from "../../../components/PillButton.jsx";
import { Stagger, StaggerItem } from "../../../components/motion/Stagger.jsx";
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
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-bg">
      <div className="px-screen pb-4 pt-4">
        <ProgressDots total={ONBOARDING_TOTAL} current={1} />
      </div>

      {/* §3.2 — pose grafiği burada splash'takinden kompakt: ekranın ~%35'i */}
      <PoseOverlay className="h-[35vh] w-full shrink-0" objectPosition="top" />

      <Stagger className="flex flex-1 flex-col px-screen pb-8 pt-6" delay={0.15}>
        <StaggerItem>
          <h1 className="text-h1 text-content">Cinsiyetiniz</h1>
        </StaggerItem>
        <StaggerItem>
          <p className="mt-2 text-caption text-muted">
            Vücudunuzun <span className="text-glow">metabolik hızını</span> tahmin etmek için.
          </p>
        </StaggerItem>

        <div className="mt-6 space-y-2" role="radiogroup" aria-label="Cinsiyetiniz">
          {OPTIONS.map((o) => (
            <StaggerItem key={o}>
              <SelectableListItem
                type="radio"
                full
                label={o}
                selected={gender === o}
                onChange={() => setGender(o)}
              />
            </StaggerItem>
          ))}
        </div>

        {/* §3.2 — buton SADECE bir seçenek seçildiğinde, morph reveal ile belirir */}
        <div className="mt-auto flex min-h-[52px] items-end pt-8">
          {gender && <PillButton onClick={handleNext}>Devam Et</PillButton>}
        </div>
      </Stagger>
    </div>
  );
}
