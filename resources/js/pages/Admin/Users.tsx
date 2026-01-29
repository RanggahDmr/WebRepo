import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { router, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Role = { id: number; name: string; slug: string };

type PendingUser = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

type ActiveUser = {
  id: number;
  name: string;
  email: string;
  roles: Role[];
};

export default function Users({
  roles,
  pending,
  users,
}: {
  roles: Role[];
  pending: PendingUser[];
  users: ActiveUser[];
}) {
  const { auth, flash }: any = usePage().props;

  // toast dari flash.alert
  useEffect(() => {
    if (!flash?.alert?.message) return;

    const type = flash.alert.type ?? "success";
    if (type === "success") toast.success(flash.alert.message);
    else if (type === "warning") toast(flash.alert.message);
    else toast.error(flash.alert.message);
  }, [flash?.alert]);

  // confirm delete (global)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<{ id: number; name: string } | null>(null);

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

  const defaultRoleId = useMemo(() => roles[0]?.id ?? null, [roles]);

  return (
    <AuthenticatedLayout
      header={<div className="text-lg font-semibold text-gray-900">Role Management</div>}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Pending */}
        <section className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-gray-900">Pending Users</div>
              <div className="text-sm text-gray-500">
                Users who registered but have no role yet.
              </div>
            </div>
            <div className="text-sm text-gray-500">{pending.length} pending</div>
          </div>

          {!pending.length ? (
            <div className="mt-4 text-sm text-gray-500">No pending users.</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Registered</th>
                    <th className="px-4 py-3 w-[380px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((u) => (
                    <PendingRow
                      key={u.id}
                      user={u}
                      roles={roles}
                      defaultRoleId={defaultRoleId}
                      onDelete={openDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Active */}
        <section className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-gray-900">Active Users</div>
              <div className="text-sm text-gray-500">Users who already have roles.</div>
            </div>
            <div className="text-sm text-gray-500">{users.length} users</div>
          </div>

          {!users.length ? (
            <div className="mt-4 text-sm text-gray-500">No active users.</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 w-[380px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <ActiveRow
                      key={u.id}
                      user={u}
                      roles={roles}
                      onDelete={openDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
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

function PendingRow({
  user,
  roles,
  defaultRoleId,
  onDelete,
}: {
  user: PendingUser;
  roles: Role[];
  defaultRoleId: number | null;
  onDelete: (u: { id: number; name: string }) => void;
}) {
  const [roleId, setRoleId] = useState<number>(defaultRoleId ?? 0);

  useEffect(() => {
    if (defaultRoleId && !roleId) setRoleId(defaultRoleId);
  }, [defaultRoleId]);

  const submit = () => {
    router.patch(
      route("admin.users.role.update", { user: user.id }),
      { role_id: roleId },
      { preserveScroll: true }
    );
  };

  return (
    <tr className="border-b">
      <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
      <td className="px-4 py-3 text-gray-700">{user.email}</td>
      <td className="px-4 py-3 text-gray-500">{new Date(user.created_at).toLocaleString()}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            className="w-full rounded border px-2 py-1"
            value={roleId}
            onChange={(e) => setRoleId(parseInt(e.target.value, 10))}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={submit}
            disabled={!roleId}
            className="rounded bg-black px-3 py-1 text-white disabled:opacity-50"
          >
            Assign
          </button>

          <button
            type="button"
            onClick={() => onDelete({ id: user.id, name: user.name })}
            className="rounded border border-red-600 px-3 py-1 text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
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
      <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
      <td className="px-4 py-3 text-gray-700">{user.email}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            className="w-full rounded border px-2 py-1"
            value={roleId}
            onChange={(e) => setRoleId(parseInt(e.target.value, 10))}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={submit}
            className="rounded bg-black px-3 py-1 text-white"
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => onDelete({ id: user.id, name: user.name })}
            className="rounded border border-red-600 px-3 py-1 text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
