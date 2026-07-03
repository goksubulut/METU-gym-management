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
    title: "Kas Grubunu Planla",
    text: "Çalışacağın kas grubunu vücut şeması üzerinden seç, sana uygun makineleri gör.",
  },
  {
    icon: "qr",
    title: "QR ile Keşfet",
    text: "Makine üzerindeki QR'ı okut; kullanım videosuna ve arıza/öneri bildirme sayfasına anında ulaş.",
  },
  {
    icon: "star",
    title: "Deneyimini Paylaş",
    text: "Makineleri puanla, arıza bildir, öneride bulun. Salonu birlikte geliştirelim.",
  },
];

export default function Splash() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const last = i === SLIDES.length - 1;

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
        <div className="hero-sheen mb-8 grid h-40 w-40 place-items-center rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow">
          <Icon name={SLIDES[i].icon} size={64} strokeWidth={1.4} />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900">{SLIDES[i].title}</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">
          {SLIDES[i].text}
        </p>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((_, idx) => (
          <span
            key={idx}
            className={`h-2 rounded-full transition-all ${
              idx === i ? "w-6 bg-primary-600" : "w-2 bg-gray-200"
            }`}
          />
        ))}
      </div>

      <Button
        full
        size="lg"
        onClick={() => (last ? nav("/qr-info") : setI(i + 1))}
      >
        {last ? "Başlayalım" : "Devam"}
      </Button>
    </div>
  );
}
