import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Icon from "../../components/Icon.jsx";
import Logo from "../../components/Logo.jsx";

const SLIDES = [
  {
    icon: "calendar",
    title: "Randevunu Al",
    text: "Sabit saat slotlarından uygun olanı seç. Randevusuz salona giriş yok — yerin garanti.",
  },
  {
    icon: "body",
    title: "Hedef Kasını Belirle",
    text: "Vücut şeması üzerinden çalışacağın kası seç, sana en uygun makineleri ve egzersizleri gör.",
  },
  {
    icon: "qr",
    title: "QR ile Keşfet",
    text: "Her makinenin üzerindeki QR'ı okut; kullanım videosuna ve arıza bildirimine anında ulaş.",
  },
  {
    icon: "star",
    title: "Deneyimini Paylaş",
    text: "Makineleri puanla, arıza bildir, öneride bulun. Salonu birlikte geliştirelim.",
    cta: "Başlayalım",
    next: "/qr-info",
  },
];

export default function Splash() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  const handleNext = () => {
    if (last && slide.next) {
      nav(slide.next);
    } else if (last) {
      nav("/auth");
    } else {
      setI(i + 1);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-white px-6 py-10">
      <div className="flex items-center justify-between">
        <Logo />
        <button
          onClick={() => nav("/auth")}
          className="text-sm font-semibold text-gray-400"
        >
          Atla
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-8 grid h-36 w-36 place-items-center rounded-3xl bg-primary-600 text-white">
          <Icon name={slide.icon} size={60} strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900">
          {slide.title}
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">
          {slide.text}
        </p>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === i ? "w-6 bg-primary-600" : "w-1.5 bg-gray-200"
            }`}
          />
        ))}
      </div>

      <Button full size="lg" onClick={handleNext}>
        {last && slide.cta ? slide.cta : last ? "Başlayalım" : "Devam"}
      </Button>
    </div>
  );
}
