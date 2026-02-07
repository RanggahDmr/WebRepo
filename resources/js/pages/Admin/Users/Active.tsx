import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { router, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = { id: number; name: string; slug: string };

type ActiveUser = {
  id: number;
  name: string;
  email: string;
  roles: Role[];
};

export default function ActiveUsers({
  roles,
  users,
  pendingCount,
}: {
  roles: Role[];
  users: ActiveUser[];
  pendingCount?: number;
}) {
  const { flash }: any = usePage().props;

  useEffect(() => {
    if (!flash?.alert?.message) return;

    const type = flash.alert.type ?? "success";
    if (type === "success") toast.success(flash.alert.message);
    else if (type === "warning") toast(flash.alert.message);
    else toast.error(flash.alert.message);
  }, [flash?.alert]);

  // confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<{ id: number; name: string } | null>(
    null
  );

  const openDelete = (u: { id: number; name: string }) => {
    setConfirmUser(u);
    setConfirmOpen(true);
  };

  const doDelete = () => {
    if (!confirmUser) return;
    router.delete(route("admin.users.destroy", { user: confirmUser.id }), {
      preserveScroll: true,
      onFinish: () => {
        setConfirmOpen(false);
        setConfirmUser(null);
      },
    });
  };

  // Search active users
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return (users ?? []).filter((u) => {
      const roleNames = (u.roles ?? []).map((r) => r.name).join(" ");
      const roleSlugs = (u.roles ?? []).map((r) => r.slug).join(" ");
      const haystack = `${u.name} ${u.email} ${roleNames} ${roleSlugs}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [users, search]);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-semibold text-gray-900">User Management</div>

          {typeof pendingCount === "number" && pendingCount > 0 ? (
            <div className="text-sm text-gray-600">
              Pending:{" "}
              <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                {pendingCount}
              </span>
            </div>
          ) : null}
        </div>
      }
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Active */}
        <section className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-base font-semibold text-gray-900">Active Users</div>
              <div className="text-sm text-gray-500">Users who already have roles.</div>

              <div className="mt-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user by name, email, or role..."
                  className="w-full max-w-md rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div className="shrink-0 text-sm text-gray-500">{users.length} users</div>
          </div>

          {!users.length ? (
            <div className="mt-4 text-sm text-gray-500">No active users.</div>
          ) : (
            <>
              {search.trim() ? (
                <div className="mt-3 text-sm text-gray-500">
                  Showing <b>{filteredUsers.length}</b> of <b>{users.length}</b> users
                </div>
              ) : null}

              <div className="mt-4 -mx-5 overflow-x-auto sm:mx-0">
                <table className="w-full min-w-[980px] table-auto text-sm">
                  <colgroup>
                    <col className="w-[25%]" />
                    <col className="w-[25%]" />
                    <col className="w-[25%]" />
                    <col className="w-[25%]" />
                  </colgroup>

                  <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">Name</th>
                      <th className="px-4 py-3 whitespace-nowrap">Email</th>
                      <th className="px-4 py-3 whitespace-nowrap text-center">Role</th>
                      <th className="px-4 py-3 text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!filteredUsers.length ? (
                      <tr>
                        <td className="px-4 py-6 text-gray-500" colSpan={4}>
                          No users match: <b>{search}</b>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <ActiveRow key={u.id} user={u} roles={roles} onDelete={openDelete} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete user?"
        description={
          confirmUser ? (
            <>
              Are you sure want to delete <b>{confirmUser.name}</b>?
            </>
          ) : null
        }
        cancelText="Cancel"
        confirmText="Delete"
        danger
        onClose={() => {
          setConfirmOpen(false);
          setConfirmUser(null);
        }}
        onConfirm={doDelete}
      />
    </AuthenticatedLayout>
  );
}

function ActiveRow({
  user,
  roles,
  onDelete,
}: {
  user: ActiveUser;
  roles: Role[];
  onDelete: (u: { id: number; name: string }) => void;
}) {
  const currentRoleId = user.roles?.[0]?.id ?? (roles[0]?.id ?? 0);
  const [roleId, setRoleId] = useState<number>(currentRoleId);

  const submit = () => {
    router.patch(
      route("admin.users.role.update", { user: user.id }),
      { role_id: roleId },
      { preserveScroll: true }
    );
  };

  return (
    <tr className="border-b">
      <td className="px-4 py-3 font-medium text-gray-900 truncate">{user.name}</td>
      <td className="px-4 py-3 text-gray-700 truncate">{user.email}</td>

      <td className="px-4 py-3">
       <Select value={String(roleId)} onValueChange={(v) => setRoleId(parseInt(v, 10))}>
    <SelectTrigger className="h-9 w-full min-w-[180px] rounded-lg">
      <SelectValue placeholder="Select role" />
    </SelectTrigger>

    <SelectContent className="max-h-64">
      {roles.map((r) => (
        <SelectItem key={r.id} value={String(r.id)}>
          {r.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={submit}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => onDelete({ id: user.id, name: user.name })}
            className="rounded-md border border-red-600 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
