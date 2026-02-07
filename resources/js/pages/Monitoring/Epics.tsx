import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { usePage } from "@inertiajs/react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Pagination from "@/components/Pagination";
import { MonitoringDropdown } from "@/components/ui/MonitoringDropdown";

import MonitoringTable from "@/components/Monitoring/MonitoringTable";
import EpicDetailCard from "@/components/Monitoring/EpicDetailCard";

import { useEffect, useState } from "react";
import ProgressBar from "@/components/Monitoring/ProgressBar";
import {
  BoardSelect,
  MasterPrioritySelect,
  MasterStatusSelect,
  SortSelect,
  DirectionSelect,
} from "./_shared";

export default function MonitoringEpics() {
  const { props }: any = usePage();
  const { epics, progress, filters, boards, statuses, priorities } = props;

  const [selectedEpic, setSelectedEpic] = useState<any | null>(null);
  const [rightOpen, setRightOpen] = useState(false);

  const openEpic = (epic: any) => {
    setSelectedEpic(epic);
    setRightOpen(true);
  };

  const closeRight = () => {
    setRightOpen(false);
    setSelectedEpic(null);
  };

  // close when query changes (avoid stale detail)
  useEffect(() => {
    setRightOpen(false);
    setSelectedEpic(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epics?.current_page, filters?.board, filters?.status_id, filters?.priority_id, filters?.sort, filters?.direction]);

  return (
    <AuthenticatedLayout
      rightSidebar={<EpicDetailCard epic={selectedEpic} onClose={closeRight} />}
      rightSidebarOpen={rightOpen}
      onCloseRightSidebar={() => setRightOpen(false)}
    >
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Monitoring", href: "/monitoring?tab=epics" },
        ]}
      />

      <div className="mt-4">
        <MonitoringDropdown current="epics" carry={["board"]} />

        <div className="mt-4">
          <ProgressBar progress={progress} title="Epic Progress" unitLabel="Epics" />
        </div>

        {/* FILTER BAR */}
        <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <BoardSelect
              tab="epics"
              filters={filters}
              boards={boards}
              resetKeysOnChange={{ status_id: "", priority_id: "" }}
            />

            <MasterStatusSelect tab="epics" filters={filters} statuses={statuses} />
            <MasterPrioritySelect tab="epics" filters={filters} priorities={priorities} />
            <SortSelect tab="epics" filters={filters} />
            <DirectionSelect tab="epics" filters={filters} />
          </div>
        </div>

        {/* LIST */}
        <div className="mt-4 rounded-lg border bg-white shadow-sm">
          <MonitoringTable
            epics={epics?.data ?? []}
            onSelectEpic={openEpic}
            selectedUuid={selectedEpic?.uuid ?? null}
          />
        </div>

        <div className="mt-4">
          <Pagination links={epics?.links ?? []} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
