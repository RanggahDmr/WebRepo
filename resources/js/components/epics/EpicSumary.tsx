import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";
import { Epic } from "@/types/epic";

export default function EpicSummary({ epic }: { epic: Epic }) {
  // ambil dari master relation dulu (custom)

  console.log("[EpicSummary] ids", {
  priority_id: (epic as any).priority_id,
  status_id: (epic as any).status_id,
});

console.log("[EpicSummary] masters", {
  priorityMaster: (epic as any).priorityMaster,
  statusMaster: (epic as any).statusMaster,
});

console.log("[EpicSummary] legacy", {
  priority: (epic as any).priority,
  status: (epic as any).status,
});

  const priorityLabel =
    (epic as any).priorityMaster?.name ?? (epic as any).priority ?? "-";
  const statusLabel =
    (epic as any).statusMaster?.name ?? (epic as any).status ?? "-";

  const priorityColor = (epic as any).priorityMaster?.color ?? null;
  const statusColor = (epic as any).statusMaster?.color ?? null;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-6">
        {/* LEFT */}
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <div className="text-xl font-semibold text-gray-900">{epic.title}</div>

            {(epic as any).code && (
              <span className="text-sm font-medium text-gray-900">
                #{(epic as any).code}
              </span>
            )}
          </div>

          {(epic as any).description && (
            <p className="mt-2 text-gray-900">{(epic as any).description}</p>
          )}

          <div className="mt-4 flex items-start gap-6">
            <div>
              <div className="mb-1 text-xs text-gray-500">Priority</div>
              <Badge variant={priorityLabel} color={priorityColor}>
                {priorityLabel}
              </Badge>
            </div>

            <div>
              <div className="mb-1 text-xs text-gray-500">Status</div>
              <Badge variant={statusLabel} color={statusColor}>
                {statusLabel}
              </Badge>
            </div>
          </div>

          <div className="mt-4 space-y-1 text-sm text-gray-600">
            {(epic as any).created_at && (
              <div>Created: {formatDateTime((epic as any).created_at)}</div>
            )}
            {(epic as any).updated_at && (
              <div>Updated: {formatDateTime((epic as any).updated_at)}</div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Epic by: {(epic as any).creator?.name ?? "-"}
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-sm text-gray-600 hover:text-gray-900 hover:underline whitespace-nowrap"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
