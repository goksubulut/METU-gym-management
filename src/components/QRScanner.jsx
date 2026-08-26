import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import jsQR from "jsqr";
import Icon from "./Icon.jsx";

export default function QRScanner({ onResult, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    function stopCamera() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }

    function tick() {
      if (!active) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code && code.data) {
        active = false;
        stopCamera();
        onResult(code.data);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.play().then(() => {
          if (active) {
            setReady(true);
            tick();
          }
        });
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err.name === "NotAllowedError"
            ? "Kamera iznini etkinleştirmek için uygulama ayarlarını kontrol et."
            : "Kamera açılamadı. Lütfen tekrar dene.",
        );
      });

    return () => {
      active = false;
      stopCamera();
    };
  }, [onResult]);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pb-3 pt-safe-top pt-5">
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white active:scale-95 transition-transform"
        >
          <Icon name="chevronLeft" size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold text-white">QR Kodu Tara</h1>
          <p className="text-xs text-white/50">Makine üzerindeki QR'ı çerçeveye getir</p>
        </div>
      </div>

      {/* Camera area */}
      <div className="relative flex-1 overflow-hidden">
        {error ? (
          <div className="flex h-full items-center justify-center px-8 text-center">
            <div>
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/10">
                <Icon name="camera" size={28} className="text-white/50" />
              </div>
              <p className="text-sm font-semibold text-white/80">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Live camera feed */}
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
            />

            {/* Dark overlay + viewfinder */}
            {ready && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {/* Viewfinder box — box-shadow creates the dark surround */}
                <div
                  className="relative h-64 w-64 rounded-2xl"
                  style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.58)" }}
                >
                  {/* Corner markers */}
                  <span className="absolute left-0 top-0 h-9 w-9 rounded-tl-xl border-l-[3px] border-t-[3px] border-primary-600" />
                  <span className="absolute right-0 top-0 h-9 w-9 rounded-tr-xl border-r-[3px] border-t-[3px] border-primary-600" />
                  <span className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-xl border-b-[3px] border-l-[3px] border-primary-600" />
                  <span className="absolute bottom-0 right-0 h-9 w-9 rounded-br-xl border-b-[3px] border-r-[3px] border-primary-600" />

                  {/* Scan line */}
                  <div className="animate-qr-scan absolute left-3 right-3 h-[2px] rounded-full bg-glow shadow-[0_0_6px_rgb(var(--glow)/0.8)]" />
                </div>
              </div>
            )}

            {/* Loading pulse while camera initializes */}
            {!ready && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-primary-600" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom hint */}
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-white/50">
          Makine bilgisi, kullanım videosu ve arıza bildirimi için QR'ı oku
        </p>
      </div>

      {/* Hidden canvas for jsQR decoding */}
      <canvas ref={canvasRef} className="hidden" />
    </div>,
    document.body,
  );
}
