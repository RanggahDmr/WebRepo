import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, router, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import { useMemo, useState } from "react";
import { can } from "@/lib/can";

import EpicTable from "@/components/epics/EpicTable";
import CreateEpicModal from "@/components/epics/EpicCreateModal"; // sesuaikan kalau namanya beda

type RoleLite = { id: number; slug: string; name: string };
type UserOption = { id: number; name: string; email?: string; roles?: RoleLite[] };

type Board = {
  uuid: string;
  squad_code: string | null;
  title: string;
  created_at?: string;
  updated_at?: string;
};

type Props = {
  board: Board;
  epics: any[];
  members: UserOption[];
  users?: UserOption[]; // optional (kalau kamu mau dropdown ambil dari props ini)
};

const roleLabel = (u: UserOption) => {
  const slugs = (u.roles ?? []).map((r) => r.slug);
  return slugs.length ? slugs.join(", ") : "-";
};

export default function Show({ board, epics, members, users = [] }: Props) {
  const { auth }: any = usePage().props;

  const [tab, setTab] = useState<"epics" | "members">("epics");
  const [openCreateEpic, setOpenCreateEpic] = useState(false);

  // permissions
  const canCreateEpic = can(auth, "create_epic");
  const canManageMembers = can(auth, "manage_members");

  // members management (reuse pattern dari Boards/Index)
  const [userId, setUserId] = useState<string>("");

  const memberIds = useMemo(() => new Set((members ?? []).map((m) => m.id)), [members]);
  const availableUsers = useMemo(() => (users ?? []).filter((u) => !memberIds.has(u.id)), [users, memberIds]);

  const onRemove = (memberId: number) => {
    router.delete(route("boards.members.destroy", { board: board.uuid, user: memberId }), {
      preserveScroll: true,
    });
  };

  const onAdd = () => {
    if (!userId) return;

    router.post(
      route("boards.members.store", { board: board.uuid }),
      { user_id: Number(userId) },
      { preserveScroll: true }
    );

    setUserId("");
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500">Board</div>
            <div className="text-xl font-semibold text-gray-900">{board.title}</div>

            <div className="mt-1 text-sm text-gray-500 space-y-0.5">
              <div>Squad: {board.squad_code ?? "-"}</div>
              <div>UUID: {board.uuid}</div>
              {board.created_at && <div>Created: {new Date(board.created_at).toLocaleString()}</div>}
            </div>
          </div>

          {tab === "epics" && canCreateEpic && (
            <button
              type="button"
              onClick={() => setOpenCreateEpic(true)}
              className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
            >
              + New Epic
            </button>
          )}
        </div>
      }
    >
      <Head title={`Board - ${board.title}`} />

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("epics")}
            className={`rounded-md px-3 py-2 text-sm ${
              tab === "epics" ? "bg-black text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Epics
          </button>
          <button
            onClick={() => setTab("members")}
            className={`rounded-md px-3 py-2 text-sm ${
              tab === "members" ? "bg-black text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Members
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 rounded-xl border bg-white p-4">
          {tab === "epics" && <EpicTable epics={epics} />}

          {tab === "members" && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Total: <span className="font-medium">{members?.length ?? 0}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {members?.length ? (
                  members.map((m) => (
                    <span key={m.id} className="rounded bg-gray-100 px-2 py-1 text-sm">
                      {m.name} <span className="text-gray-400">({roleLabel(m)})</span>

                      {canManageMembers && m.id !== auth?.user?.id && (
                        <button
                          type="button"
                          className="ml-2 text-red-600 hover:underline"
                          onClick={() => onRemove(m.id)}
                        >
                          Remove
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>

              {/* Add member */}
              {canManageMembers ? (
                <div className="mt-4 flex items-center gap-2">
                  <select
                    className="w-full rounded border px-2 py-2 text-sm"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  >
                    <option value="">Select user…</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({roleLabel(u)})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
                    disabled={!userId}
                    onClick={onAdd}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <div className="mt-3 text-xs text-gray-400">
                  You don't have permission to manage members.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Epic Modal */}
      {canCreateEpic && (
        <CreateEpicModal
          open={openCreateEpic}
          onClose={() => setOpenCreateEpic(false)}
          board={board}
        />
      )}
    </AuthenticatedLayout>
  );
}
