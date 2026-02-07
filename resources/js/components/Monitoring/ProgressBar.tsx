type ProgressStatus = {
  id: number | null;
  name: string;
  color?: string | null;
  is_done?: boolean | null;
  count: number;
};

type Progress = {
  total: number;
  done?: number;
  open?: number;
  by_status?: ProgressStatus[];
};

function isDark(hex: string) {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l < 0.55;
}

export default function ProgressBar({
  progress,
  title = "Progress",
  unitLabel = "Items",
}: {
  progress: Progress;
  title?: string;
  unitLabel?: string;
}) {
  const total = Number(progress?.total ?? 0);

  if (!progress || total <= 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border text-sm text-gray-500">
        No data
      </div>
    );
  }

  const done = Number(progress?.done ?? 0);
  const open =
    typeof progress?.open === "number" ? Number(progress.open) : Math.max(0, total - done);

  const byStatus = (progress.by_status ?? []).filter((s) => Number(s?.count ?? 0) > 0);

  // ✅ fallback jika belum ada by_status
  const items: ProgressStatus[] =
    byStatus.length > 0
      ? byStatus
      : [
          { id: null, name: "Open", color: "#9CA3AF", is_done: false, count: open },
          { id: -1, name: "Done", color: "#111827", is_done: true, count: done },
        ];

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center justify-between mb-2 text-sm font-medium text-gray-700">
        <span>{title}</span>
        <span>
          {total} {unitLabel}
        </span>
      </div>

      {/* BAR */}
      <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-200">
        {items.map((i) => {
          const w = total > 0 ? (i.count / total) * 100 : 0;
          const bg = i.color ?? "#9CA3AF";
          return (
            <div
              key={`${i.id ?? "null"}-${i.name}`}
              className="h-full"
              style={{ width: `${w}%`, backgroundColor: bg }}
              title={`${i.name}: ${i.count}`}
            />
          );
        })}
      </div>

      {/* LEGEND */}
      <div
        className={`mt-3 grid gap-3 text-xs`}
        style={{
          gridTemplateColumns: items.length >= 4 ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
        }}
      >
        {items.map((i) => {
          const bg = i.color ?? "#9CA3AF";
          return (
            <div key={`${i.id ?? "null"}-legend-${i.name}`} className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded shrink-0"
                style={{ backgroundColor: bg }}
              />
              <span className="text-gray-600 truncate" title={i.name}>
                {i.name}: <b className="text-gray-900">{i.count}</b>
              </span>
            </div>
          );
        })}
      </div>

      {/* OPTIONAL summary */}
      <div className="mt-3 text-xs text-gray-600">
        Done: <b className="text-gray-900">{done}</b> • Open: <b className="text-gray-900">{open}</b>
      </div>
    </div>
  );
}
