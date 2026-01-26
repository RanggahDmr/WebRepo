import { Task } from "@/types/task";
import Badge from "@/components/ui/Badge";

type Props = {
  task: Task;
  onClose: () => void;
};

function formatTaskCode(id: number) {
  return `TSK-${String(id).padStart(4, "0")}`;
}

export default function TaskDetailModal({ task, onClose }: Props) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Task Detail — {formatTaskCode(task.id)}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="space-y-4 text-sm">
          <div>
            <div className="text-gray-500">Title</div>
            <div className="font-medium">{task.title}</div>
          </div>

          <div>
            <div className="text-gray-500">Description</div>
            <div className="font-medium whitespace-pre-line">
              {task.description ?? "-"}
            </div>
          </div>

          <div className="flex gap-6">
            <div>
              <div className="text-gray-500">Status</div>
              <div className="mt-1">
                <Badge variant={task.status}>{task.status}</Badge>
              </div>
            </div>

            <div>
              <div className="text-gray-500">Priority</div>
              <div className="mt-1">
                <Badge variant={task.priority}>
                  {task.priority}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <div className="text-gray-500">Created by</div>
            <div className="font-medium">
              {task.creator?.name ?? "-"}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="rounded bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
