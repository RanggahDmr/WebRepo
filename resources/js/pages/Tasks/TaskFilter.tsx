import { useState } from "react";
import CreateTaskModal from "./CreateTaskModal";

type Props = {
  q: string;
  onQ: (v: string) => void;

  statusId: number | null;
  onStatusId: (v: number | null) => void;

  priorityId: number | null;
  onPriorityId: (v: number | null) => void;

  statuses: any[];
  priorities: any[];

  total: number;
  shown: number;

  storyUuid?: string; // optional kalau mau create di sini
};

export default function TaskFilter({
  q,
  onQ,
  statusId,
  onStatusId,
  priorityId,
  onPriorityId,
  statuses,
  priorities,
  total,
  shown,
  storyUuid,
}: Props) {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-5 sm:items-end">
          {/* SEARCH */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium uppercase text-gray-500">
              Search
            </label>
            <input
              type="text"
              placeholder="Search title, description, code..."
              value={q}
              onChange={(e) => onQ(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {/* PRIORITY */}
          <div className="sm:col-span-1">
            <label className="mb-1 block text-xs font-medium uppercase text-gray-500">
              Priority
            </label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
              value={priorityId == null ? "" : String(priorityId)}
              onChange={(e) => onPriorityId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All</option>
              {(priorities ?? []).map((p: any) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div className="sm:col-span-1">
            <label className="mb-1 block text-xs font-medium uppercase text-gray-500">
              Status
            </label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
              value={statusId == null ? "" : String(statusId)}
              onChange={(e) => onStatusId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All</option>
              {(statuses ?? []).map((s: any) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* CLEAR + COUNT */}
          <div className="flex items-center gap-3 sm:col-span-1 sm:justify-end">
            <button
              type="button"
              onClick={() => {
                onQ("");
                onPriorityId(null);
                onStatusId(null);
              }}
              className="h-10 rounded-md border px-4 text-sm hover:bg-gray-50"
            >
              Clear
            </button>
            <div className="text-sm text-gray-500">
              {shown} / {total}
            </div>
          </div>
        </div>

        {/* RIGHT ACTION */}
        {storyUuid && (
          <div className="flex justify-end sm:ml-auto">
            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 sm:w-auto"
            >
              + Create Task
            </button>
          </div>
        )}
      </div>

      {storyUuid && (
        <CreateTaskModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          storyUuid={storyUuid}
        />
      )}
    </>
  );
}
