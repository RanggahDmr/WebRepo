import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";

type Props = {
  epic: any | null;
  onClose?: () => void;
};

function shortUuid(u?: string) {
  if (!u) return "-";
  return u.slice(0, 8).toUpperCase();
}

export default function EpicDetailCard({ epic, onClose }: Props) {
  if (!epic) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">Epic Detail</div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Klik epic di table untuk lihat detail di sini.
        </div>

        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
          No epic selected.
        </div>
      </div>
    );
  }

  const epicCode = epic.code ?? `EPC-${shortUuid(epic.uuid)}`;
  const boardTitle = epic.board?.title ?? "-";
  const squadCode = epic.board?.uuid ?? "-";

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm border">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-gray-500">{epicCode}</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 break-words">
            {epic.title ?? "-"}
          </div>
          <div className="mt-1 text-sm text-gray-900 break-words">
            {epic.description ?? "-"}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>
        )}
      </div>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap gap-2">
        {epic.priority ? <Badge variant={epic.priority}>{epic.priority}</Badge> : null}
        {epic.status ? <Badge variant={epic.status}>{epic.status}</Badge> : null}
      </div>

      {/* Context */}
      <div className="mt-4 space-y-3">
        <div className="rounded-md bg-gray-50 p-3">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            Context
          </div>

          <div className="mt-2">
            <div className="text-xs text-gray-500">Board</div>
            <div className="mt-0.5 text-sm font-medium text-gray-900 break-words">
              {boardTitle !== "-" ? `${boardTitle} (${squadCode})` : "-"}
            </div>
          </div>
        </div>

        {/* People + Dates */}
        <div className="rounded-md bg-gray-50 p-3">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            People
          </div>

          <div className="mt-2 text-sm text-gray-900">
            <div>
              <span className="text-xs text-gray-500">Created by:</span>{" "}
              <span className="font-medium">{epic.creator?.name ?? "-"}</span>
            </div>

            <div className="mt-1">
              <span className="text-xs text-gray-500">Role:</span>{" "}
              <span className="font-medium">{epic.creator?.role ?? "-"}</span>
            </div>
          </div>

          <div className="mt-4 text-[11px] uppercase tracking-wide text-gray-500">
            Dates
          </div>

          <div className="mt-2 text-sm text-gray-900">
            <div>
              <span className="text-xs text-gray-500">Created:</span>{" "}
              <span className="font-medium">
                {epic.created_at ? formatDateTime(epic.created_at) : "-"}
              </span>
            </div>

            <div className="mt-1">
              <span className="text-xs text-gray-500">Updated:</span>{" "}
              <span className="font-medium">
                {epic.updated_at ? formatDateTime(epic.updated_at) : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
