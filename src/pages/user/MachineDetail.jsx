import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import Icon from "../../components/Icon.jsx";
import Modal from "../../components/Modal.jsx";
import StarRating from "../../components/StarRating.jsx";
import RatingTagPicker from "../../components/RatingTagPicker.jsx";
import { Textarea, Select } from "../../components/Input.jsx";
import { useToast } from "../../components/Toast.jsx";
import { machineById, MUSCLE_GROUPS } from "../../mock/machines.js";
import { getAccessToken } from "../../api/client.js";
import { createFault, createRating } from "../../api/feedback.js";
import { fetchMachine } from "../../api/catalog.js";

export default function MachineDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const [params] = useSearchParams();
  // Önce mock'tan (anında render), sonra API'den güncel veriyle tazelenir.
  const [m, setM] = useState(() => machineById(id));
  const [rating, setRating] = useState(0);
  const [ratingTags, setRatingTags] = useState([]);
  const [faultOpen, setFaultOpen] = useState(location.pathname.startsWith("/machine/") && params.get("report") === "1");
  const [faultSeverity, setFaultSeverity] = useState("medium");
  const [faultDesc, setFaultDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const viaQR = location.pathname.startsWith("/machine/");

  useEffect(() => {
    fetchMachine(id)
      .then(setM)
      .catch(() => {});
  }, [id]);

  if (!m)
    return <div className="p-8 text-center text-gray-400">Makine bulunamadı.</div>;

  const requireAuth = () => {
    if (!getAccessToken()) {
      toast("Bu işlem için giriş yapmalısın", "error");
      nav("/auth");
      return false;
    }
    return true;
  };

  const submitRating = async () => {
    if (!requireAuth()) return;
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await createRating(m.id, rating, ratingTags);
      toast("Puanın kaydedildi", "success");
      setRating(0);
      setRatingTags([]);
    } catch (err) {
      toast(err.message ?? "Puan kaydedilemedi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const submitFault = async () => {
    if (!requireAuth()) return;
    if (faultDesc.trim().length < 5) {
      toast("Açıklama en az 5 karakter olmalı", "error");
      return;
    }
    setSubmitting(true);
    try {
      await createFault(m.id, faultDesc.trim(), faultSeverity);
      setFaultOpen(false);
      setFaultDesc("");
      toast("Arıza bildirimin alındı", "success");
    } catch (err) {
      toast(err.message ?? "Arıza bildirilemedi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-6">
      <div className="hero-sheen relative grid h-56 place-items-center overflow-hidden bg-gray-900 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950">
        {m.photoUrl && (
          <>
            <img src={m.photoUrl} alt={m.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/25 to-transparent" />
          </>
        )}
        <button
          onClick={() => nav(-1)}
          className="absolute left-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-700 shadow"
          aria-label="Geri"
        >
          <Icon name="chevronRight" size={17} className="rotate-180" />
        </button>
        {m.hasVideo ? (
          <div className="relative z-10 flex flex-col items-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-primary-600 shadow-glow">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8.5 6.5v11l9-5.5z" />
              </svg>
            </div>
            <span className="mt-2 text-xs font-semibold text-white/70">Kullanım videosu</span>
          </div>
        ) : !m.photoUrl ? (
          <Icon name="dumbbell" size={56} strokeWidth={1.2} className="text-white/60" />
        ) : null}
      </div>

      <div className="px-4 py-4">
        {viaQR && (
          <Card soft className="mb-3 flex items-center gap-2.5 p-3">
            <Icon name="qr" size={18} className="shrink-0 text-primary-600" />
            <p className="text-xs text-gray-600">
              Bu sayfa <b>makine QR kodu</b> ile açıldı. Arıza bildirimi bu makineye ({m.location}) özel gönderilir.
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

        <Card className="mt-4 p-4">
          <p className="mb-2 text-center text-sm font-bold text-gray-900">Bu makineyi puanla</p>
          <div className="flex justify-center">
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
          {rating > 0 && (
            <div className="mt-4">
              <RatingTagPicker selected={ratingTags} onChange={setRatingTags} />
              <Button
                size="sm"
                full
                className="mt-4"
                disabled={submitting || rating === 0}
                onClick={submitRating}
              >
                {submitting ? "Kaydediliyor…" : "Gönder"}
              </Button>
            </div>
          )}
        </Card>

        <div className="mt-5 space-y-2">
          <Button variant="secondary" full onClick={() => nav(`/alternatives/${m.id}`)}>
            <Icon name="refresh" size={17} /> Bu makine dolu, alternatif göster
          </Button>
          <Button variant="danger" full onClick={() => setFaultOpen(true)}>
            <Icon name="wrench" size={17} /> Arıza Bildir
          </Button>
        </div>
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
            <Button onClick={submitFault} disabled={submitting}>
              {submitting ? "Gönderiliyor…" : "Gönder"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            <b>{m.name}</b> için arıza detayını gir.
          </p>
          <Select
            label="Öncelik"
            value={faultSeverity}
            onChange={(e) => setFaultSeverity(e.target.value)}
          >
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek (kullanılamaz)</option>
          </Select>
          <Textarea
            label="Açıklama"
            placeholder="Sorunu kısaca anlat..."
            value={faultDesc}
            onChange={(e) => setFaultDesc(e.target.value)}
            required
          />
        </div>
      </Modal>
    </div>
  );
}
