import { Task } from "@/types/task";

type Props = {
  task: Task | null;
  onClose: () => void;
};

//Task detail

export default function TaskDetailModal({ task, onClose }: Props) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <div className="mb-2 text-xs text-gray-400">
          {task.type} · {task.status}
        </div>

        <h2 className="mb-3 text-lg font-semibold">
            Title :
          [{task.type}] {task.title}
        </h2>

        <p className="text-sm text-gray-700 whitespace-pre-line">
          Description : 
          {task.description || "No description"}
        </p>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-black px-3 py-1 text-sm text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
