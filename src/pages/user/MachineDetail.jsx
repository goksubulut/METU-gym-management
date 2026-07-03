import { useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Modal from "../../components/Modal.jsx";
import StarRating from "../../components/StarRating.jsx";
import { Textarea, Select } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { machineById, MUSCLE_GROUPS } from "../../mock/machines.js";

export default function MachineDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const [params] = useSearchParams();
  const m = machineById(id);
  const [rating, setRating] = useState(0);
  // QR ile /machine/:id üzerinden gelindi mi? (arıza bildiriminin tek kanalı)
  const viaQR = location.pathname.startsWith("/machine/");
  // QR "?report=1" ile açılırsa arıza formu doğrudan açılır (makine zaten scope'lu).
  const [faultOpen, setFaultOpen] = useState(viaQR && params.get("report") === "1");

  if (!m)
    return <div className="p-8 text-center text-gray-400">Makine bulunamadı.</div>;

  return (
    <div className="pb-6">
      {/* Video / medya alanı */}
      <div className="relative grid h-56 place-items-center bg-gradient-to-br from-primary-100 to-primary-200">
        <button
          onClick={() => nav(-1)}
          className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-gray-700 shadow"
        >
          ←
        </button>
        {m.hasVideo ? (
          <div className="flex flex-col items-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-2xl text-primary-600 shadow-lg">
              ▶
            </div>
            <span className="mt-2 text-xs font-semibold text-primary-800">
              Kullanım videosu
            </span>
          </div>
        ) : (
          <span className="text-6xl">🏋️</span>
        )}
      </div>

      <div className="px-4 py-4">
        {viaQR && (
          <Card soft className="mb-3 flex items-center gap-2 p-3">
            <span className="text-base">📷</span>
            <p className="text-xs text-gray-600">
              Bu sayfa <b>makine QR kodu</b> ile açıldı. Arıza bildirimi bu makineye
              ({m.location}) özel olarak gönderilir.
            </p>
          </Card>
        )}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{m.name}</h1>
            <p className="text-sm text-gray-400">{m.category} · {m.location}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold text-primary-600">★ {m.rating}</p>
            <p className="text-[10px] text-gray-400">{m.reviews} değerlendirme</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {m.muscles.map((mus) => (
            <Badge key={mus} tone="primary">
              {MUSCLE_GROUPS.find((x) => x.id === mus)?.label}
            </Badge>
          ))}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-600">{m.description}</p>

        <Card soft className="mt-4 flex gap-3 p-4">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-sm font-bold text-gray-900">İpucu</p>
            <p className="text-sm text-gray-600">{m.tips}</p>
          </div>
        </Card>

        {/* Kullanıcı puanlama */}
        <Card className="mt-4 p-4 text-center">
          <p className="mb-2 text-sm font-bold text-gray-900">Bu makineyi puanla</p>
          <StarRating value={rating} onChange={setRating} size="lg" />
          {rating > 0 && (
            <Button
              size="sm"
              className="mt-3"
              onClick={() => {
                toast("Puanın kaydedildi ⭐", "success");
                setRating(0);
              }}
            >
              Gönder
            </Button>
          )}
        </Card>

        {/* Aksiyonlar — kullanıcı tarafından tetiklenir */}
        <div className="mt-5 space-y-2">
          <Button
            variant="secondary"
            full
            onClick={() => nav(`/alternatives/${m.id}`)}
          >
            🔄 Bu makine dolu, alternatif göster
          </Button>
          <Button variant="danger" full onClick={() => setFaultOpen(true)}>
            🔧 Arıza Bildir
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-gray-400">
          Alternatif önerisi yalnızca sen dolu bulduğunda gösterilir; sistem otomatik
          bildirim göndermez.
        </p>
      </div>

      <Modal
        open={faultOpen}
        onClose={() => setFaultOpen(false)}
        title="Arıza Bildir"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFaultOpen(false)}>
              Vazgeç
            </Button>
            <Button
              onClick={() => {
                setFaultOpen(false);
                toast("Arıza bildirimin alındı 🔧", "success");
              }}
            >
              Gönder
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            <b>{m.name}</b> için arıza detayını gir.
          </p>
          <Select label="Öncelik" defaultValue="medium">
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek (kullanılamaz)</option>
          </Select>
          <Textarea label="Açıklama" placeholder="Sorunu kısaca anlat..." />
        </div>
      </Modal>
    </div>
  );
}
