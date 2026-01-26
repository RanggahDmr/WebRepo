import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { router, usePage } from "@inertiajs/react";
import route from "@/lib/route";

import Pagination from "@/components/Pagination";
import { MonitoringDropdown } from "@/components/ui/MonitoringDropdown";

import ProgressBar from "@/components/Monitoring/ProgressBar";
import ProgressBarStory from "@/components/Monitoring/ProgressBarStory";
import ProgressBarEpic from "@/components/Monitoring/ProgressBarEpic";

import MonitoringTable from "@/components/Monitoring/MonitoringTable";
import TaskDetailCard from "@/components/Monitoring/TaskDetailCard";

import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";

import { DndContext } from "@dnd-kit/core";
import { useTaskDnD } from "@/hooks/useTaskDnD";
import TaskColumn from "../Tasks/TaskColumn";

import StoryDetailCard from "@/components/Monitoring/StoryDetailCard";
import EpicDetailCard from "@/components/Monitoring/EpicDetailCard";

import { useEffect, useMemo, useRef, useState } from "react";

import Breadcrumbs from "@/components/Breadcrumbs";

const STATUSES = [
  { key: "TODO", label: "TODO" },
  { key: "IN_PROGRESS", label: "IN PROGRESS" },
  { key: "IN_REVIEW", label: "IN REVIEW" },
  { key: "DONE", label: "DONE" },
];

type TabKey = "tasks" | "stories" | "epics";

