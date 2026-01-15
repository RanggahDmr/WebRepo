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
  updated_at: string;
  created_at: string;
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
    MEDIUM: "bg-gray-200 text-gray-800",
    HIGH: "bg-red-500 text-white",
    TODO: "bg-gray-300 text-gray-700",
    IN_PROGRESS: "bg-green-300 text-gray-800",
    DONE: "bg-black text-white",
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

export default function Dashboard({ epics = [] }: { epics: Epic[] }) {
  const { auth }: any = usePage().props;
  const isPM = auth?.user?.role === "PM";

  // ===== Filter state (HARUS di top-level component) =====
  const [q, setQ] = useState("");
  const [priorityF, setPriorityF] = useState<"" | Epic["priority"]>("");
  const [statusF, setStatusF] = useState<"" | Epic["status"]>("");

  const filteredEpics = useMemo(() => {
    const query = q.trim().toLowerCase();

    return epics.filter((e) => {
      const okQuery =
        !query ||
        e.create_work.toLowerCase().includes(query) ||
        (e.code ?? "").toLowerCase().includes(query);

      const okPriority = !priorityF || e.priority === priorityF;
      const okStatus = !statusF || e.status === statusF;

      return okQuery && okPriority && okStatus;
    });
  }, [epics, q, priorityF, statusF]);

  // ===== Create modal =====
  const [open, setOpen] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    code: "",
    create_work: "",
    priority: "MEDIUM" as Epic["priority"],
    status: "TODO" as Epic["status"],
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();

    post(route("epics.store"), {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <header className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Epics</h2>
          <Breadcrumbs
            items={[
              { label: "Home", href: route("dashboard") },
              { label: "Epics" },
            ]}
          />
        </header>
      }
    >
      <Head title="Dashboard" />

      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Epics</h3>

          {isPM && (
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 transition"
            >
              + Create Epic
            </button>
          )}
        </div>

        {/* FILTER BAR */}
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Search
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search work or code..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="min-w-[160px]">
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

          <div className="min-w-[180px]">
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
            {filteredEpics.length} / {epics.length}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Work</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created at</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredEpics.map((e) => (
                <tr
                  key={e.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {e.create_work}
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant={e.priority}>{e.priority}</Badge>
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant={e.status}>{e.status}</Badge>
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {formatDateTime(e.created_at)}
                  </td>

                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={route("epics.show", e.id)}
                      className="text-sm font-medium text-black hover:underline"
                    >
                      View
                    </Link>

                    {isPM ? (
                      <span className="text-sm text-gray-500">Edit</span>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredEpics.length === 0 && (
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

      {/* CREATE MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">
                Create Epic
              </h4>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                {/* <label className="text-sm font-medium text-gray-700">
                  Code (optional)
                </label> */}
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  value={data.code}
                  onChange={(e) => setData("code", e.target.value)}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Create Work
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  value={data.create_work}
                  onChange={(e) => setData("create_work", e.target.value)}
                />
                {errors.create_work && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.create_work}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    value={data.priority}
                    onChange={(e) => setData("priority", e.target.value as any)}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    value={data.status}
                    onChange={(e) => setData("status", e.target.value as any)}
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
                  onClick={() => setOpen(false)}
                  className="rounded-lg border px-4 py-2 text-sm text-gray-700"
                >
                  Cancel
                </button>

                <button
                  disabled={processing}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {processing ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
