// GEÇİCİ — METU MOTION §3.4 "Hedef Kas Grubu" ekranı Part 4'te yazılacak.
// Bu placeholder yalnızca onboarding akışının kopmaması için var; Part 4'te silinir.

import { useNavigate } from "react-router-dom";
import ProgressDots from "../../../components/ProgressDots.jsx";
import PillButton from "../../../components/PillButton.jsx";
import { completeOnboarding, ONBOARDING_TOTAL } from "../../../utils/onboarding.js";

export default function TargetMusclePlaceholder() {
  const nav = useNavigate();
  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-bg px-screen pb-8 pt-4">
      <ProgressDots total={ONBOARDING_TOTAL} current={3} />
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-h1 text-content">Hedef Kas Grubu</h1>
        <p className="mt-2 text-caption text-muted">
          Bu ekran <span className="text-glow">Part 4</span>'te yazılacak — silüet senkron
          highlight (§2.8, §4.4) ve ön/arka flip geçişi (§4.6) ile birlikte.
        </p>
      </div>
      <PillButton
        onClick={() => {
          completeOnboarding();
          nav("/home");
        }}
      >
        Bitti
      </PillButton>
    </div>
  );
}
