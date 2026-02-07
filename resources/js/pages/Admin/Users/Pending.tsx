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

type PendingUser = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export default function PendingUsers({
  roles,
  pending,
  pendingCount,
}: {
  roles: Role[];
  pending: PendingUser[];
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

  const defaultRoleId = useMemo(() => roles[0]?.id ?? null, [roles]);

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
        {/* Pending */}
        <section className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-base font-semibold text-gray-900">Pending Users</div>
              <div className="text-sm text-gray-500">
                Users who registered but have no role yet.
              </div>
            </div>

            <div className="shrink-0 text-sm text-gray-500">{pending.length} pending</div>
          </div>

          {!pending.length ? (
            <div className="mt-4 text-sm text-gray-500">No pending users.</div>
          ) : (
            <div className="mt-4 -mx-5 overflow-x-auto sm:mx-0">
              <table className="w-full min-w-[860px] table-auto text-sm">
                <colgroup>
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                </colgroup>

                <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Name</th>
                    <th className="px-4 py-3 whitespace-nowrap">Email</th>
                    <th className="px-4 py-3">Registered</th>
                    <th className="px-4 py-3 whitespace-nowrap text-center">Role</th>
                    <th className="px-4 py-3 whitespace-nowrap text-center">Actions</th>
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
  }, [defaultRoleId, roleId]);

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
      <td className="px-4 py-3 text-gray-500 truncate">
        {new Date(user.created_at).toLocaleString()}
      </td>

      <td className="px-4 py-3">
        <div className="relative mx-auto w-full min-w-[180px] max-w-[260px]">
         <Select
  value={String(roleId)}
  onValueChange={(v) => setRoleId(parseInt(v, 10))}
>
  <SelectTrigger className="h-10 w-full min-w-[180px] max-w-[260px] rounded-lg text-sm">
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


          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={!roleId}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Assign
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