export default function MonitoringIndex() {
  const {
    tab = "tasks",
    auth,
    filters,
    roles,

    // tasks
    tasks,
    // stories
    stories,
    // epics
    epics,

    // shared
    progress,
    boards,
    epicsOptions,
  }: any = usePage().props;

  const crumbs = [
    { label: "Monitoring", href: route("monitoring.index", { tab: "tasks" }) },
  {  label: tab === "tasks" ? "Tasks" : tab === "stories" ? "Stories" : "Epics" },

  ]

  const currentTab: TabKey = tab;

  // ===== helpers =====
  function applyFilter(key: string, value: string) {
    router.get(
      route("monitoring.index"),
      { ...filters, tab: currentTab, [key]: value },
      { preserveState: true, replace: true }
    );
  }

  // =========================
  // TAB: TASKS (DnD + sidebar)
  // =========================
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false);

  const [taskItems, setTaskItems] = useState<any[]>(tasks?.data ?? []);
  const lastServerTasksRef = useRef<any[]>(tasks?.data ?? []);

  useEffect(() => {
    if (currentTab !== "tasks") return;
    setTaskItems(tasks?.data ?? []);
    lastServerTasksRef.current = tasks?.data ?? [];
  }, [currentTab, tasks?.data]);

  const { sensors, handleDragEnd } = useTaskDnD(auth?.user?.role, {
    optimisticUpdate: (taskUuid, toStatus) => {
      setTaskItems((prev) =>
        prev.map((t) => (t.uuid === taskUuid ? { ...t, status: toStatus } : t))
      );
    },
    rollback: () => setTaskItems(lastServerTasksRef.current),
  });

  const grouped = useMemo(() => {
    return STATUSES.reduce((acc: any, s) => {
      acc[s.key] = taskItems.filter((t) => t.status === s.key);
      return acc;
    }, {});
  }, [taskItems]);

  const openTask = (task: any) => {
    setSelectedTask(task);
    setTaskSidebarOpen(true);
  };

  // =========================
  // TAB: STORIES (sidebar)
  // =========================
  const storyItems = stories?.data ?? stories ?? [];
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [storySidebarOpen, setStorySidebarOpen] = useState(false);

  useEffect(() => {
    if (currentTab !== "stories") return;
    if (!selectedStory) return;
    const exists = (storyItems ?? []).some((s: any) => s.uuid === selectedStory.uuid);
    if (!exists) {
      setSelectedStory(null);
      setStorySidebarOpen(false);
    }
  }, [currentTab, storyItems, selectedStory]);

  const openStory = (story: any) => {
    setSelectedStory(story);
    setStorySidebarOpen(true);
  };

  // =========================
  // TAB: EPICS (sidebar)
  // =========================
  const epicItems = epics?.data ?? epics ?? [];
  const [selectedEpic, setSelectedEpic] = useState<any | null>(null);
  const [epicSidebarOpen, setEpicSidebarOpen] = useState(false);

  useEffect(() => {
    if (currentTab !== "epics") return;
    if (!selectedEpic) return;
    const exists = (epicItems ?? []).some((e: any) => e.uuid === selectedEpic.uuid);
    if (!exists) {
      setSelectedEpic(null);
      setEpicSidebarOpen(false);
    }
  }, [currentTab, epicItems, selectedEpic]);

  const openEpic = (epic: any) => {
    setSelectedEpic(epic);
    setEpicSidebarOpen(true);
  };

  // ===== Layout sidebar switch =====
  const rightSidebarOpen =
    currentTab === "tasks"
      ? taskSidebarOpen
      : currentTab === "stories"
      ? storySidebarOpen
      : epicSidebarOpen;

  const rightSidebar =
    currentTab === "tasks" ? (
      taskSidebarOpen ? (
        <TaskDetailCard
          task={selectedTask}
          onClose={() => {
            setTaskSidebarOpen(false);
            setSelectedTask(null);
          }}
        />
      ) : null
    ) : currentTab === "stories" ? (
      storySidebarOpen ? (
        <StoryDetailCard
          story={selectedStory}
          onClose={() => {
            setStorySidebarOpen(false);
            setSelectedStory(null);
          }}
        />
      ) : null
    ) : epicSidebarOpen ? (
      <EpicDetailCard
        epic={selectedEpic}
        onClose={() => {
          setEpicSidebarOpen(false);
          setSelectedEpic(null);
        }}
      />
    ) : null;

  // ===== Header title =====
  const headerTitle =
    currentTab === "tasks"
      ? "Monitoring Tasks"
      : currentTab === "stories"
      ? "Monitoring Stories"
      : "Monitoring Epics";

  return (
    <AuthenticatedLayout
      header={<h1 className="text-xl font-semibold">{headerTitle}</h1>}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebar={rightSidebar}
    ><Breadcrumbs items={crumbs} />
    <div className="mt-3">
      <MonitoringDropdown current={tab} carry={["board", "epic"]} />
    </div>

      {/* Progress bar per tab */}
      {currentTab === "tasks" ? (
        <ProgressBar progress={progress} />
      ) : currentTab === "stories" ? (
        <ProgressBarStory progress={progress} />
      ) : (
        <ProgressBarEpic progress={progress} />
      )}

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 flex gap-4 flex-wrap">
        {/* board filter (stories/epics) */}
        {currentTab !== "tasks" ? (
          <select
            value={filters.board || ""}
            onChange={(e) => applyFilter("board", e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All Boards</option>
            {boards?.map((b: any) => (
              <option key={b.uuid} value={b.uuid}>
                {b.title} ({b.squad_code})
              </option>
            ))}
          </select>
        ) : null}

        {/* epic filter (stories only) */}
        {currentTab === "stories" ? (
          <select
            value={filters.epic || ""}
            onChange={(e) => applyFilter("epic", e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All Epics</option>
            {epicsOptions?.map((e: any) => (
              <option key={e.uuid} value={e.uuid}>
                {e.code} — {e.title}
              </option>
            ))}
          </select>
        ) : null}

        {/* role (tasks = assignee, stories/epics = creator) */}
        {/* <select
          value={filters.role || ""}
          onChange={(e) => applyFilter("role", e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Roles</option>
          {(roles ?? []).map((r: string) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
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

        <select
          value={filters.direction || "desc"}
          onChange={(e) =>
            router.get(
              route("monitoring.index"),
              { ...filters, tab: currentTab, direction: e.target.value },
              { preserveState: true, replace: true }
            )
          }
          className="border rounded px-2 py-1"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* ========================= */}
      {/* TAB CONTENT */}
      {/* ========================= */}

      {currentTab === "tasks" ? (
        <>
          {/* TABLE */}
          <MonitoringTable
            tasks={taskItems}
            selectedTaskUuid={selectedTask?.uuid ?? null}
            onSelectTask={openTask}
          />

          {tasks?.links ? <Pagination links={tasks.links} /> : null}

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
                        {grouped[s.key]?.length ?? 0}
                      </span>
                    </div>

                    <TaskColumn
                      status={s.key}
                      tasks={grouped[s.key] ?? []}
                      canDrag={["PROGRAMMER", "PM", "SAD"].includes(auth?.user?.role)}
                      onOpenTask={openTask}
                    />
                  </div>
                ))}
              </div>
            </DndContext>
          </div>
        </>
      ) : currentTab === "stories" ? (
        <>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 w-[12%]">CODE</th>
                  <th className="px-6 py-3 w-[40%]">WORK</th>
                  <th className="px-6 py-3 w-[12%]">PRIORITY</th>
                  <th className="px-6 py-3 w-[14%]">STATUS</th>
                  <th className="px-6 py-3 w-[12%]">CREATED</th>
                  <th className="px-6 py-3 w-[12%]">UPDATED</th>
                  <th className="px-6 py-3 w-[10%]">CREATED BY</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {storyItems.map((s: any) => {
                  const selected = selectedStory?.uuid === s.uuid;

                  return (
                    <tr
                      key={s.uuid}
                      onClick={() => openStory(s)}
                      className={[
                        "cursor-pointer hover:bg-gray-50",
                        selected ? "bg-gray-50" : "",
                      ].join(" ")}
                    >
                      <td className="px-6 py-3 font-medium text-blue-600">
                        {s.code}
                      </td>

                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900">{s.title}</div>
                      </td>

                      <td className="px-6 py-3">
                        <Badge variant={s.priority}>{s.priority}</Badge>
                      </td>

                      <td className="px-6 py-3">
                        <Badge variant={s.status}>{s.status}</Badge>
                      </td>

                      <td className="px-6 py-3 text-gray-700">
                        {formatDateTime(s.created_at)}
                      </td>

                      <td className="px-6 py-3 text-gray-700">
                        {formatDateTime(s.updated_at)}
                      </td>

                      <td className="px-6 py-3 text-gray-700">
                        {s.creator?.role ? `${s.creator.role} ` : ""}
                        {s.creator?.name ?? "-"}
                      </td>
                    </tr>
                  );
                })}

                {!storyItems.length && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      No stories.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {stories?.links ? <Pagination links={stories.links} /> : null}
        </>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 w-[12%]">CODE</th>
                  <th className="px-6 py-3 w-[40%]">WORK</th>
                  <th className="px-6 py-3 w-[12%]">PRIORITY</th>
                  <th className="px-6 py-3 w-[14%]">STATUS</th>
                  <th className="px-6 py-3 w-[12%]">CREATED</th>
                  <th className="px-6 py-3 w-[12%]">UPDATED</th>
                  <th className="px-6 py-3 w-[10%]">CREATED BY</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {epicItems.map((e: any) => {
                  const selected = selectedEpic?.uuid === e.uuid;

                  return (
                    <tr
                      key={e.uuid}
                      onClick={() => openEpic(e)}
                      className={[
                        "cursor-pointer hover:bg-gray-50",
                        selected ? "bg-gray-50" : "",
                      ].join(" ")}
                    >
                      <td className="px-6 py-3 font-medium text-blue-600">
                        {e.code}
                      </td>

                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900">{e.title}</div>
                      </td>

                      <td className="px-6 py-3">
                        <Badge variant={e.priority}>{e.priority}</Badge>
                      </td>

                      <td className="px-6 py-3">
                        <Badge variant={e.status}>{e.status}</Badge>
                      </td>

                      <td className="px-6 py-3 text-gray-700">
                        {formatDateTime(e.created_at)}
                      </td>

                      <td className="px-6 py-3 text-gray-700">
                        {formatDateTime(e.updated_at)}
                      </td>

                      <td className="px-6 py-3 text-gray-700">
                        {e.creator?.role ? `${e.creator.role} ` : ""}
                        {e.creator?.name ?? "-"}
                      </td>
                    </tr>
                  );
                })}

                {!epicItems.length && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      No epics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {epics?.links ? <Pagination links={epics.links} /> : null}
        </>
      )}
    </AuthenticatedLayout>
  );
}
