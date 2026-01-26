import { useState } from "react";
import CreateTaskModal from "./CreateTaskModal";

type TaskFilterProps = {
  storyUuid: string;
};

export default function TaskFilter({ storyUuid }: TaskFilterProps) {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 p-4">
        {/* LEFT FILTERS */}
        <div className="flex flex-wrap items-end gap-4">
          {/* SEARCH */}
          <div className="w-64">
            <label className="mb-1 block text-xs font-medium uppercase text-gray-500">
              Search
            </label>
            <input
              type="text"
              placeholder="Search title, description, code..."
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* PRIORITY */}
          <div className="w-36">
            <label className="mb-1 block text-xs font-medium uppercase text-gray-500">
              Priority
            </label>
            <select className="w-full rounded-md border px-3 py-2 text-sm">
              <option>All</option>
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
            </select>
          </div>

          {/* STATUS */}
          <div className="w-36">
            <label className="mb-1 block text-xs font-medium uppercase text-gray-500">
              Status
            </label>
            <select className="w-full rounded-md border px-3 py-2 text-sm">
              <option>All</option>
              <option>TODO</option>
              <option>IN_PROGRESS</option>
              <option>DONE</option>
            </select>
          </div>

          {/* CLEAR */}
          <button
            type="button"
            className="h-10 rounded-md border px-4 text-sm hover:bg-gray-50"
          >
            Clear
          </button>

          {/* COUNT */}
          <div className="text-sm text-gray-500">3 / 3</div>
        </div>

        {/* RIGHT ACTION */}
        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Create Task
        </button>
      </div>

      {/* CREATE TASK MODAL */}
      <CreateTaskModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        storyUuid={storyUuid}
      />
    </>
  );
}
