import { router } from "@inertiajs/react";
import route from "@/lib/route";

type Props = {
  open: boolean;
  onClose: () => void;
  storyUuid: string;
};

export default function CreateTaskModal({ open, onClose, storyUuid }: Props) {
  if (!open) return null;

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
              { onSuccess: onClose, preserveScroll: true }
            );
          }}
          className="space-y-3"
        >
          <select
            name="priority"
            className="w-full rounded border px-3 py-2 text-sm"
            defaultValue="MEDIUM"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
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
              className="rounded bg-black px-3 py-1 text-sm text-white"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
