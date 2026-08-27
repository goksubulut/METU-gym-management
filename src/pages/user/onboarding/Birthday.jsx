// METU MOTION §3.3 — "Doğum Tarihiniz" ekranı (onboarding adım 3/4)
//
// Eski form yapısı: başlık + açıklama + çark seçici + buton. Arka planda
// kısılmış spatial aura durur; çark okunurluğu için hafif cam bir zemin taşır.
// Buton HER ZAMAN aktif (§3.3): picker varsayılan bir değerle gelir.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AmbientBackdrop from "../../../components/AmbientBackdrop.jsx";
import ProgressDots from "../../../components/ProgressDots.jsx";
import WheelPicker from "../../../components/WheelPicker.jsx";
import PillButton from "../../../components/PillButton.jsx";
import { Stagger, StaggerItem } from "../../../components/motion/Stagger.jsx";
import { readOnboarding, saveOnboarding, ONBOARDING_TOTAL } from "../../../utils/onboarding.js";

const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const THIS_YEAR = new Date().getFullYear();
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => ({ value: a + i, label: String(a + i) }));
const daysIn = (m, y) => new Date(y, m, 0).getDate();

export default function Birthday() {
  const nav = useNavigate();
  const saved = readOnboarding().birthday;
  const [month, setMonth] = useState(saved?.month ?? 1);
  const [day, setDay] = useState(saved?.day ?? 1);
  const [year, setYear] = useState(saved?.year ?? 2003);

  // Ay/yıl değişince gün sayısı değişebilir (Şubat, 30 çeken aylar)
  const maxDay = daysIn(month, year);
  const safeDay = Math.min(day, maxDay);

  const handleNext = () => {
    saveOnboarding({ birthday: { month, day: safeDay, year } });
    nav("/onboarding/register");
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col overflow-hidden bg-bg">
      <AmbientBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col px-screen pb-8 pt-4">
        <ProgressDots total={ONBOARDING_TOTAL} current={2} />

        <Stagger className="mt-10 flex flex-1 flex-col" delay={0.15}>
          <StaggerItem>
            <h1 className="text-h1 text-content">Doğum Tarihiniz</h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-2 text-caption text-white/70">
              METU MOTION'ı <span className="text-glow">size özel</span> hale getirmek için.
            </p>
          </StaggerItem>

          <StaggerItem className="mt-6">
            <div className="glass-tile rounded-[22px] px-3 py-2">
              <WheelPicker
                bandClassName="bg-white/12 ring-1 ring-inset ring-white/15"
                columns={[
                  { key: "m", label: "Ay",  value: month, onChange: setMonth, items: MONTHS.map((l, i) => ({ value: i + 1, label: l })) },
                  { key: "d", label: "Gün", value: safeDay, onChange: setDay, items: range(1, maxDay) },
                  { key: "y", label: "Yıl", value: year, onChange: setYear, items: range(1940, THIS_YEAR - 12) },
                ]}
              />
            </div>
          </StaggerItem>

          <div className="mt-auto pt-8">
            <PillButton onClick={handleNext} revealDelay={0.3}>Devam Et</PillButton>
          </div>
        </Stagger>
      </div>
    </div>
  );
}
