import { router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import route from "@/lib/route";

export default function CreateBoardModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { auth, errors }: any = usePage().props;
  const isPM = auth?.user?.role === "PM";

  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!open) setTitle("");
  }, [open]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPM) return;

    router.post(
      route("boards.store"),
      { title },
      {
        preserveScroll: true,
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
        aria-label="Close modal"
      />

      {/* modal */}
      <div className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">Add Squad</div>
            <div className="text-sm text-gray-500">
              Create a new board for a squad/team.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {!isPM ? (
          <div className="mt-4 rounded-md border bg-gray-50 p-3 text-sm text-gray-600">
            Only PM can create a squad.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Squad title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
                placeholder="e.g. Squad Alpha"
                autoFocus
              />
              {errors?.title ? (
                <div className="mt-1 text-xs text-red-600">{errors.title}</div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
