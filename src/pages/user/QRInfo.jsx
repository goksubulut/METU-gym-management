import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Logo from "../../components/Logo.jsx";
import qrIcon from "../../assets/qr-info.png";

const STEPS = [
  { icon: "🚪", title: "Kapıdaki QR", text: "Kapıdaki QR'ı okutarak uygulamanın nasıl çalıştığını ve makine QR'larının ne işe yaradığını anlatan bilgilendirme sayfasına ulaş." },
  { icon: "🏋️", title: "Makine QR'ı", text: "Her makinenin üzerindeki QR'ı okut; kullanım videosu açılır." },
  { icon: "🔧", title: "Arıza Bildir", text: "Makinede bir sorun fark edersen QR üzerinden hemen bildir." },
];

export default function QRInfo() {
  const nav = useNavigate();
  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-white px-6 py-10">
      <Logo />
      <div className="mt-8 flex flex-col items-center text-center">
        <div className="grid h-32 w-32 place-items-center rounded-2xl border-4 border-primary-600 bg-white p-2">
          <img src={qrIcon} alt="QR kod" className="h-full w-full object-contain" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-gray-900">
          QR Nasıl Çalışır?
        </h1>
        <p className="mt-2 max-w-xs text-sm text-gray-500">
          METU GYM'de QR kodlar salondaki deneyimini hızlandırır. İşte kullanım adımları:
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {STEPS.map((s) => (
          <Card key={s.title} soft className="flex items-center gap-4 p-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-sm">
              {s.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{s.title}</p>
              <p className="text-xs text-gray-500">{s.text}</p>
            </div>
          </Card>
        ))}
      </div>

      <Button full size="lg" className="mt-8" onClick={() => nav("/auth")}>
        Devam Et
      </Button>
    </div>
  );
}
