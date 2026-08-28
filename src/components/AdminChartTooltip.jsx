// METU MOTION — Admin grafikleri için editoryal tooltip.
//
// Recharts'ın default beyaz kutusu yerine: koyu frosted kart, ince hairline,
// kategori etiketi üstte (muted), seri adı + değer altta. Aksan noktası admin
// kırmızısı (#AD2A37). Zeminle (aurora) uyumlu, sakin, editoryal.
//
// Recharts tooltip içeriği normal HTML'dir → CSS değişkenleri/utility'ler çalışır.

export default function AdminChartTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-2xl border px-3.5 py-2.5 shadow-pop"
      style={{
        background: "rgb(var(--ink-950) / 0.82)",
        borderColor: "rgb(255 255 255 / 0.1)",
        backdropFilter: "blur(14px) saturate(150%)",
        WebkitBackdropFilter: "blur(14px) saturate(150%)",
        minWidth: 128,
      }}
    >
      {label != null && label !== "" && (
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: p.color || "rgb(var(--admin-red))" }}
            />
            <span className="text-content/70">{p.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-content">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
