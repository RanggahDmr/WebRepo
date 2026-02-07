import { router, usePage } from "@inertiajs/react";
import route from "@/lib/route";

type Props = {
  open: boolean;
  onClose: () => void;
  storyUuid: string;
};

export default function CreateTaskModal({ open, onClose, storyUuid }: Props) {
  const { taskPriorities = [] }: any = usePage().props;

  if (!open) return null;

  const defaultPriorityId =
    taskPriorities.find((p: any) => p.is_default)?.id ?? taskPriorities[0]?.id ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Create Task</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = new FormData(form);

           router.post(
  route("tasks.store", { story: storyUuid }),
  Object.fromEntries(data),
  {
    preserveScroll: true,
    onSuccess: () => {
      //  ambil props terbaru dari server (tasks + masters)
      router.reload({ only: ["tasks", "taskStatuses", "taskPriorities"] });
      onClose();
    },
  }
);
          }}
          className="space-y-3"
        >
          {/* PRIORITY (master) */}
          <select
            name="priority_id"
            className="w-full rounded border px-3 py-2 text-sm"
            defaultValue={String(defaultPriorityId)}
            required
            disabled={!taskPriorities.length}
            title={!taskPriorities.length ? "No priorities configured for this board" : ""}
          >
            {!taskPriorities.length ? (
              <option value="">No priorities</option>
            ) : (
              taskPriorities.map((p: any) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))
            )}
          </select>

          <input
            name="title"
            placeholder="Task title"
            className="w-full rounded border px-3 py-2 text-sm"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            className="w-full rounded border px-3 py-2 text-sm"
            rows={4}
          />

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-3 py-1 text-sm text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
              disabled={!taskPriorities.length}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
