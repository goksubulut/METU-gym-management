import Icon from "./Icon.jsx";

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  if (!open) return null;
  const width = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full ${width} rounded-2xl bg-white shadow-pop`}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="font-display text-lg font-bold tracking-tight text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
