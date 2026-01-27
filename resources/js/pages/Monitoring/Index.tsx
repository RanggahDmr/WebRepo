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

import StoryDetailCard from "@/components/Monitoring/StoryDetailCard";
import EpicDetailCard from "@/components/Monitoring/EpicDetailCard";

import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";
import Breadcrumbs from "@/components/Breadcrumbs";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useTaskDnD } from "@/hooks/useTaskDnD";
import TaskColumn from "../Tasks/TaskColumn";

import { useEffect, useMemo, useRef, useState } from "react";

const STATUSES = [
  { key: "TODO", label: "TODO" },
  { key: "IN_PROGRESS", label: "IN PROGRESS" },
  { key: "IN_REVIEW", label: "IN REVIEW" },
  { key: "DONE", label: "DONE" },
];

type TabKey = "tasks" | "stories" | "epics";

/** --- Small DnD card for Story/Epic (same look) --- */
function MiniDnDCard({
  item,
  canDrag,
  onOpen,
  kind,
}: {
  item: any;
  canDrag: boolean;
  onOpen: (x: any) => void;
  kind: "story" | "epic";
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: item.uuid,
      disabled: !canDrag,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={() => onOpen(item)}
      className={[
        "w-full text-left rounded-lg border bg-white p-3 shadow-sm hover:bg-gray-50",
        isDragging ? "opacity-70" : "",
      ].join(" ")}
      {...attributes}
      {...listeners}
      title={kind === "story" ? "Open story" : "Open epic"}
    >
      <div className="text-xs font-medium text-gray-500">{item.code ?? "-"}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900 break-words">
        {item.title ?? "-"}
      </div>

      {/* <div className="mt-2 flex gap-2 flex-wrap">
        {item.priority ? <Badge variant={item.priority}>{item.priority}</Badge> : null}
        {item.status ? <Badge variant={item.status}>{item.status}</Badge> : null}
      </div> */}
    </button>
  );
}

