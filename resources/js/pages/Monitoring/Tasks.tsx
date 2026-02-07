import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { usePage } from "@inertiajs/react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Pagination from "@/components/Pagination";
import { MonitoringDropdown } from "@/components/ui/MonitoringDropdown";

import MonitoringTable from "@/components/Monitoring/MonitoringTable";
import TaskDetailCard from "@/components/Monitoring/TaskDetailCard";

import { useEffect, useState } from "react";
import {
  ProgressCard,
  BoardSelect,
  EpicSelect,
  MasterPrioritySelect,
  MasterStatusSelect,
  SortSelect,
  DirectionSelect,
} from "./_shared";
import ProgressBar from "@/components/Monitoring/ProgressBar";

export default function MonitoringTasks() {
  const { props }: any = usePage();
  const { tasks, progress, filters, boards, epicsOptions, statuses, priorities } = props;

  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [rightOpen, setRightOpen] = useState(false);

  const openTask = (task: any) => {
    setSelectedTask(task);
    setRightOpen(true);
  };

  const closeRight = () => {
    setRightOpen(false);
    setSelectedTask(null);
  };

  // optional: kalau data page berubah (filter/pagination), close sidebar biar gak “stale”
  useEffect(() => {
    setRightOpen(false);
    setSelectedTask(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks?.current_page, filters?.board, filters?.epic, filters?.status_id, filters?.priority_id, filters?.sort, filters?.direction]);

  return (
    <AuthenticatedLayout
      rightSidebar={<TaskDetailCard task={selectedTask} onClose={closeRight} />}
      rightSidebarOpen={rightOpen}
      onCloseRightSidebar={() => setRightOpen(false)}
    >
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Monitoring", href: "/monitoring?tab=tasks" },
        ]}
      />

      <div className="mt-4">
        <MonitoringDropdown current="tasks" carry={["board", "epic"]} />

        <div className="mt-4">
          <ProgressCard progress={progress} />
          <ProgressBar progress={progress} title="Task Progress" unitLabel="Tasks" />
        </div>

        {/* FILTER BAR */}
        <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <BoardSelect
              tab="tasks"
              filters={filters}
              boards={boards}
              // reset filters yang dependent saat ganti board
              resetKeysOnChange={{ epic: "", status_id: "", priority_id: "" }}
            />

            <EpicSelect
              tab="tasks"
              filters={filters}
              epicsOptions={epicsOptions}
              disabled={!filters.board}
            />

            <MasterStatusSelect tab="tasks" filters={filters} statuses={statuses} />
            <MasterPrioritySelect tab="tasks" filters={filters} priorities={priorities} />
            <SortSelect tab="tasks" filters={filters} />
            <DirectionSelect tab="tasks" filters={filters} />
          </div>
        </div>

        {/* LIST */}
        <div className="mt-4 rounded-lg border bg-white shadow-sm">
          <MonitoringTable
            tasks={tasks?.data ?? []}
            onSelectTask={openTask}
            selectedUuid={selectedTask?.uuid ?? null}
          />
        </div>

        <div className="mt-4">
          <Pagination links={tasks?.links ?? []} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
