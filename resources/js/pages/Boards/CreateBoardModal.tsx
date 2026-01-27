import { router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import route from "@/lib/route";

type UserOption = {
  id: number;
  name: string;
  role: "PM" | "SAD" | "PROGRAMMER";
};

export default function CreateBoardModal({
  open,
  onClose,
  users,
}: {
  open: boolean;
  onClose: () => void;
  users: UserOption[];
}) {
  const { auth, errors }: any = usePage().props;
  const isPM = auth?.user?.role === "PM";

  const [title, setTitle] = useState("");
  const [members, setMembers] = useState<number[]>([]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setMembers([]);
    }
  }, [open]);

  if (!open) return null;

  const toggleMember = (id: number) => {
    setMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPM) return;

    router.post(
      route("boards.store"),
      { title, members },
      {
        preserveScroll: true,
        onSuccess: () => onClose(),
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

            {/* Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Members (optional)
              </label>

              <div className="mt-2 max-h-40 space-y-2 overflow-auto rounded-md border p-3">
                {users?.length ? (
                  users.map((u) => (
                    <label key={u.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={members.includes(u.id)}
                        onChange={() => toggleMember(u.id)}
                      />
                      <span className="text-gray-900">{u.name}</span>
                      <span className="text-gray-400">({u.role})</span>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">No users found.</div>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Creator will be added automatically.
              </div>
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
