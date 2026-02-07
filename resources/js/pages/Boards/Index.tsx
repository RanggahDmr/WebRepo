import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Link, router, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import { useMemo, useState } from "react";
import CreateBoardModal from "./CreateBoardModal";
import { can } from "@/lib/can";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type RoleLite = {
  id: number;
  slug: string;
  name: string;
};

type UserOption = {
  id: number;
  name: string;
  email?: string;
  roles?: RoleLite[];
};

type Board = {
  uuid: string;
  squad_code: string | null;
  title: string;
  members?: UserOption[];
};

type Props = {
  boards: Board[];
  users: UserOption[];
};


const roleLabel = (u: UserOption) => {
  const slugs = (u.roles ?? []).map((r) => r.slug);
  return slugs.length ? slugs.join(", ") : "-";
};

function PencilIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 6V4h8v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 6l1 16h10l1-16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Index({ boards, users }: Props) {
  const { auth }: any = usePage().props;

  const canManageBoards = can(auth, "manage_boards"); // create/delete board
  const canManageMembers = can(auth, "manage_members"); // edit members

  const [openCreate, setOpenCreate] = useState(false);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-gray-900">All Boards</div>

          {canManageBoards ? (
            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
            >
              + Add Board
            </button>
          ) : null}
        </div>
      }
    >
      <div className="mx-auto max-w-7xl px-4 py-6">
        {!boards?.length ? (
          <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
            No boards yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {boards.map((b) => (
              <BoardCard
                key={b.uuid}
                board={b}
                users={users}
                canManageMembers={canManageMembers}
                canManageBoards={canManageBoards}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Create (permission: manage_boards) */}
      {canManageBoards && (
        <CreateBoardModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
        />
      )}
    </AuthenticatedLayout>
  );
}

function BoardCard({
  board,
  users,
  canManageMembers,
  canManageBoards,
}: {
  board: Board;
  users: UserOption[];
  canManageMembers: boolean;
  canManageBoards: boolean;
}) {
  const { auth }: any = usePage().props;

  const [edit, setEdit] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const [confirmOpen, setConfirmOpen] = useState(false);

  const toggleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEdit((v) => !v);
  };

  const openDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const doDelete = () => {
    router.delete(route("boards.destroy", { board: board.uuid }), {
      preserveScroll: true,
      onFinish: () => setConfirmOpen(false),
    });
  };

  const onRemove = (e: React.MouseEvent, memberId: number) => {
    e.preventDefault();
    e.stopPropagation();

    router.delete(
      route("boards.members.destroy", { board: board.uuid, user: memberId }),
      { preserveScroll: true }
    );
  };

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;

    router.post(
      route("boards.members.store", { board: board.uuid }),
      { user_id: Number(userId) },
      { preserveScroll: true }
    );

    setUserId("");
  };

  const memberIds = useMemo(
    () => new Set((board.members ?? []).map((m) => m.id)),
    [board.members]
  );

  const availableUsers = useMemo(() => {
    return (users ?? []).filter((u) => !memberIds.has(u.id));
  }, [users, memberIds]);

  return (
    <>
      <Link
        href={route("epics.index", { board: board.uuid })} //epic.index -> boards.show
        className="relative block rounded-xl border bg-white p-4 shadow-sm transition hover:shadow"
      >
        {/* top-right actions */}
        {(canManageBoards || canManageMembers) && (
          <div
            className="absolute right-3 top-3 flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {canManageBoards && (
              <button
                type="button"
                onClick={openDelete}
                className="rounded-md border bg-white p-2 text-red-600 hover:bg-red-50"
                title="Delete board"
              >
                <TrashIcon />
              </button>
            )}

            {canManageMembers && (
              <button
                type="button"
                onClick={toggleEdit}
                className="rounded-md border bg-white p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                title="Edit members"
              >
                <PencilIcon />
              </button>
            )}
          </div>
        )}

        <div className="font-semibold text-gray-900">{board.title}</div>
        <div className="mt-1 text-sm text-gray-500">
          Board: {board.uuid ?? "-"}
        </div>

        {/* Members */}
        <div className="mt-3 text-xs text-gray-600">
          <div className="font-medium text-gray-700">Members</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {board.members?.length ? (
              board.members.map((m) => (
                <span key={m.id} className="rounded bg-gray-100 px-2 py-1">
                  {m.name}{" "}
                  <span className="text-gray-400">({roleLabel(m)})</span>
                  {canManageMembers && edit && m.id !== auth?.user?.id && (
                    <button
                      type="button"
                      className="ml-2 text-red-600 hover:underline"
                      onClick={(e) => onRemove(e, m.id)}
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
        </div>

        {/* Add member only when edit */}
        {canManageMembers && edit && (
          <div
            className="mt-3 flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
           <Select
  value={userId ? String(userId) : "NONE"}
  onValueChange={(v) => setUserId(v === "NONE" ? "" : v)}
>
  <SelectTrigger className="h-9 w-full rounded-md text-sm">
    <SelectValue placeholder="Select user…" />
  </SelectTrigger>

  <SelectContent className="max-h-64">
    <SelectItem value="NONE">Select user…</SelectItem>
    {availableUsers.map((u) => (
      <SelectItem key={u.id} value={String(u.id)}>
        {u.name} ({roleLabel(u)})
      </SelectItem>
    ))}
  </SelectContent>
</Select>

            <button
              type="button"
              className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
              disabled={!userId}
              onClick={onAdd}
            >
              Add
            </button>
          </div>
        )}

        {canManageMembers && !edit && (
          <div className="mt-3 text-xs text-gray-400">
            Click pencil to manage members
          </div>
        )}
      </Link>

      {/* Confirm delete */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete board?"
        description={
          <>
            Are you sure want to delete <b>{board.title}</b>?
            <div className="mt-1 text-xs text-gray-500">
              Data yang sudah dihapus tidak bisa dikembalikan.
            </div>
          </>
        }
        cancelText="Cancel"
        confirmText="Delete"
        danger
        onClose={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />
    </>
  );
}
