import { useState } from "react";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Tabs from "../../components/Tabs.jsx";
import Icon from "../../components/Icon.jsx";
import StarRating from "../../components/StarRating.jsx";
import { Textarea, Select } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { machines } from "../../mock/machines.js";

// NOT: Arıza bildirimi bu ekranda YOK. Arıza yalnızca makine QR kodu ile
// (/machine/:id → Makine Detay) o makineye scope'lanmış olarak bildirilir.
const TABS = [
  { value: "suggest", label: "Öneri / Şikayet" },
  { value: "rate", label: "Puanla" },
];

export default function Feedback() {
  const [tab, setTab] = useState("suggest");
  const [rating, setRating] = useState(0);
  const toast = useToast();

  const submit = (e) => {
    e.preventDefault();
    toast("Geri bildirimin gönderildi", "success");
    setRating(0);
    e.target.reset();
  };

  return (
    <div className="px-4 py-5">
      <h1 className="font-display text-xl font-bold tracking-tight text-gray-900">Geri Bildirim</h1>
      <p className="mb-4 text-sm text-gray-500">
        Deneyimini paylaş, salonu birlikte geliştirelim.
      </p>

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-5" />

      <Card className="p-4">
        <form onSubmit={submit} className="space-y-4">
          {tab === "suggest" && (
            <>
              <Select label="Tür" defaultValue="Öneri">
                <option>Öneri</option>
                <option>Şikayet</option>
              </Select>
              <Select label="Konu" defaultValue="Ekipman">
                <option>Ekipman</option>
                <option>Temizlik</option>
                <option>Personel</option>
                <option>Uygulama</option>
                <option>Diğer</option>
              </Select>
              <Textarea label="Mesajın" placeholder="Görüşünü yaz..." required />
            </>
          )}

          {tab === "rate" && (
            <>
              <Select label="Makine" defaultValue="">
                <option value="" disabled>
                  Makine seç
                </option>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
              <div>
                <span className="mb-1.5 block text-sm font-medium text-gray-700">
                  Puanın
                </span>
                <StarRating value={rating} onChange={setRating} size="lg" />
              </div>
              <Textarea label="Yorum (opsiyonel)" placeholder="Deneyimini anlat..." />
            </>
          )}

          <Button full type="submit">
            Gönder
          </Button>
        </form>
      </Card>

      <Card soft className="mt-4 flex items-start gap-3 p-4">
        <Icon name="wrench" size={19} className="mt-0.5 shrink-0 text-primary-600" />
        <p className="text-xs text-gray-500">
          Bir makinede arıza mı var? Makinenin üzerindeki <b>QR kodu</b> telefonunla
          okut; doğru makineye özel arıza bildirim formu açılır. Salonda aynı modelden
          birden fazla makine olabildiği için arıza yalnızca QR üzerinden bildirilir.
        </p>
      </Card>
    </div>
  );
}