/** --- Column wrapper that makes over.id = status --- */
function MiniDnDColumn({
  status,
  title,
  items,
  canDrag,
  onOpen,
  kind,
}: {
  status: string;
  title: string;
  items: any[];
  canDrag: boolean;
  onOpen: (x: any) => void;
  kind: "story" | "epic";
}) {
  return (
    <div className="flex flex-col rounded-xl bg-gray-50 border border-gray-200 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-600">{title}</h3>
        <span className="text-xs text-gray-400">{items.length}</span>
      </div>

      {/* IMPORTANT: droppable target is this status string */}
      <SortableContext
        items={items.map((x) => x.uuid)}
        strategy={verticalListSortingStrategy}
      >
        <div
          id={status}
          className="flex flex-col gap-3 min-h-[40px]"
          // NOTE: DndKit uses "over.id" from the element under pointer.
          // We rely on the wrapping element having id=status and children being sortable items.
        >
          {items.map((x) => (
            <MiniDnDCard
              key={x.uuid}
              item={x}
              canDrag={canDrag}
              onOpen={onOpen}
              kind={kind}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function MonitoringIndex() {
  const {
    tab = "tasks",
    auth,
    filters = {},
    roles = [],

    // tab payloads (only one may exist depending on tab)
    tasks,
    stories,
    epics,

    // shared
    progress,
    boards,
    epicsOptions,
  }: any = usePage().props;

  const currentTab: TabKey = tab;

  const crumbs = [
    { label: "Monitoring", href: route("monitoring.index", { tab: "tasks" }) },
    { label: currentTab === "tasks" ? "Tasks" : currentTab === "stories" ? "Stories" : "Epics" },
  ];

  const canDrag = ["PROGRAMMER", "PM", "SAD"].includes(auth?.user?.role);

  function applyFilter(key: string, value: string) {
    router.get(
      route("monitoring.index"),
      { ...filters, tab: currentTab, [key]: value },
      { preserveState: true, replace: true }
    );
  }

  /** =========================================================
   *  TASKS TAB (DnD + sidebar) — keep your existing behavior
   *  ========================================================= */
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false);

  const [taskItems, setTaskItems] = useState<any[]>(tasks?.data ?? []);
  const lastServerTasksRef = useRef<any[]>(tasks?.data ?? []);

  useEffect(() => {
    if (currentTab !== "tasks") return;
    setTaskItems(tasks?.data ?? []);
    lastServerTasksRef.current = tasks?.data ?? [];
  }, [currentTab, tasks?.data]);

  const { sensors: taskSensors, handleDragEnd: handleTaskDragEnd } = useTaskDnD(
    auth?.user?.role,
    {
      optimisticUpdate: (taskUuid, toStatus) => {
        setTaskItems((prev) =>
          prev.map((t) => (t.uuid === taskUuid ? { ...t, status: toStatus } : t))
        );
      },
      rollback: () => setTaskItems(lastServerTasksRef.current),
    }
  );

  const groupedTasks = useMemo(() => {
    return STATUSES.reduce((acc: any, s) => {
      acc[s.key] = taskItems.filter((t) => t.status === s.key);
      return acc;
    }, {});
  }, [taskItems]);

  const openTask = (task: any) => {
    setSelectedTask(task);
    setTaskSidebarOpen(true);
  };

  /** =========================================================
   *  STORIES TAB (DnD + sidebar)
   *  ========================================================= */
  const serverStories = stories?.data ?? stories ?? [];
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [storySidebarOpen, setStorySidebarOpen] = useState(false);

  const [storyItems, setStoryItems] = useState<any[]>(serverStories);
  const lastServerStoriesRef = useRef<any[]>(serverStories);

  useEffect(() => {
    if (currentTab !== "stories") return;
    setStoryItems(serverStories);
    lastServerStoriesRef.current = serverStories;
  }, [currentTab, serverStories]);

  const openStory = (story: any) => {
    setSelectedStory(story);
    setStorySidebarOpen(true);
  };

  const groupedStories = useMemo(() => {
    return STATUSES.reduce((acc: any, s) => {
      acc[s.key] = storyItems.filter((x) => x.status === s.key);
      return acc;
    }, {});
  }, [storyItems]);

  /** =========================================================
   *  EPICS TAB (DnD + sidebar)
   *  ========================================================= */
  const serverEpics = epics?.data ?? epics ?? [];
  const [selectedEpic, setSelectedEpic] = useState<any | null>(null);
  const [epicSidebarOpen, setEpicSidebarOpen] = useState(false);

  const [epicItems, setEpicItems] = useState<any[]>(serverEpics);
  const lastServerEpicsRef = useRef<any[]>(serverEpics);

  useEffect(() => {
    if (currentTab !== "epics") return;
    setEpicItems(serverEpics);
    lastServerEpicsRef.current = serverEpics;
  }, [currentTab, serverEpics]);

  const openEpic = (epic: any) => {
    setSelectedEpic(epic);
    setEpicSidebarOpen(true);
  };

  const groupedEpics = useMemo(() => {
    return STATUSES.reduce((acc: any, s) => {
      acc[s.key] = epicItems.filter((x) => x.status === s.key);
      return acc;
    }, {});
  }, [epicItems]);

  /** =========================================================
   *  Sensors for Stories/Epics DnD
   *  ========================================================= */
  const genericSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleStoryDragEnd(event: DragEndEvent) {
    if (!canDrag) return;

    const storyUuid = String(event.active?.id ?? "");
    const toStatus = String(event.over?.id ?? ""); // we want status here

    if (!storyUuid || !toStatus) return;

    // if user drops on a card, over.id becomes uuid (NOT status) => ignore
    if (!STATUSES.some((s) => s.key === toStatus)) return;

    // optimistic
    setStoryItems((prev) =>
      prev.map((s) => (s.uuid === storyUuid ? { ...s, status: toStatus } : s))
    );

    router.patch(
      route("stories.update", { story: storyUuid }),
      { status: toStatus },
      {
        preserveScroll: true,
        onError: () => setStoryItems(lastServerStoriesRef.current),
      }
    );
  }

  function handleEpicDragEnd(event: DragEndEvent) {
    if (!canDrag) return;

    const epicUuid = String(event.active?.id ?? "");
    const toStatus = String(event.over?.id ?? "");

    if (!epicUuid || !toStatus) return;
    if (!STATUSES.some((s) => s.key === toStatus)) return;

    setEpicItems((prev) =>
      prev.map((e) => (e.uuid === epicUuid ? { ...e, status: toStatus } : e))
    );

    router.patch(
      route("epics.update", { epic: epicUuid }),
      { status: toStatus },
      {
        preserveScroll: true,
        onError: () => setEpicItems(lastServerEpicsRef.current),
      }
    );
  }

  /** =========================================================
   *  Sidebar per tab
   *  ========================================================= */
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
    >
      <Breadcrumbs items={crumbs} />

      <div className="mt-3">
        <MonitoringDropdown current={currentTab} carry={["board", "epic"]} />
      </div>

      {/* Progress per tab */}
      {currentTab === "tasks" ? (
        <ProgressBar progress={progress} />
      ) : currentTab === "stories" ? (
        <ProgressBarStory progress={progress} />
      ) : (
        <ProgressBarEpic progress={progress} />
      )}

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 flex gap-4 flex-wrap">
        {/* Board (stories/epics) */}
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

        {/* Epic (stories only) */}
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

        {/* Role (optional) */}
        <select
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
          <MonitoringTable
            tasks={taskItems}
            selectedTaskUuid={selectedTask?.uuid ?? null}
            onSelectTask={openTask}
          />

          {tasks?.links ? <Pagination links={tasks.links} /> : null}

          {/* KANBAN TASKS (DnD) */}
          <div className="mt-8">
            <DndContext sensors={taskSensors} onDragEnd={handleTaskDragEnd}>
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
                        {groupedTasks[s.key]?.length ?? 0}
                      </span>
                    </div>

                    <TaskColumn
                      status={s.key}
                      tasks={groupedTasks[s.key] ?? []}
                      canDrag={canDrag}
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
          {/* TABLE STORIES */}
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
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      No stories.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {stories?.links ? <Pagination links={stories.links} /> : null}

          {/* KANBAN STORIES (DnD) */}
          <div className="mt-8">
            <DndContext sensors={genericSensors} onDragEnd={handleStoryDragEnd}>
              <div className="grid grid-cols-4 gap-5">
                {STATUSES.map((s) => (
                  <MiniDnDColumn
                    key={s.key}
                    status={s.key}
                    title={s.label}
                    items={groupedStories[s.key] ?? []}
                    canDrag={canDrag}
                    onOpen={openStory}
                    kind="story"
                  />
                ))}
              </div>
            </DndContext>
          </div>
        </>
      ) : (
        <>
          {/* TABLE EPICS */}
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
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      No epics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {epics?.links ? <Pagination links={epics.links} /> : null}

          {/* KANBAN EPICS (DnD) */}
          <div className="mt-8">
            <DndContext sensors={genericSensors} onDragEnd={handleEpicDragEnd}>
              <div className="grid grid-cols-4 gap-5">
                {STATUSES.map((s) => (
                  <MiniDnDColumn
                    key={s.key}
                    status={s.key}
                    title={s.label}
                    items={groupedEpics[s.key] ?? []}
                    canDrag={canDrag}
                    onOpen={openEpic}
                    kind="epic"
                  />
                ))}
              </div>
            </DndContext>
          </div>
        </>
      )}
    </AuthenticatedLayout>
  );
}
