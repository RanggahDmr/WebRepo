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
  import TaskTable from "./TaskTable";
  import TaskFilter from "./TaskFilter";
  import { Story } from "@/types/story";

  import Badge from "@/components/ui/Badge";
  import formatDateTime from "@/lib/date";



  type TaskType = "FE" | "BE" | "QA";
  type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
  type Task = {
    id: number;
    type: TaskType;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
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

  
  {/* STORY SUMMARY */}
  <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between gap-6">
      {/* LEFT */}
      <div className="flex-1">
        {/* TITLE + CODE */}
        <div className="flex items-baseline gap-3">
          <div className="text-xl font-semibold text-gray-900">
            {story.title}
          </div>

          <span className="text-sm font-medium text-gray-500">
            {story.code}
          </span>
        </div>

        {/* DESCRIPTION */}
        {story.description && (
          <p className="mt-2 text-sm">
            {story.description}
          </p>
        )}

        {/* PRIORITY & STATUS */}
        <div className="mt-4 flex items-start gap-6">
          <div>
            <div className="mb-1 text-xs text-gray-500">
              Priority
            </div>
            <Badge variant={story.priority}>
              {story.priority}
            </Badge>
          </div>

          <div>
            <div className="mb-1 text-xs text-gray-500">
              Status
            </div>
            <Badge variant={story.status}>
              {story.status}
            </Badge>
          </div>
        </div>

        {/* UPDATED AT */}
        <div className="mt-4 text-sm text-gray-600">
          Updated:{" "}
          {story.updated_at
            ? formatDateTime(story.updated_at)
            : "-"}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Created:{" "}
          {story.created_at
            ? formatDateTime(story.created_at)
            : "-"}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          CreatedBy: {story.creator?.name ?? "-"}
        </div>
      </div>

 
  </div>
</div>


      {/* TASK TABLE CARD */}
      <div className="rounded-xl border bg-white shadow-sm">
        {/* FILTER */}
        <TaskFilter storyCode={story.code} />


        <div className="border-t" />

        {/* TABLE */}
        <TaskTable tasks={tasks} />
      </div>



    {/* TASKS CARD (KANBAN) */}
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            
            <span className="ml-2 text-sm font-normal text-gray-500">
            
            </span>
          </h3>

          {story.description && (
            <p className="mt-1 text-sm text-gray-500">
              
            </p>
          )}
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

      
    </div>

    
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
           
            { label: "Board", href: route("dashboard") },
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
