import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, router, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import { can } from "@/lib/can";
import { useMemo, useState } from "react";

type Scope = "EPIC" | "STORY" | "TASK";

type GlobalStatus = {
  id: number;
  scope: Scope;
  key: string;
  name: string;
  color?: string | null;
  sort_order: number;
  is_done: boolean;
  is_active: boolean;
};

export default function GlobalStatusesIndex({
  scope,
  active,
  statuses,
  scopes,
  canManage,
}: {
  scope: Scope;
  active: "1" | "0" | "all";
  statuses: GlobalStatus[];
  scopes: Scope[];
  canManage: boolean;
}) {
  const { auth }: any = usePage().props;

  const [form, setForm] = useState({
    scope: scope ?? "EPIC",
    key: "",
    name: "",
    color: "",
    sort_order: 0,
    is_done: false,
    is_active: true,
  });

  const canEdit = useMemo(
    () => canManage || can(auth, "manage_global_statuses"),
    [auth, canManage]
  );

  const reload = (next: Partial<{ scope: Scope; active: "1" | "0" | "all" }>) => {
    router.get(
      route("admin.global-statuses.index"),
      {
        scope: next.scope ?? scope,
        active: next.active ?? active,
      },
      { preserveScroll: true, preserveState: true }
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    router.post(
      route("admin.global-statuses.store"),
      {
        scope: form.scope,
        key: form.key.trim(),
        name: form.name.trim(),
        color: form.color.trim() || null,
        sort_order: Number(form.sort_order) || 0,
        is_done: !!form.is_done,
        is_active: !!form.is_active,
      },
      { preserveScroll: true }
    );
  };

  const updateRow = (row: GlobalStatus, patch: Partial<GlobalStatus>) => {
    if (!canEdit) return;

    router.patch(
      route("admin.global-statuses.update", { globalStatus: row.id }),
      {
        key: patch.key ?? row.key,
        name: patch.name ?? row.name,
        color: patch.color ?? row.color,
        sort_order: patch.sort_order ?? row.sort_order,
        is_done: patch.is_done ?? row.is_done,
        is_active: patch.is_active ?? row.is_active,
      },
      { preserveScroll: true }
    );
  };

  const deactivate = (row: GlobalStatus) => {
    if (!canEdit) return;

    router.delete(route("admin.global-statuses.destroy", { globalStatus: row.id }), {
      preserveScroll: true,
    });
  };

  const toggle = (row: GlobalStatus) => {
    if (!canEdit) return;
    router.patch(route("admin.global-statuses.toggle", { globalStatus: row.id }), {}, { preserveScroll: true });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Global Statuses" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Global Statuses</h1>
            <p className="text-sm text-gray-600">Manage statuses per scope (EPIC/STORY/TASK).</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={scope}
            onChange={(e) => reload({ scope: e.target.value as Scope })}
          >
            {scopes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={active}
            onChange={(e) => reload({ active: e.target.value as any })}
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
            <option value="all">All</option>
          </select>

          <div className="ml-auto">
            <button
              type="button"
              onClick={() => reload({})}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Create form */}
        <form onSubmit={submit} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2 text-sm font-semibold">Create Status</div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <select
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={form.scope}
              onChange={(e) => setForm((v) => ({ ...v, scope: e.target.value as Scope }))}
              disabled={!canEdit}
            >
              {scopes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="key (e.g. todo)"
              value={form.key}
              onChange={(e) => setForm((v) => ({ ...v, key: e.target.value }))}
              disabled={!canEdit}
            />

            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="name (e.g. To Do)"
              value={form.name}
              onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
              disabled={!canEdit}
            />

            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="color (optional)"
              value={form.color}
              onChange={(e) => setForm((v) => ({ ...v, color: e.target.value }))}
              disabled={!canEdit}
            />

            <input
              type="number"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="sort_order"
              value={form.sort_order}
              onChange={(e) => setForm((v) => ({ ...v, sort_order: Number(e.target.value) }))}
              disabled={!canEdit}
            />

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_done}
                  onChange={(e) => setForm((v) => ({ ...v, is_done: e.target.checked }))}
                  disabled={!canEdit}
                />
                Done
              </label>

              <button
                type="submit"
                disabled={!canEdit}
                className={[
                  "ml-auto rounded-md px-3 py-2 text-sm font-medium",
                  canEdit ? "bg-black text-white hover:bg-gray-900" : "bg-gray-200 text-gray-500 cursor-not-allowed",
                ].join(" ")}
              >
                Create
              </button>
            </div>
          </div>
        </form>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Color</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Done</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {statuses.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2">
                    <input
                      className="w-full rounded-md border border-gray-200 px-2 py-1"
                      defaultValue={s.key}
                      disabled={!canEdit}
                      onBlur={(e) => updateRow(s, { key: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full rounded-md border border-gray-200 px-2 py-1"
                      defaultValue={s.name}
                      disabled={!canEdit}
                      onBlur={(e) => updateRow(s, { name: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full rounded-md border border-gray-200 px-2 py-1"
                      defaultValue={s.color ?? ""}
                      disabled={!canEdit}
                      onBlur={(e) => updateRow(s, { color: e.target.value || null })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      className="w-full rounded-md border border-gray-200 px-2 py-1"
                      defaultValue={s.sort_order}
                      disabled={!canEdit}
                      onBlur={(e) => updateRow(s, { sort_order: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      defaultChecked={!!s.is_done}
                      disabled={!canEdit}
                      onChange={(e) => updateRow(s, { is_done: e.target.checked })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => toggle(s)}
                      disabled={!canEdit}
                      className={[
                        "rounded-md px-3 py-1.5 text-xs",
                        s.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700",
                        !canEdit ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-200",
                      ].join(" ")}
                    >
                      {s.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => deactivate(s)}
                      disabled={!canEdit}
                      className={[
                        "rounded-md px-3 py-1.5 text-xs",
                        canEdit ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-gray-200 text-gray-500 cursor-not-allowed",
                      ].join(" ")}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}

              {statuses.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                    No statuses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
