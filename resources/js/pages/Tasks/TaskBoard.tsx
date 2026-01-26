import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import { useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";

import TaskTable from "./TaskTable";
import TaskFilter from "./TaskFilter";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailModal from "./TaskDetailModal";

import { Story } from "@/types/story";

type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
type TaskType = "FE" | "BE" | "QA";

export type Task = {
  uuid: string;
  code?: string | null;

  type?: TaskType | null;
  title: string;
  description?: string | null;

  status: TaskStatus;
  priority: TaskPriority;

  created_at: string;
  updated_at: string;

  creator?: { id: number; name: string };
  assignee?: { id: number; name: string; role?: string };

  story?: any;
};

function TaskBoard({
  story,
  tasks,
}: {
  story: Story;
  tasks: Task[];
}) {
  const { auth, epic }: any = usePage().props;

  const role = auth?.user?.role;
  const canCreate = ["PM", "SAD"].includes(role);

  const [openCreate, setOpenCreate] = useState(false);
  // const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <div className="space-y-4 h-full">
      {/* STORY SUMMARY */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-baseline gap-3">
              <div className="text-xl font-semibold text-gray-900">
                {story.title}
              </div>
              <span className="text-sm font-medium text-gray-500">
                {story.code}
              </span>
            </div>

            {story.description && (
              <p className="mt-2 text-sm">{story.description}</p>
            )}

            <div className="mt-4 flex items-start gap-6">
              <div>
                <div className="mb-1 text-xs text-gray-500">Priority</div>
                <Badge variant={story.priority}>{story.priority}</Badge>
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-500">Status</div>
                <Badge variant={story.status}>{story.status}</Badge>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Updated: {story.updated_at ? formatDateTime(story.updated_at) : "-"}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              Created: {story.created_at ? formatDateTime(story.created_at) : "-"}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              CreatedBy: {story.creator?.name ?? "-"}
            </div>
          </div>
        </div>
      </div>

      {/* TASK TABLE CARD */}
      <div className="rounded-xl border bg-white shadow-sm">
        <TaskFilter storyUuid={story.uuid} />

        <div className="border-t" />

        <TaskTable
          tasks={tasks as any}
          
        />
      </div>

     

      <CreateTaskModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        storyUuid={story.uuid}
      />

      {/* <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      /> */}
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
              { label: epic.code, href: route("epics.show", { epic: epic.uuid }) },
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
