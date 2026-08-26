// METU MOTION §3.4 — "Hedef Kas Grubu" ekranı (onboarding adım 4/4)
//
// Bu ekranın kalbi §4.4'ün kritik kuralı: liste chip'i ve silüetteki kas bölgesi
// TEK BİR state güncellemesinden (toggleMuscle) tetiklenir. İki ayrı event
// zinciri kurulmaz — ikisi de aynı render cycle'da güncellenir ki görsel olarak
// tam senkron hissettirsin.

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProgressDots from "../../../components/ProgressDots.jsx";
import SegmentedControl from "../../../components/SegmentedControl.jsx";
import SelectableListItem from "../../../components/SelectableListItem.jsx";
import PillButton from "../../../components/PillButton.jsx";
import MuscleSilhouette, { selectableMuscles } from "../../../components/MuscleSilhouette.jsx";
import { MUSCLES } from "../../../components/BodyDiagram.jsx";
import { Stagger, StaggerItem } from "../../../components/motion/Stagger.jsx";
import {
  readOnboarding, saveOnboarding, completeOnboarding, ONBOARDING_TOTAL,
} from "../../../utils/onboarding.js";

const FLIP_HALF = 130; // §4.6 — her faz 130ms, toplam --duration-flip (260ms)

/** Onboarding'de seçilen cinsiyete göre vücut modeli. */
function bodyFor(gender) {
  return gender === "Kadın" ? "female" : "male";
}

export default function TargetMuscle() {
  const nav = useNavigate();
  const saved = readOnboarding();
  const body = bodyFor(saved.gender);

  const [view, setView] = useState("front");        // silüet + liste içeriği
  const [pendingView, setPendingView] = useState("front"); // segmented thumb (anında)
  const [selected, setSelected] = useState(() => new Set(saved.muscles ?? []));
  const [collapsed, setCollapsed] = useState(false); // §4.6 scaleX 0 anı
  const flipTimer = useRef(null);

  // Ekran flip ortasında terk edilirse zamanlayıcı sızmasın
  useEffect(() => () => clearTimeout(flipTimer.current), []);

  // §4.4 — TEK state güncellemesi: hem chip hem silüet bölgesi buradan tetiklenir.
  const toggleMuscle = useCallback((slug) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }, []);

  // §4.6 — "Sahte flip": scaleX 1→0, görünmez anda içerik değişir, 0→1.
  // Segmented control thumb'ı (§4.5) bununla TAM PARALEL çalışır: setView'i
  // burada geciktiriyoruz ama thumb kendi state'iyle hemen kayar.
  const handleView = (next) => {
    if (next === pendingView || collapsed) return;
    setPendingView(next);   // §4.6: thumb HEMEN kayar, gövde aynı anda sıkışır
    setCollapsed(true);
    clearTimeout(flipTimer.current);
    flipTimer.current = setTimeout(() => {
      setView(next);      // silüet path'leri + sol liste AYNI anda değişir
      setCollapsed(false);
    }, FLIP_HALF);
  };

  const muscles = selectableMuscles(body, view);

  const handleDone = () => {
    saveOnboarding({ muscles: [...selected] });
    completeOnboarding();
    nav("/home");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-bg px-screen pb-8 pt-4">
      <ProgressDots total={ONBOARDING_TOTAL} current={3} />

      <Stagger className="flex flex-1 flex-col" delay={0.1}>
        <StaggerItem className="mt-6">
          <h1 className="text-h1 text-content">Hedef Kas Grubu</h1>
          <p className="mt-2 text-caption text-muted">
            Çalışmak istediğiniz kas grubunu seçin.
          </p>
        </StaggerItem>

        <StaggerItem className="mt-4">
          <SegmentedControl
            options={[
              { value: "front", label: "Ön Görünüm" },
              { value: "back", label: "Arka Görünüm" },
            ]}
            value={pendingView}
            onChange={handleView}
          />
        </StaggerItem>

        {/* İki sütun: sol liste (çoklu seçim) + sağ silüet */}
        <StaggerItem className="mt-5 flex flex-1 gap-3">
          <div
            className="no-scrollbar w-[45%] shrink-0 space-y-2 overflow-y-auto"
            role="group"
            aria-label="Kas grupları"
          >
            {muscles.map((slug) => (
              <SelectableListItem
                key={slug}
                full
                label={MUSCLES[slug].label}
                selected={selected.has(slug)}
                onChange={() => toggleMuscle(slug)}
                size="sm"
              />
            ))}
          </div>

          {/* §4.6 — flip yalnızca scaleX animasyonlar; transform-origin merkez */}
          <motion.div
            className="flex flex-1 items-center justify-center"
            animate={{ scaleX: collapsed ? 0 : 1 }}
            transition={{ duration: FLIP_HALF / 1000, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: "center" }}
          >
            <MuscleSilhouette
              gender={body}
              view={view}
              selected={selected}
              onToggle={toggleMuscle}
              className="h-full max-h-[46vh] w-full"
            />
          </motion.div>
        </StaggerItem>

        <div className="mt-6">
          <PillButton onClick={handleDone} revealDelay={0.3}>
            Bitti
          </PillButton>
          <p className="mt-3 text-center text-caption text-faint">
            {selected.size > 0
              ? `${selected.size} kas grubu seçildi`
              : "Seçim yapmadan da devam edebilirsiniz"}
          </p>
        </div>
      </Stagger>
    </div>
  );
}
