import { useState } from "react";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Tabs from "../../components/Tabs.jsx";
import Icon from "../../components/Icon.jsx";
import StarRating from "../../components/StarRating.jsx";
import RatingTagPicker from "../../components/RatingTagPicker.jsx";
import { Textarea, Select } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { useNavigate } from "react-router-dom";
import { machines } from "../../mock/machines.js";
import { getAccessToken } from "../../api/client.js";
import { createRating, createSuggestion } from "../../api/feedback.js";

const TABS = [
  { value: "suggest", label: "Öneri / Şikayet" },
  { value: "rate", label: "Puanla" },
];

export default function Feedback() {
  const [tab, setTab] = useState("suggest");
  const [rating, setRating] = useState(0);
  const [ratingTags, setRatingTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!getAccessToken()) {
      toast("Geri bildirim için giriş yapmalısın", "error");
      nav("/auth");
      return;
    }

    const form = e.target;
    setSubmitting(true);
    try {
      if (tab === "rate") {
        const machineId = form.machineId.value;
        if (!machineId || rating === 0) {
          toast("Makine ve puan gerekli", "error");
          return;
        }
        await createRating(machineId, rating, ratingTags);
      } else {
        const type = form.type.value;
        const tag = form.tag.value;
        const text = form.text.value;
        await createSuggestion(type, tag, text);
      }
      toast("Geri bildirimin gönderildi", "success");
      setRating(0);
      setRatingTags([]);
      form.reset();
    } catch (err) {
      toast(err.message ?? "Gönderilemedi", "error");
    } finally {
      setSubmitting(false);
    }
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
              <Select name="type" label="Tür" defaultValue="Öneri">
                <option>Öneri</option>
                <option>Şikayet</option>
              </Select>
              <Select name="tag" label="Konu" defaultValue="Ekipman">
                <option>Ekipman</option>
                <option>Temizlik</option>
                <option>Personel</option>
                <option>Uygulama</option>
                <option>Diğer</option>
              </Select>
              <Textarea name="text" label="Mesajın" placeholder="Görüşünü yaz..." required />
            </>
          )}

          {tab === "rate" && (
            <>
              <Select name="machineId" label="Makine" defaultValue="" required>
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
              {rating > 0 && (
                <RatingTagPicker selected={ratingTags} onChange={setRatingTags} />
              )}
            </>
          )}

          <Button
            full
            type="submit"
            disabled={submitting || (tab === "rate" && rating === 0)}
          >
            {submitting ? "Gönderiliyor…" : "Gönder"}
          </Button>
        </form>
      </Card>

      <Card soft className="mt-4 flex items-start gap-3 p-4">
        <Icon name="wrench" size={19} className="mt-0.5 shrink-0 text-primary-600" />
        <p className="text-xs text-gray-500">
          Bir makinede arıza mı var? Makinenin üzerindeki <b>QR kodu</b> telefonunla
          okut; doğru makineye özel arıza bildirim formu açılır.
        </p>
      </Card>
    </div>
  );
}
