import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import route from "@/lib/route";
import Breadcrumbs from "@/components/Breadcrumbs";
import formatDateTime from "@/lib/date";

type Epic = {
  id: number;
  code: string | null;
  create_work: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  created_at?: string;
  updated_at?: string;
};

type Story = {
  id: number;
  epic_id: number;
  code: string | null;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  created_at?: string;
  updated_at?: string;
};

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: string;
}) {
  const styles: Record<string, string> = {
    LOW: "bg-green-300 text-gray-700",
    MEDIUM: "bg-orange-400 text-gray-800",
    HIGH: "bg-red-500 text-white",
    TODO: "bg-gray-300 text-gray-700",
    IN_PROGRESS: "bg-green-300 text-gray-800",
    DONE: "bg-green-600 text-white",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        styles[variant] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {children}
    </span>
  );
}

export default function EpicShow({
  epic,
  stories = [],
}: {
  epic: Epic;
  stories: Story[];
}) {
  const { auth }: any = usePage().props;
  const isPM = auth?.user?.role === "PM";

  // ===== FILTER (top-level hook) =====
  const [q, setQ] = useState("");
  const [priorityF, setPriorityF] = useState<"" | Story["priority"]>("");
  const [statusF, setStatusF] = useState<"" | Story["status"]>("");

  const filteredStories = useMemo(() => {
    const query = q.trim().toLowerCase();

    return stories.filter((s) => {
      const okQuery =
        !query ||
        s.title.toLowerCase().includes(query) ||
        (s.description ?? "").toLowerCase().includes(query) ||
        (s.code ?? "").toLowerCase().includes(query);

      const okPriority = !priorityF || s.priority === priorityF;
      const okStatus = !statusF || s.status === statusF;

      return okQuery && okPriority && okStatus;
    });
  }, [stories, q, priorityF, statusF]);

  // ===== Create Story =====
  const [openCreate, setOpenCreate] = useState(false);

  const createForm = useForm({
    code: "",
    title: "",
    description: "",
    priority: "MEDIUM" as Story["priority"],
    status: "TODO" as Story["status"],
  });

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();

    createForm.post(route("epics.stories.store", epic.id), {
      onSuccess: () => {
        createForm.reset();
        createForm.clearErrors();
        setOpenCreate(false);
      },
    });
  }

  // ===== Edit Story =====
  const [openEdit, setOpenEdit] = useState(false);

  const editForm = useForm({
    id: 0,
    code: "",
    title: "",
    description: "",
    priority: "MEDIUM" as Story["priority"],
    status: "TODO" as Story["status"],
  });

  function openEditModal(s: Story) {
    editForm.setData({
      id: s.id,
      code: s.code ?? "",
      title: s.title,
      description: s.description ?? "",
      priority: s.priority,
      status: s.status,
    } as any);

    editForm.clearErrors();
    setOpenEdit(true);
  }

  function submitEdit(e: React.FormEvent) {
    e.preventDefault();

    editForm.patch(route("stories.update", editForm.data.id), {
      onSuccess: () => {
        editForm.reset();
        editForm.clearErrors();
        setOpenEdit(false);
      },
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Stories</h2>

          <Breadcrumbs
            items={[
              { label: "Home", href: route("dashboard") },
              { label: "Epics", href: route("dashboard") },
              { label: "Stories" },
            ]}
          />
        </div>
      }
    >
      <Head title={`Stories - Epic #${epic.id}`} />

      <div className="space-y-4">
        {/* EPIC SUMMARY */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-semibold text-gray-900">
                {epic.create_work}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={epic.priority}>{epic.priority}</Badge>
                <Badge variant={epic.status}>{epic.status}</Badge>

                {epic.code ? (
                  <span className="text-sm text-gray-500">
                    Code:{" "}
                    <span className="font-medium text-gray-900">
                      {epic.code}
                    </span>
                  </span>
                ) : null}
              </div>

              {epic.updated_at ? (
                <div className="mt-3 text-sm text-gray-600">
                  Updated: {formatDateTime(epic.updated_at)}
                </div>
              ) : null}
            </div>

            <Link
              href={route("dashboard")}
              className="text-sm font-medium text-gray-700 hover:underline"
            >
              Back
            </Link>
          </div>
        </div>

        {/* STORIES TABLE */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900"></h3>

            {isPM && (
              <button
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 transition"
                onClick={() => setOpenCreate(true)}
              >
                + Create Story
              </button>
            )}
          </div>

          {/* FILTER BAR */}
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-55">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Search
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, description, code..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="min-w-40">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Priority
              </label>
              <select
                value={priorityF}
                onChange={(e) => setPriorityF(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">All</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>

            <div className="min-w-45">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Status
              </label>
              <select
                value={statusF}
                onChange={(e) => setStatusF(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">All</option>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setQ("");
                setPriorityF("");
                setStatusF("");
              }}
              className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>

            <div className="text-sm text-gray-500">
              {filteredStories.length} / {stories.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredStories.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{s.title}</div>
                      {s.description ? (
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {s.description}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">
                          No description
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={s.priority}>{s.priority}</Badge>
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={s.status}>{s.status}</Badge>
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {s.updated_at ? formatDateTime(s.updated_at) : "-"}
                    </td>

                    <td className="px-4 py-3 text-right space-x-3">
                      {isPM ? (
                        <button
                          type="button"
                          className="text-sm font-medium text-gray-700 hover:underline"
                          onClick={() => openEditModal(s)}
                        >
                          Edit
                        </button>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}

                      <button
                        type="button"
                        className="text-sm font-medium text-black hover:underline"
                        onClick={() => alert(`Task for Story #${s.id} (UI dulu)`)}
                      >
                        Task
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredStories.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-sm text-gray-500"
                    >
                      No results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE STORY MODAL */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenCreate(false)}
          />

          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">Create Story</h4>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setOpenCreate(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitCreate} className="space-y-4">
              <div>
                {/* <label className="text-sm font-medium text-gray-700">
                  Code (optional)
                </label> */}
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  value={createForm.data.code}
                  onChange={(e) => createForm.setData("code", e.target.value)}
                />
                {createForm.errors.code && (
                  <p className="mt-1 text-sm text-red-600">{createForm.errors.code}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  value={createForm.data.title}
                  onChange={(e) => createForm.setData("title", e.target.value)}
                />
                {createForm.errors.title && (
                  <p className="mt-1 text-sm text-red-600">{createForm.errors.title}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  rows={3}
                  value={createForm.data.description}
                  onChange={(e) => createForm.setData("description", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    value={createForm.data.priority}
                    onChange={(e) => createForm.setData("priority", e.target.value as any)}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    value={createForm.data.status}
                    onChange={(e) => createForm.setData("status", e.target.value as any)}
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="rounded-lg border px-4 py-2 text-sm text-gray-700"
                >
                  Cancel
                </button>

                <button
                  disabled={createForm.processing}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {createForm.processing ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STORY MODAL (punyamu tetap, nggak aku ubah isinya) */}
      {openEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenEdit(false)}
          />

          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">Edit Story</h4>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setOpenEdit(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                {/* <label className="text-sm font-medium text-gray-700">
                  Code (optional)
                </label> */}
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  value={editForm.data.code}
                  onChange={(e) => editForm.setData("code", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  value={editForm.data.title}
                  onChange={(e) => editForm.setData("title", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  rows={3}
                  value={editForm.data.description}
                  onChange={(e) => editForm.setData("description", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    value={editForm.data.priority}
                    onChange={(e) => editForm.setData("priority", e.target.value as any)}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    value={editForm.data.status}
                    onChange={(e) => editForm.setData("status", e.target.value as any)}
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenEdit(false)}
                  className="rounded-lg border px-4 py-2 text-sm text-gray-700"
                >
                  Cancel
                </button>

                <button
                  disabled={editForm.processing}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {editForm.processing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
