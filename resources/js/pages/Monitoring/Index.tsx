import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { router, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import MonitoringTable from "@/components/Monitoring/MonitoringTable";
import Pagination from "@/components/Pagination";
import ProgressBar from "@/components/Monitoring/ProgressBar";
import { DndContext } from "@dnd-kit/core";
import { useTaskDnD } from "@/hooks/useTaskDnD";
import TaskColumn from "../Tasks/TaskColumn";
import { useState, useEffect, useMemo, useRef } from "react";
import TaskDetailCard from "@/components/Monitoring/TaskDetailCard";


const STATUSES = [
  { key: "TODO", label: "TODO" },
  { key: "IN_PROGRESS", label: "IN PROGRESS" },
  { key: "IN_REVIEW", label: "IN REVIEW" },
  { key: "DONE", label: "DONE" },
];

export default function MonitoringIndex() {
  const { tasks, filters, roles, auth, progress }: any = usePage().props;

  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false)


  const [taskItems, setTaskItems] = useState<any[]>(tasks.data);
  const lastServerTasksRef = useRef<any[]>(tasks.data);


   useEffect(() => {
    setTaskItems(tasks.data);
    lastServerTasksRef.current = tasks.data;
  }, [tasks.data]);

  const { sensors, handleDragEnd } = useTaskDnD(auth.user.role, {
    optimisticUpdate: (taskId, toStatus) => {
      setTaskItems((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: toStatus } : t))
      );
    },
    rollback: () => {
      setTaskItems(lastServerTasksRef.current);
    },
  });
  const grouped = useMemo(() => {
    return STATUSES.reduce((acc: any, s) => {
      acc[s.key] = taskItems.filter((t) => t.status === s.key);
      return acc;
    }, {});
  }, [taskItems]);

  function applyFilter(key: string, value: string) {
    router.get(
      route("monitoring.index"),
      { ...filters, [key]: value },
      { preserveState: true, replace: true }
    );
  }
  const openTask = (task: any) => {
  setSelectedTask(task);
  setSidebarOpen(true);
};


  return (
    <AuthenticatedLayout
     header={<h1 className="text-xl font-semibold">Monitoring Tasks</h1>}
     rightSidebarOpen={sidebarOpen}
      rightSidebar={
        sidebarOpen ? (
          <TaskDetailCard
            task={selectedTask}
            onClose={() => {
              setSidebarOpen(false);
              setSelectedTask(null);
            }}
          />
        ) : null
      }
>
      <ProgressBar progress={progress} />

      {/* FILTER */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 flex gap-4 flex-wrap">
        <select
          value={filters.role || ""}
          onChange={(e) => applyFilter("role", e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Roles</option>
          {roles.map((r: string) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={filters.status || ""}
          onChange={(e) => applyFilter("status", e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Status</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="IN_REVIEW">IN REVIEW</option>
          <option value="DONE">DONE</option>
        </select>

        <select
          value={filters.priority || ""}
          onChange={(e) => applyFilter("priority", e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <select
          value={filters.direction || "desc"}
          onChange={(e) =>
            router.get(
              route("monitoring.index"),
              { ...filters, direction: e.target.value },
              { preserveState: true, replace: true }
            )
          }
          className="border rounded px-2 py-1"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* TABLE */}
      <MonitoringTable
        tasks={tasks.data}
        selectedTaskId={selectedTask?.id ?? null}
        onSelectTask={openTask}
      />

      <Pagination links={tasks.links} />

      {/* KANBAN (DnD) */}
      <div className="mt-8">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-4 gap-5">
            {STATUSES.map((s) => (
              <div
                key={s.key}
                className="flex flex-col rounded-xl bg-gray-50 border border-gray-200 p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-600">
                    {s.label}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {grouped[s.key].length}
                  </span>
                </div>

                <TaskColumn
                  status={s.key}
                  tasks={grouped[s.key]}
                  canDrag={["PROGRAMMER", "PM", "SAD"].includes(auth.user.role)}
                  onOpenTask={openTask}
                />
              </div>
            ))}
          </div>
        </DndContext>
      </div>
    </AuthenticatedLayout>
  );
}
