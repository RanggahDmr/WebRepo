// ... (SEMUA IMPORT & KODE SAMA persis seperti punyamu)
// cukup ganti function groupKey saja (tapi aku kirim full file biar copas aman)

import { router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import route from "@/lib/route";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AuthenticatedLayout from "@/layouts/authenticated-layout";

type Permission = {
  id: number;
  name: string;
  key: string;
  description?: string | null;
};

type Role = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  permissions: Permission[];
};

export default function RolesIndex({
  roles,
  permissions,
}: {
  roles: Role[];
  permissions: Permission[];
}) {
  const { flash }: any = usePage().props;

  useEffect(() => {
    if (!flash?.alert?.message) return;
    const type = flash.alert.type ?? "success";
    if (type === "success") toast.success(flash.alert.message);
    else if (type === "warning") toast(flash.alert.message);
    else toast.error(flash.alert.message);
  }, [flash?.alert]);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  const openCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const openEdit = (r: Role) => {
    setEditing(r);
    setOpenForm(true);
  };

  const askDelete = (r: Role) => {
    setDeleteRole(r);
    setConfirmOpen(true);
  };

  const doDelete = () => {
    if (!deleteRole) return;

    router.delete(route("admin.roles.destroy", { role: deleteRole.id }), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Role deleted.");
      },
      onFinish: () => {
        setDeleteRole(null);
      },
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">Roles</div>
          <button
            onClick={openCreate}
            className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
          >
            + Add Role
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 w-[22%]">Name</th>
                <th className="px-4 py-3 w-[18%]">Slug</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3 w-[220px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!roles.length ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={4}>
                    No roles.
                  </td>
                </tr>
              ) : (
                roles.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.name}
                      {r.description ? (
                        <div className="mt-1 text-xs text-gray-500">
                          {r.description}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.slug}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {(r.permissions ?? []).slice(0, 8).map((p) => (
                          <span
                            key={p.id}
                            className="rounded-full border bg-white px-2 py-0.5 text-xs text-gray-700"
                            title={p.key}
                          >
                            {p.key}
                          </span>
                        ))}
                        {(r.permissions ?? []).length > 8 ? (
                          <span className="text-xs text-gray-500">
                            +{(r.permissions ?? []).length - 8} more
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="rounded border px-3 py-1 text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => askDelete(r)}
                          disabled={r.slug === "admin"}
                          className="w-full sm:w-auto rounded border border-red-600 px-3 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>

                      {r.slug === "admin" ? (
                        <div className="mt-2 text-xs text-gray-400 sm:mt-1 sm:text-right">
                          Admin cannot be deleted.
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RoleFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        permissions={permissions}
        editing={editing}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete role?"
        description={
          deleteRole ? (
            <>
              Are you sure want to delete <b>{deleteRole.name}</b>?
            </>
          ) : null
        }
        cancelText="Cancel"
        confirmText="Delete"
        danger
        onClose={() => {
          setConfirmOpen(false);
          setDeleteRole(null);
        }}
        onConfirm={doDelete}
      />
    </AuthenticatedLayout>
  );
}

function RoleFormModal({
  open,
  onClose,
  permissions,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  permissions: Permission[];
  editing: Role | null;
}) {
  const isEdit = !!editing;

  const initialPermIds = useMemo(() => {
    return new Set<number>((editing?.permissions ?? []).map((p) => p.id));
  }, [editing]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [permIds, setPermIds] = useState<Set<number>>(new Set());

  const { errors }: any = usePage().props;

  useEffect(() => {
    if (!open) return;

    setName(editing?.name ?? "");
    setSlug(editing?.slug ?? "");
    setDescription(editing?.description ?? "");
    setPermIds(new Set(Array.from(initialPermIds)));
  }, [open, editing, initialPermIds]);

  if (!open) return null;

  const togglePerm = (id: number) => {
    setPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      slug,
      description: description.trim() ? description : null,
      permissions: Array.from(permIds),
    };

    if (isEdit && editing) {
      router.patch(route("admin.roles.update", { role: editing.id }), payload, {
        preserveScroll: true,
        onSuccess: () => onClose(),
      });
      return;
    }

    router.post(route("admin.roles.store"), payload, {
      preserveScroll: true,
      onSuccess: () => onClose(),
    });
  };

  const disableSlug = editing?.slug === "admin";

  //  grouping helper
  const groupKey = (key: string) => {
    const k = (key ?? "").toLowerCase();

    // settings dulu biar gak ketimpa "board"
    if (k.includes("setting")) return "Board Settings";

    if (k.includes("story")) return "Story";
    if (k.includes("epic")) return "Epic";
    if (k.includes("task")) return "Task";
    if (k.includes("board")) return "Board";
    if (k.includes("member")) return "Members";
    if (k.includes("user")) return "Users";
    if (k.includes("role") || k.includes("permission")) return "Roles & Permissions";
    if (k.includes("monitor")) return "Monitoring";
    if (k.includes("history")) return "History";

    return "Other";
  };

  //  action order inside group
  const actionWeight = (key: string) => {
    const k = (key ?? "").toLowerCase();
    if (k.startsWith("view")) return 1;
    if (k.startsWith("create")) return 2;
    if (k.startsWith("update")) return 3;
    if (k.startsWith("delete")) return 4;
    if (k.startsWith("manage")) return 5;
    return 9;
  };

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    permissions.forEach((p) => {
      const g = groupKey(p.key);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(p);
    });

    const order = [
      "Board",
      "Board Settings",
      "Members",
      "Epic",
      "Story",
      "Task",
      "Users",
      "Roles & Permissions",
      "Monitoring",
      "History",
      "Other",
    ];

    return order
      .filter((g) => map.has(g))
      .map((g) => ({
        group: g,
        items: (map.get(g) ?? [])
          .slice()
          .sort((a, b) => {
            const wa = actionWeight(a.key);
            const wb = actionWeight(b.key);
            if (wa !== wb) return wa - wb;
            return a.key.localeCompare(b.key);
          }),
      }));
  }, [permissions]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {isEdit ? "Edit Role" : "Create Role"}
            </div>
            <div className="text-sm text-gray-500">
              Set role details and permissions.
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Project Manager"
              />
              {errors?.name ? (
                <div className="mt-1 text-xs text-red-600">{errors.name}</div>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Slug</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm disabled:bg-gray-50"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. pm, qa, developer"
                disabled={disableSlug}
              />
              <div className="mt-1 text-xs text-gray-400">
                lowercase, use a-z 0-9 _
              </div>
              {errors?.slug ? (
                <div className="mt-1 text-xs text-red-600">{errors.slug}</div>
              ) : null}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
              />
              {errors?.description ? (
                <div className="mt-1 text-xs text-red-600">{errors.description}</div>
              ) : null}
            </div>

            <div className="md:col-span-2">
              <div className="text-sm font-medium text-gray-700">Permissions</div>

              <div className="mt-3 space-y-4">
                {grouped.map(({ group, items }) => (
                  <div key={group} className="rounded-xl border bg-white">
                    <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
                      <div className="text-sm font-semibold text-gray-900">
                        {group}
                      </div>
                      <div className="text-xs text-gray-500">
                        {items.length} permissions
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                      {items.map((p) => (
                        <label
                          key={p.id}
                          className="flex cursor-pointer items-start gap-2 rounded-lg border p-3 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={permIds.has(p.id)}
                            onChange={() => togglePerm(p.id)}
                            className="mt-1"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {p.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {p.key}
                            </div>
                            {p.description ? (
                              <div className="mt-1 text-xs text-gray-400">
                                {p.description}
                              </div>
                            ) : null}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {errors?.permissions ? (
                <div className="mt-2 text-xs text-red-600">
                  {errors.permissions}
                </div>
              ) : null}
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
              >
                {isEdit ? "Save" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
