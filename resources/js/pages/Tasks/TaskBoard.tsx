import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { DndContext } from "@dnd-kit/core";
import { router, usePage } from "@inertiajs/react";
import { useTaskDnD } from "./useTaskDnD";
import route from "@/lib/route";
import { DragEndEvent } from "@dnd-kit/core";
import TaskColumn from "./TaskColumn";
import { useState } from "react";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailModal from "./TaskDetailModal";
import {Head} from "@inertiajs/react";
import Breadcrumbs from "@/components/Breadcrumbs";


type TaskType = "FE" | "BE" | "QA";
type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

type Task = {
  id: number;
  type: TaskType;
  title: string;
  description?: string | null;
  status: TaskStatus;
};


type Story = {
  id: number;
  code: string;
};

const STATUSES = [
  { key: "TODO", label: "TODO" },
  { key: "IN_PROGRESS", label: "IN PROGRESS" },
  { key: "IN_REVIEW", label: "IN REVIEW" },
  { key: "DONE", label: "DONE" },
] as const;



function TaskBoard({
  story,
  tasks,
}: {
  story: Story;
  tasks: Task[];
}) {
    const { auth }: any = usePage().props;
    const canCreate = ["PM", "SAD"].includes(auth.user.role);
    const role = auth.user.role;
    const [openCreate, setOpenCreate] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);


  const grouped = STATUSES.reduce(
    (acc, s) => {
      acc[s.key] = tasks.filter((t) => t.status === s.key);
      return acc;
    },
    {} as Record<Task["status"], Task[]>
  );

const canMoveTo = (toStatus: string) => {
  if (role === "PROGRAMMER") {
    return ["IN_PROGRESS", "IN_REVIEW"].includes(toStatus);
  }
  if (["PM", "SAD"].includes(role)) return true;
  return false; 
};


// const { handleDragEnd } = useTaskDnD(tasks, (taskId, status, position) => {
//   if (!canMoveTo(status)) return;

//   router.patch(route("tasks.update", taskId), {
//     status,
//     position,
//   });
// });


function handleDragEnd(event: DragEndEvent) {
  console.log("DRAG END FIRED", event);
  const { active, over } = event;
  if (!over) return;

  const taskId = Number(active.id);
  const toStatus = over.id as TaskStatus;

  // role restriction (UX layer)
  if (role === "PROGRAMMER" && toStatus === "DONE") return;
  

  console.log({
  taskId,
  toStatus,
  overId: over.id,
  overData: over.data.current,
});
  router.patch(`/tasks/${taskId}`, {
  status: toStatus,
  position: 0,
});

}


return (
  <div className="space-y-4 h-full">
    {/* CARD CONTAINER */}
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      {/* CARD HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Tasks
            <span className="ml-2 text-sm font-normal text-gray-500">
              {story.code}
            </span>
          </h3>
        </div>

        {canCreate && (
          <button
            onClick={() => setOpenCreate(true)}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            + Add Task
          </button>
        )}
      </div>

      {/* KANBAN */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-5 flex-1">
          {STATUSES.map((s) => (
            <div
              key={s.key}
              className="flex flex-col rounded-xl bg-gray-50 border border-gray-200 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-wide text-gray-600">
                  {s.label}
                </h3>
                <span className="text-xs text-gray-400">
                  {grouped[s.key].length}
                </span>
              </div>

              <TaskColumn
                status={s.key}
                tasks={grouped[s.key]}
                canDrag={["PROGRAMMER", "PM", "SAD"].includes(role)}
                onOpenTask={(task: Task) => setSelectedTask(task)}
              />
            </div>
          ))}
        </div>
      </DndContext>
    </div>

    {/* MODALS */}
    <CreateTaskModal
      open={openCreate}
      onClose={() => setOpenCreate(false)}
      storyCode={story.code}
    />

    <TaskDetailModal
      task={selectedTask}
      onClose={() => setSelectedTask(null)}
    />
  </div>
);

}

TaskBoard.layout = (page: any) => {
  const { epic, story } = page.props;

  return (
    <AuthenticatedLayout
      header={
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>

          <Breadcrumbs
            items={[
           
            { label: "Epics", href: route("dashboard") },
            {
              label: epic.code,
              href: route("epics.show", epic.code),
            },
            { label: story.code },
          ]}
          />
        </div>
      }
    >
      <Head title={`Tasks - ${story.code}`} />
      {page}
    </AuthenticatedLayout>
  );
};



export default TaskBoard;
