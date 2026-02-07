import { Head, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import route from "@/lib/route";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import Breadcrumbs from "@/components/Breadcrumbs";
import formatDateTime from "@/lib/date";
import Badge from "@/components/ui/Badge";

import TaskTable from "./TaskTable";
import TaskFilter from "./TaskFilter";

import type { Task } from "@/types/task";
import type { Story } from "@/types/story";
import type { Epic } from "@/types/epic";
import { normalizeText, pickDefaultId } from "@/lib/master";

type MasterItem = {
  id: number;
  key: string;
  name: string;
  is_default?: boolean;
};

export default function TaskBoard({
  
  story,
  tasks,
  epic,
}: {
  story: Story;
  tasks: Task[];
  epic: Epic;
}) {
  
  const page = usePage<{
    taskStatuses: MasterItem[];
    taskPriorities: MasterItem[];
  }>();

  const taskStatuses = page.props.taskStatuses ?? [];
  const taskPriorities = page.props.taskPriorities ?? [];

  const storyPriorityColor = (story as any).priorityMaster?.color ?? null;
  const storyStatusColor = (story as any).statusMaster?.color ?? null;

  const defaultStatusId = pickDefaultId(taskStatuses, "backlog");

  const [q, setQ] = useState("");
  const [statusId, setStatusId] = useState<number | null>(defaultStatusId);
  const [priorityId, setPriorityId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const qq = normalizeText(q);

    return (tasks ?? []).filter((t) => {
      const matchQ =
        !qq ||
        normalizeText(t.title).includes(qq) ||
        normalizeText(t.description).includes(qq) ||
        normalizeText(t.code).includes(qq);

      const tStatusId = t.status_id ?? t.statusMaster?.id ?? null;
      const tPriorityId = t.priority_id ?? t.priorityMaster?.id ?? null;

      const matchStatus = statusId == null ? true : tStatusId === statusId;
      const matchPriority = priorityId == null ? true : tPriorityId === priorityId;

      return matchQ && matchStatus && matchPriority;
    });
  }, [tasks, q, statusId, priorityId]);

  const storyPriorityLabel =
    (story as any).priorityMaster?.name ?? (story as any).priority ?? "-";
  const storyStatusLabel =
    (story as any).statusMaster?.name ?? (story as any).status ?? "-";

  return (
    <div className="space-y-4 h-full">
      {/* STORY SUMMARY */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-baseline gap-3">
          <div className="text-xl font-semibold text-gray-900">{story.title}</div>
          <span className="text-sm font-medium text-gray-500">{story.code}</span>
        </div>

        <div className="mt-4 flex items-start gap-6">
          <div>
            <div className="mb-1 text-xs text-gray-500">Priority</div>
            <Badge variant={storyPriorityLabel as any} color={storyPriorityColor}>
  {storyPriorityLabel}
</Badge>



          </div>

          <div>
            <div className="mb-1 text-xs text-gray-500">Status</div>
            <Badge variant={storyStatusLabel as any} color={storyStatusColor}>
  {storyStatusLabel}
</Badge>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Updated: {story.updated_at ? formatDateTime(story.updated_at) : "-"}
        </div>
      </div>

      {/* TASK TABLE CARD */}
      <div className="rounded-xl border bg-white shadow-sm">
        <TaskFilter
          q={q}
          onQ={setQ}
          statusId={statusId}
          onStatusId={setStatusId}
          priorityId={priorityId}
          onPriorityId={setPriorityId}
          statuses={taskStatuses}
          priorities={taskPriorities}
          total={tasks?.length ?? 0}
          shown={filtered.length}
          storyUuid={story.uuid} //  tombol create di filter
        />

        <div className="border-t" />

        <TaskTable tasks={filtered} />
      </div>
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
