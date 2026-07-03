import Icon from "./Icon.jsx";

export default function EmptyState({ icon = "inbox", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary-50 text-primary-500">
        <Icon name={icon} size={26} strokeWidth={1.6} />
      </div>
      <p className="text-base font-semibold text-gray-800">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
