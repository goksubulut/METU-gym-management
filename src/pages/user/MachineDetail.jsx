import { useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Icon from "../../components/Icon.jsx";
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
      <div className="hero-sheen relative grid h-56 place-items-center bg-gray-900 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950">
        <button
          onClick={() => nav(-1)}
          className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-700 shadow"
          aria-label="Geri"
        >
          <Icon name="chevronRight" size={17} className="rotate-180" />
        </button>
        {m.hasVideo ? (
          <div className="flex flex-col items-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-primary-600 shadow-glow">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8.5 6.5v11l9-5.5z" />
              </svg>
            </div>
            <span className="mt-2 text-xs font-semibold text-white/70">
              Kullanım videosu
            </span>
          </div>
        ) : (
          <Icon name="dumbbell" size={56} strokeWidth={1.2} className="text-white/60" />
        )}
      </div>

      <div className="px-4 py-4">
        {viaQR && (
          <Card soft className="mb-3 flex items-center gap-2.5 p-3">
            <Icon name="qr" size={18} className="shrink-0 text-primary-600" />
            <p className="text-xs text-gray-600">
              Bu sayfa <b>makine QR kodu</b> ile açıldı. Arıza bildirimi bu makineye
              ({m.location}) özel olarak gönderilir.
            </p>
          </Card>
        )}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-gray-900">{m.name}</h1>
            <p className="text-sm text-gray-400">{m.category} · {m.location}</p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 text-lg font-extrabold text-primary-600">
              <Icon name="star" size={16} className="fill-primary-600" /> {m.rating}
            </p>
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
          <Icon name="bulb" size={20} className="mt-0.5 shrink-0 text-primary-600" />
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
                toast("Puanın kaydedildi", "success");
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
            <Icon name="refresh" size={17} /> Bu makine dolu, alternatif göster
          </Button>
          <Button variant="danger" full onClick={() => setFaultOpen(true)}>
            <Icon name="wrench" size={17} /> Arıza Bildir
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
                toast("Arıza bildirimin alındı", "success");
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
