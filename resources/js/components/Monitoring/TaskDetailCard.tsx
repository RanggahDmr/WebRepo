import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";

type Props = {
  task: any | null;
  onClose?: () => void;
};

function fallbackCode(prefix: string, n?: number, pad = 4) {
  if (!n && n !== 0) return "-";
  return `${prefix}-${String(n).padStart(pad, "0")}`;
}

export default function TaskDetailCard({ task, onClose }: Props) {
  if (!task) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">Task Detail</div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Klik task di table / kanban untuk lihat detail di sini.
        </div>

        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
          No task selected.
        </div>
      </div>
    );
  }

  const story = task.story;
  const epic = task.story?.epic;

  const taskCode = fallbackCode("TSK", task.id);
const epicTitle = epic?.create_work ?? "-";   // <-- penting: epics pakai create_work
const storyTitle = story?.title ?? "-";

const epicCode = epic?.code ?? "-";
const storyCode = story?.code ?? "-";

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm border">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        
        <div className="min-w-0">
          <div className="text-xs font-medium text-gray-500">{taskCode}</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 break-words">
            {task.title ?? "-"}
          </div>
          <div className="mt-1 text-sm  text-gray-900 break-words">
            {task.description}
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
        {task.priority ? (
          <Badge variant={task.priority}>{task.priority}</Badge>
        ) : null}

        {task.status ? <Badge variant={task.status}>{task.status}</Badge> : null}

        {task.type ? <Badge variant={task.type}>{task.type}</Badge> : null}
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
              {epic ? `${epicCode} — ${epicTitle ?? "-"}` : "-"}
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs text-gray-500">Story</div>
            <div className="mt-0.5 text-sm font-medium text-gray-900 break-words">
              {story ? `${storyCode} — ${story.title ?? "-"}` : "-"}
            </div>
          </div>
        </div>

        {/* People */}
        <div className="rounded-md bg-gray-50 p-3">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            People
          </div>

          <div className="mt-2 text-sm text-gray-900">
            <div>
              <span className="text-xs text-gray-500">Created by:</span>{" "}
              <span className="font-medium">{task.creator?.name ?? "-"}</span>
            </div>

            <div className="mt-1">
              <span className="text-xs text-gray-500">Assignee:</span>{" "}
              <span className="font-medium">{task.assignee?.name ?? "-"}</span>
            </div>
          </div>
        

        {/* Dates */}
        
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            Dates
          </div>

          <div className="mt-2 text-sm text-gray-900">
            <div>
              <span className="text-xs text-gray-500">Created:</span>{" "}
              <span className="font-medium">
                {task.created_at ? formatDateTime(task.created_at) : "-"}
              </span>
            </div>

            <div className="mt-1">
              <span className="text-xs text-gray-500">Updated:</span>{" "}
              <span className="font-medium">
                {task.updated_at ? formatDateTime(task.updated_at) : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
      
      </div>
    </div>
  );
}
