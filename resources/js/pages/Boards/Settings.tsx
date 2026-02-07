import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import route from "@/lib/route";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useAlert } from "@/components/alert/AlertProvider";

type Scope = "EPIC" | "STORY" | "TASK";

type BoardMetaBase = {
  id: number;
  board_uuid: string;
  scope: Scope;
  key: string;
  name: string;
  position: number;
  color?: string | null;
  is_default: boolean;
  is_locked: boolean;
  is_active: boolean;
};

type BoardStatus = BoardMetaBase & {
  is_done: boolean;
};

type BoardPriority = BoardMetaBase;

export default function Settings({
  board,
  canManageSettings,
  scopes,
  statuses,
  priorities,
}: any) {
  const { auth }: any = usePage().props;
  const alert = useAlert();

  const [tab, setTab] = useState<"STATUSES" | "PRIORITIES">("STATUSES");
  const [scope, setScope] = useState<Scope>("TASK");

  const canManage = !!canManageSettings;

  const list = useMemo(() => {
    const src = tab === "STATUSES" ? (statuses as BoardStatus[]) : (priorities as BoardPriority[]);
    return src.filter((x) => x.scope === scope).sort((a, b) => a.position - b.position);
  }, [tab, scope, statuses, priorities]);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const openCreate = () => {
    setEditing(null);
    setOpenModal(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setOpenModal(true);
  };

  const onDelete = (row: any) => {
    if (!canManage) return;

    alert.confirm({
      title: "Delete item?",
      description: `Hapus "${row.name}" (${row.key})?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: () => {
        const r =
          tab === "STATUSES"
            ? route("boards.settings.statuses.delete", { board: board.uuid, status: row.id })
            : route("boards.settings.priorities.delete", { board: board.uuid, priority: row.id });

        router.delete(r, { preserveScroll: true });
      },
    });
  };

  return (
    <AuthenticatedLayout
      header={<div className="text-lg font-semibold">Board Settings</div>}
    >
      <Head title="Board Settings" />

      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Boards", href: route("dashboard") },
            { label: board.title, href: route("epics.index", { board: board.uuid }) },
            { label: "Settings" },
          ]}
        />

        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Board</div>
          <div className="font-semibold">{board.title}</div>
          <div className="mt-1 text-xs text-gray-400">UUID: {board.uuid}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              className={`rounded px-3 py-2 text-sm ${tab === "STATUSES" ? "bg-black text-white" : "border"}`}
              onClick={() => setTab("STATUSES")}
            >
              Statuses
            </button>
            <button
              className={`rounded px-3 py-2 text-sm ${tab === "PRIORITIES" ? "bg-black text-white" : "border"}`}
              onClick={() => setTab("PRIORITIES")}
            >
              Priorities
            </button>

            <select
              className="ml-2 rounded border px-3 py-2 text-sm"
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
            >
              {scopes.map((s: Scope) => (
                <option key={s} value={s}>
                  Scope: {s}
                </option>
              ))}
            </select>
          </div>

          {canManage && (
            <button
              className="rounded bg-black px-3 py-2 text-sm text-white"
              onClick={openCreate}
            >
              + Add {tab === "STATUSES" ? "Status" : "Priority"}
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3">Pos</th>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3">Color</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row: any) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3 text-gray-600">{row.position}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.key}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {row.is_default ? "default " : ""}
                    {tab === "STATUSES" && row.is_done ? "done " : ""}
                    {row.is_locked ? "locked " : ""}
                    {!row.is_active ? "inactive" : ""}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{row.color ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded border px-2 py-1 text-xs"
                        onClick={() => openEdit(row)}
                        disabled={!canManage}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded border px-2 py-1 text-xs"
                        onClick={() => onDelete(row)}
                        disabled={!canManage}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {list.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                    No items for scope {scope}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openModal && (
        <MetaModal
          tab={tab}
          boardUuid={board.uuid}
          scope={scope}
          editing={editing}
          onClose={() => setOpenModal(false)}
        />
      )}
    </AuthenticatedLayout>
  );
}

function MetaModal({
  tab,
  boardUuid,
  scope,
  editing,
  onClose,
}: {
  tab: "STATUSES" | "PRIORITIES";
  boardUuid: string;
  scope: Scope;
  editing: any;
  onClose: () => void;
}) {
  const isEdit = !!editing;

  const [key, setKey] = useState(editing?.key ?? "");
  const [name, setName] = useState(editing?.name ?? "");
  const [color, setColor] = useState(editing?.color ?? "");
  const [isDefault, setIsDefault] = useState(!!editing?.is_default);
  const [isDone, setIsDone] = useState(!!editing?.is_done);
  const [isLocked, setIsLocked] = useState(!!editing?.is_locked);
  const [isActive, setIsActive] = useState(editing ? !!editing?.is_active : true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      key,
      name,
      color: color || null,
      is_default: isDefault,
      is_locked: isLocked,
      is_active: isActive,
    };

    if (tab === "STATUSES") payload.is_done = isDone;

    if (!isEdit) {
      payload.scope = scope;
      const r =
        tab === "STATUSES"
          ? route("boards.settings.statuses.store", { board: boardUuid })
          : route("boards.settings.priorities.store", { board: boardUuid });

      router.post(r, payload, { preserveScroll: true, onSuccess: onClose });
      return;
    }

    const r =
      tab === "STATUSES"
        ? route("boards.settings.statuses.update", { board: boardUuid, status: editing.id })
        : route("boards.settings.priorities.update", { board: boardUuid, priority: editing.id });

    router.put(r, payload, { preserveScroll: true, onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">
            {isEdit ? "Edit" : "Create"} {tab === "STATUSES" ? "Status" : "Priority"} ({scope})
          </div>
          <button className="text-sm text-gray-500" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <div className="text-xs text-gray-500">Key</div>
            <input className="w-full rounded border px-3 py-2 text-sm" value={key} onChange={(e) => setKey(e.target.value)} />
          </div>

          <div>
            <div className="text-xs text-gray-500">Name</div>
            <input className="w-full rounded border px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            {/* <div className="text-xs text-gray-500">Color (optional)</div> */}
            {/* <input className="w-full rounded border px-3 py-2 text-sm" value={color} onChange={(e) => setColor(e.target.value)} /> */}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
              Default
            </label>

            {tab === "STATUSES" && (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isDone} onChange={(e) => setIsDone(e.target.checked)} />
                Done
              </label>
            )}

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isLocked} onChange={(e) => setIsLocked(e.target.checked)} />
              Locked
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="rounded border px-3 py-2 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="rounded bg-black px-3 py-2 text-sm text-white">
              {isEdit ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
