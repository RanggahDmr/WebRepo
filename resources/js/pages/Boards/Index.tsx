import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Link, router, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import { useState } from "react";
import CreateBoardModal from "./CreateBoardModal";

type Member = {
  id: number;
  name: string;
  role: "PM" | "SAD" | "PROGRAMMER";
};

type Board = {
  uuid: string;
  squad_code: string | null;
  title: string;
  members?: Member[];
};

type Props = {
  boards: Board[];
  users: Member[]; // list users dari backend
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

export default function Index({ boards, users }: Props) {
  const { auth }: any = usePage().props;
  const isPM = auth?.user?.role === "PM";

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">Boards</div>
          {isPM ? <div className="text-sm text-gray-500"></div> : null}
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
              <BoardCard key={b.uuid} board={b} users={users} isPM={isPM} />
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

function BoardCard({ board, users, isPM }: { board: Board; users: Member[]; isPM: boolean }) {
  const { auth }: any = usePage().props;
  const [edit, setEdit] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const toggleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEdit((v) => !v);
  };

  const onRemove = (e: React.MouseEvent, memberId: number) => {
    e.preventDefault();
    e.stopPropagation();
    router.delete(route("boards.members.destroy", { board: board.uuid, user: memberId }));
  };

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;

    router.post(route("boards.members.store", { board: board.uuid }), {
      user_id: Number(userId),
    });

    setUserId("");
  };

  return (
    <Link
      href={route("epics.index", { board: board.uuid })}
      className="relative block rounded-xl border bg-white p-4 shadow-sm transition hover:shadow"
    >
      {/* Pencil */}
      {isPM && (
        <button
          type="button"
          onClick={toggleEdit}
          className="absolute right-3 top-3 rounded-md p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          title="Edit members"
        >
          <PencilIcon />
        </button>
      )}

      <div className="font-semibold text-gray-900">{board.title}</div>
      <div className="mt-1 text-sm text-gray-500">Board: {board.uuid ?? "-"}</div>

      {/* Members */}
      <div className="mt-3 text-xs text-gray-600">
        <div className="font-medium text-gray-700">Members</div>
        <div className="mt-1 flex flex-wrap gap-2">
          {board.members?.length ? (
            board.members.map((m) => (
              <span key={m.id} className="rounded bg-gray-100 px-2 py-1">
                {m.name} <span className="text-gray-400">({m.role})</span>

                {isPM && edit && m.id !== auth?.user?.id && (
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

      {/* Add member (edit mode only) */}
      {isPM && edit && (
        <div
          className="mt-3 flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <select
            className="w-full rounded border px-2 py-1 text-sm"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">Select user…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

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
    </Link>
  );
}
