import { useState } from "react";
import Badge from "@/components/ui/Badge";
import { Task } from "@/types/task";
import TaskDetailModal from "./TaskDetailModal";

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function displayTaskCode(task: any) {
  if (task?.code) return task.code;
  if (task?.uuid) return `TSK-${String(task.uuid).slice(0, 8).toUpperCase()}`;
  return "-";
}

export default function TaskTable({ tasks }: { tasks: Task[] }) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (!tasks.length) {
    return <div className="py-10 text-center text-sm text-gray-500">No tasks.</div>;
  }

  function openTask(task: Task) {
    setSelectedTask(task);
  }

  function closeTask() {
    setSelectedTask(null);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm table-fixed">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 w-[6%]">ID</th>
              <th className="px-4 py-3 w-[22%]">Title</th>
              <th className="px-4 py-3 w-[22%]">Description</th>
              <th className="px-4 py-3 w-[8%]">Status</th>
              <th className="px-4 py-3 w-[15%]">Priority</th>
              <th className="px-4 py-3 w-[15%]">Updated at</th>
              <th className="px-4 py-3 w-[14%]">Created at</th>
              <th className="px-4 py-3 w-[12%]">Created by</th>
              <th className="px-4 py-3 w-[6%] text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr
                key={(task as any).uuid}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                {/* ID */}
                <td
                  className="px-4 py-3 text-blue-600 font-medium cursor-pointer hover:underline"
                  onClick={() => openTask(task)}
                >
                  {displayTaskCode(task)}
                </td>

                {/* TITLE */}
                <td
                  className="px-4 py-3 align-top cursor-pointer"
                  onClick={() => openTask(task)}
                >
                  <div className="font-medium text-gray-900">{task.title}</div>
                </td>

                {/* DESCRIPTION */}
                <td className="px-4 py-3 align-top">{task.description || "-"}</td>

                {/* STATUS */}
                <td className="px-4 py-3 align-top">
                  <Badge variant={task.status}>{task.status}</Badge>
                </td>

                {/* PRIORITY */}
                <td className="px-4 py-3 align-top">
                  <Badge variant={task.priority}>{task.priority}</Badge>
                </td>

                {/* UPDATED AT */}
                <td className="px-4 py-3 text-xs text-gray-600">
                  {formatDate((task as any).updated_at)}
                </td>

                {/* CREATED AT */}
                <td className="px-4 py-3 text-xs text-gray-600">
                  {formatDate((task as any).created_at)}
                </td>

                {/* CREATED BY */}
                <td className="px-4 py-3 text-sm text-gray-700">
                  {(task as any).creator?.name ?? "-"}
                </td>

                {/* ACTION */}
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => openTask(task)}
                    className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={closeTask} />}
    </>
  );
}
