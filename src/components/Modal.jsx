import Icon from "./Icon.jsx";

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  if (!open) return null;
  const width = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel ekrana sığar: başlık ve alt bar sabit kalır, uzun içerik kendi
          içinde kayar. Aksi halde uzun listeler (ör. matris kadran modalı)
          dikey olarak taşıp ekrandan çıkıyordu. */}
      <div
        className={`relative flex max-h-[calc(100dvh-2rem)] w-full ${width} flex-col animate-pop rounded-2xl border border-hairline bg-surface shadow-pop`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-hairline px-6 py-4">
          <h3 className="font-display text-lg font-bold tracking-tight text-content">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-content"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 text-content">
          {children}
        </div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-3 border-t border-hairline px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
