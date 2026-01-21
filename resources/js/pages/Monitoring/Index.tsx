import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { router, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import MonitoringTable from "@/components/Monitoring/MonitoringTable";
import Pagination from "@/components/Pagination";
import ProgressBar from "@/components/Monitoring/ProgressBar";
import { DndContext } from "@dnd-kit/core";
import { useTaskDnD } from "@/hooks/useTaskDnD";
import TaskColumn from "../Tasks/TaskColumn";

const STATUSES = [
  { key: "TODO", label: "TODO" },
  { key: "IN_PROGRESS", label: "IN PROGRESS" },
  { key: "IN_REVIEW", label: "IN REVIEW" },
  { key: "DONE", label: "DONE" },
];

export default function MonitoringIndex() {
  const { tasks, filters, roles, auth, progress }: any = usePage().props;

  const { handleDragEnd } = useTaskDnD(auth.user.role);

  const grouped = STATUSES.reduce(
    (acc, s) => {
      acc[s.key] = tasks.data.filter((t: any) => t.status === s.key);
      return acc;
    },
    {} as Record<string, any[]>
  );

  function applyFilter(key: string, value: string) {
    router.get(
      route("monitoring.index"),
      { ...filters, [key]: value },
      { preserveState: true, replace: true }
    );
  }

 function applySort(field: string) {
  const direction =
    filters.sort === field && filters.direction === "asc"
      ? "desc"
      : "asc";

  router.get(
    route("monitoring.index"),
    {
      ...filters,
      sort: field,
      direction,
    },
    { preserveState: true, replace: true }
  );
}


  return (
    <AuthenticatedLayout
      header={<h1 className="text-xl font-semibold">Monitoring Tasks</h1>}
      
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
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {/* SORT BY DATE */}
        {/* <select
        value={filters.sort || "created_at"}
        onChange={(e) => applySort(e.target.value)}
        className="border rounded px-2 py-1"
        >
        <option value="created_at">Sort by Created Date</option> 
        <option value="updated_at">Sort by Updated Date</option> 
        </select> */}

      


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

        {/* <input
          type="date"
          value={filters.date_from || ""}
          onChange={(e) => applyFilter("date_from", e.target.value)}
          className="border rounded px-2 py-1"
        />

        <input
          type="date"
          value={filters.date_to || ""}
          onChange={(e) => applyFilter("date_to", e.target.value)}
          className="border rounded px-2 py-1"
        /> */}

          <select
        value={filters.direction || "desc"}
        onChange={(e) =>
            router.get(
            route("monitoring.index"),
            {
                ...filters,
                direction: e.target.value,
            },
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
      <MonitoringTable tasks={tasks.data} />
      <Pagination links={tasks.links} />

      {/* KANBAN (DnD) */}
      <div className="mt-8">
        <DndContext onDragEnd={handleDragEnd}>
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
                  onOpenTask={() => {}}
                />
              </div>
            ))}
          </div>
        </DndContext>
      </div>
    </AuthenticatedLayout>
  );
}
