import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, router, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import { can } from "@/lib/can";
import { useMemo } from "react";

type Scope = "EPIC" | "STORY" | "TASK";

type OptionStatus = {
  id: number;
  scope: Scope;
  key: string;
  name: string;
  color?: string | null;
  is_done: boolean;
};

type OptionPriority = {
  id: number;
  scope: Scope;
  key: string;
  name: string;
  color?: string | null;
};

type GlobalDefault = {
  id: number;
  scope: Scope;
  default_status_id: number;
  default_priority_id: number;
  default_status?: any;
  default_priority?: any;
  defaultStatus?: any;
  defaultPriority?: any;
};

export default function GlobalDefaultsIndex({
  defaults,
  statusOptions,
  priorityOptions,
  scopes,
  canManage,
}: {
  defaults: GlobalDefault[];
  statusOptions: OptionStatus[];
  priorityOptions: OptionPriority[];
  scopes: Scope[];
  canManage: boolean;
}) {
  const { auth }: any = usePage().props;

  const canEdit = useMemo(
    () => canManage || can(auth, "manage_global_defaults"),
    [auth, canManage]
  );

  const statusesByScope = useMemo(() => {
    const m: Record<string, OptionStatus[]> = {};
    for (const s of statusOptions) {
      (m[s.scope] ||= []).push(s);
    }
    return m;
  }, [statusOptions]);

  const prioritiesByScope = useMemo(() => {
    const m: Record<string, OptionPriority[]> = {};
    for (const p of priorityOptions) {
      (m[p.scope] ||= []).push(p);
    }
    return m;
  }, [priorityOptions]);

  const updateDefault = (row: GlobalDefault, patch: { default_status_id?: number; default_priority_id?: number }) => {
    if (!canEdit) return;

    router.patch(
      route("admin.global-defaults.update", { globalDefault: row.id }),
      {
        default_status_id: patch.default_status_id ?? row.default_status_id,
        default_priority_id: patch.default_priority_id ?? row.default_priority_id,
      },
      { preserveScroll: true }
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Global Defaults" />

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold">Global Defaults</h1>
          <p className="text-sm text-gray-600">Default status & priority per scope.</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Default Status</th>
                <th className="px-4 py-3">Default Priority</th>
              </tr>
            </thead>

            <tbody>
              {defaults.map((d) => {
                const scope = d.scope;
                const statusOpts = statusesByScope[scope] ?? [];
                const prioOpts = prioritiesByScope[scope] ?? [];

                return (
                  <tr key={d.id} className="border-t">
                    <td className="px-4 py-3 font-semibold">{scope}</td>

                    <td className="px-4 py-3">
                      <select
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={d.default_status_id}
                        disabled={!canEdit}
                        onChange={(e) => updateDefault(d, { default_status_id: Number(e.target.value) })}
                      >
                        {statusOpts.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.key}){s.is_done ? " ✓" : ""}
                          </option>
                        ))}
                        {statusOpts.length === 0 && <option value="">No active statuses</option>}
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <select
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={d.default_priority_id}
                        disabled={!canEdit}
                        onChange={(e) => updateDefault(d, { default_priority_id: Number(e.target.value) })}
                      >
                        {prioOpts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.key})
                          </option>
                        ))}
                        {prioOpts.length === 0 && <option value="">No active priorities</option>}
                      </select>
                    </td>
                  </tr>
                );
              })}

              {defaults.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={3}>
                    No defaults found. Seed global_defaults first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Hint */}
        <div className="text-xs text-gray-500">
          Note: Deactivated status/priority will not appear in dropdown.
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
