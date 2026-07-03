export default function Spinner({ label = "Yükleniyor..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-600" />
      <p className="mt-3 text-sm text-gray-400">{label}</p>
    </div>
  );
}
