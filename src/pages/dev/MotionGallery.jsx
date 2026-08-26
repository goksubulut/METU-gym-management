// GELİŞTİRİCİ ÖNİZLEMESİ — METU MOTION bileşen galerisi (/dev/motion)
// Part 2'de yazılan bileşenlerin tüm state'lerini ve hareketlerini tek ekranda
// gösterir. Ürün akışının parçası değildir; istenirse silinebilir.

import { useState } from "react";
import PillButton from "../../components/PillButton.jsx";
import ProgressDots from "../../components/ProgressDots.jsx";
import SelectableListItem from "../../components/SelectableListItem.jsx";
import SegmentedControl from "../../components/SegmentedControl.jsx";
import WheelPicker from "../../components/WheelPicker.jsx";
import { Stagger, StaggerItem } from "../../components/motion/Stagger.jsx";
import Icon from "../../components/Icon.jsx";
import PoseOverlay from "../../components/PoseOverlay.jsx";
import { useTheme } from "../../utils/theme.js";

const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => ({ value: a + i, label: String(a + i) }));

function Section({ n, title, note, children }) {
  return (
    <section className="border-t border-subtle pt-6">
      <h2 className="text-h1 text-content">{title}</h2>
      <p className="mt-1 text-caption text-muted">
        <span className="text-glow">§{n}</span> — {note}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function MotionGallery() {
  const { theme, toggleTheme } = useTheme();
  const [gender, setGender] = useState(null);
  const [muscles, setMuscles] = useState(new Set(["chest"]));
  const [side, setSide] = useState("front");
  const [step, setStep] = useState(1);
  const [revealKey, setRevealKey] = useState(0);
  const [m, setM] = useState(5), [d, setD] = useState(14), [y, setY] = useState(2003);
  const [poseMode, setPoseMode] = useState("image");
  const [poseColor, setPoseColor] = useState("A");
  const [breathe, setBreathe] = useState(false);

  const toggleMuscle = (id) =>
    setMuscles((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[430px] px-screen py-8">
        <Stagger className="space-y-8">
          <StaggerItem>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-hero uppercase text-content">METU MOTION</h1>
                <p className="mt-1 text-caption text-muted">Part 2 — bileşen galerisi</p>
              </div>
              <button
                onClick={toggleTheme}
                className="grid h-9 w-9 place-items-center rounded-full border border-subtle text-muted"
                aria-label="Tema değiştir"
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
              </button>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Section n="1.1" title="Renk token'ları" note="Bölüm 1'de tanımlanan palet">
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["bg-bg border border-subtle", "bg", "#000"],
                  ["bg-primary-600", "brand", "#E31837"],
                  ["bg-glow", "glow", "#FF3B4E"],
                  ["bg-gold", "gold", "#F2A93B"],
                  ["bg-surface", "surface", "#1A1A1C"],
                  ["bg-subtle", "border", "#3A3A3D"],
                ].map(([cls, name, hex]) => (
                  <div key={name}>
                    <div className={`h-12 rounded-input ${cls}`} />
                    <p className="mt-1 text-[11px] text-muted">{name}</p>
                    <p className="text-[10px] text-faint">{hex}</p>
                  </div>
                ))}
              </div>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section n="1.4" title="Tipografi" note="hero / h1 / body / caption / button / tab">
              <div className="space-y-2">
                <p className="text-hero uppercase text-content">Hero 800</p>
                <p className="text-h1 text-content">Başlık h1 700</p>
                <p className="text-body text-content">Gövde metni body 500</p>
                <p className="text-caption text-muted">Açıklama caption 400</p>
                <p className="text-tab text-muted">TAB 11px 500</p>
              </div>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section n="2.5 + 4.7" title="Progress Dots" note="aktif adım 18×6px uzamış çubuk">
              <ProgressDots total={4} current={step} />
              <div className="mt-3 flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className="h-8 w-8 rounded-full border border-subtle text-caption text-muted"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section n="2.3 + 4.5" title="Segmented Control" note="thumb translateX ile kayar">
              <SegmentedControl
                options={[
                  { value: "front", label: "Ön Görünüm" },
                  { value: "back", label: "Arka Görünüm" },
                ]}
                value={side}
                onChange={setSide}
              />
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section n="2.2 + 4.4" title="Selectable List Item" note="radio (tek) — pop'lu indicator">
              <div className="space-y-2">
                {["Erkek", "Kadın", "Belirtmek İstemiyorum"].map((g) => (
                  <SelectableListItem
                    key={g}
                    type="radio"
                    full
                    label={g}
                    selected={gender === g}
                    onChange={() => setGender(g)}
                  />
                ))}
              </div>
              <p className="mt-4 text-caption text-muted">checkbox (çoklu):</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[["chest","Göğüs"],["biceps","Biceps"],["legs","Bacak"],["abs","Karın"]].map(([id, label]) => (
                  <SelectableListItem
                    key={id}
                    label={label}
                    selected={muscles.has(id)}
                    onChange={() => toggleMuscle(id)}
                  />
                ))}
              </div>
              <SelectableListItem className="mt-2" full label="Devre dışı" disabled />
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section n="2.4" title="Wheel Picker" note="nötr — marka renginden bağımsız">
              <WheelPicker
                columns={[
                  { key: "m", label: "Ay", value: m, onChange: setM, items: MONTHS.map((lbl, i) => ({ value: i + 1, label: lbl })) },
                  { key: "d", label: "Gün", value: d, onChange: setD, items: range(1, 31) },
                  { key: "y", label: "Yıl", value: y, onChange: setY, items: range(1960, 2012) },
                ]}
              />
              <p className="mt-2 text-center text-caption text-muted">
                Seçili: {d} {MONTHS[m - 1]} {y}
              </p>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section n="2.9 + 4.8" title="Pose Overlay" note="pulse-glow: drop-shadow 4px↔14px, 2000ms, sonsuz">
              <PoseOverlay
                mode={poseMode}
                colorMode={poseColor}
                breathe={breathe}
                className="h-[46vh] w-full rounded-card"
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <SegmentedControl
                  options={[{ value: "image", label: "PNG katman" }, { value: "svg", label: "SVG (yedek)" }]}
                  value={poseMode}
                  onChange={setPoseMode}
                  className="w-full"
                />
                <SegmentedControl
                  options={[{ value: "A", label: "Renk A" }, { value: "B", label: "Renk B" }]}
                  value={poseColor}
                  onChange={setPoseColor}
                  className="w-full"
                />
              </div>
              <SelectableListItem
                className="mt-2"
                full
                label="Ölçek nefesi (scale 1 → 1.03)"
                selected={breathe}
                onChange={setBreathe}
              />
              <p className="mt-2 text-caption text-faint">
                Sekmeyi değiştirip geri gel — animasyon arka planda duruyor (§4.8 kural 2).
              </p>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section n="2.1 + 4.3" title="Pill Button" note="çizgi → hap morph'u (fade-in DEĞİL)">
              <div key={revealKey} className="space-y-3">
                <PillButton>Başla</PillButton>
                <PillButton icon={null} revealDelay={0.1}>İkonsuz</PillButton>
                <PillButton icon="play" iconPosition="left" revealDelay={0.2}>Squat Yap</PillButton>
                <PillButton disabled reveal={false}>Devre dışı</PillButton>
              </div>
              <button
                onClick={() => setRevealKey((k) => k + 1)}
                className="mt-4 w-full rounded-full border border-subtle py-2 text-caption text-muted"
              >
                ↻ Morph animasyonunu tekrar oynat
              </button>
            </Section>
          </StaggerItem>
        </Stagger>
      </div>
    </div>
  );
}
