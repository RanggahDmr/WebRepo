import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";

type Props = {
  story: any | null;
  onClose?: () => void;
};

function shortUuid(u?: string) {
  if (!u) return "-";
  return u.slice(0, 8).toUpperCase();
}

export default function StoryDetailCard({ story, onClose }: Props) {
  if (!story) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">Story Detail</div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Klik story di table untuk lihat detail di sini.
        </div>

        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
          No story selected.
        </div>
      </div>
    );
  }

  const epic = story.epic;
  const board = story.epic?.board;

  const storyCode = story.code ?? `STR-${shortUuid(story.uuid)}`;
  const epicTitle = epic?.title ?? "-";
  const epicCode = epic?.code ?? "-";

  const boardTitle = board?.title ?? "-";
  const squadCode = board?.squad_code ?? "-";

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm border">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-gray-500">{storyCode}</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 break-words">
            {story.title ?? "-"}
          </div>
          <div className="mt-1 text-sm text-gray-900 break-words">
            {story.description ?? "-"}
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
        {story.priority ? <Badge variant={story.priority}>{story.priority}</Badge> : null}
        {story.status ? <Badge variant={story.status}>{story.status}</Badge> : null}
      </div>

      {/* Context */}
      <div className="mt-4 space-y-3">
        <div className="rounded-md bg-gray-50 p-3">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            Context
          </div>

          <div className="mt-2">
            <div className="text-xs text-gray-500">Epic</div>
            <div className="mt-0.5 text-sm font-medium text-gray-900 break-words">
              {epic ? `${epicCode} — ${epicTitle}` : "-"}
            </div>
          </div>

          <div className="mt-3">
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
              <span className="font-medium">{story.creator?.name ?? "-"}</span>
            </div>

            <div className="mt-1">
              <span className="text-xs text-gray-500">Role:</span>{" "}
              <span className="font-medium">{story.creator?.role ?? "-"}</span>
            </div>
          </div>

          <div className="mt-4 text-[11px] uppercase tracking-wide text-gray-500">
            Dates
          </div>

          <div className="mt-2 text-sm text-gray-900">
            <div>
              <span className="text-xs text-gray-500">Created:</span>{" "}
              <span className="font-medium">
                {story.created_at ? formatDateTime(story.created_at) : "-"}
              </span>
            </div>

            <div className="mt-1">
              <span className="text-xs text-gray-500">Updated:</span>{" "}
              <span className="font-medium">
                {story.updated_at ? formatDateTime(story.updated_at) : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
