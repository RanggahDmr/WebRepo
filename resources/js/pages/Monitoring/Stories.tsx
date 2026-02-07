import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { usePage } from "@inertiajs/react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Pagination from "@/components/Pagination";
import { MonitoringDropdown } from "@/components/ui/MonitoringDropdown";

import MonitoringTable from "@/components/Monitoring/MonitoringTable";
import StoryDetailCard from "@/components/Monitoring/StoryDetailCard";

import { useEffect, useState } from "react";
import ProgressBar from "@/components/Monitoring/ProgressBar";
import {
  BoardSelect,
  EpicSelect,
  MasterPrioritySelect,
  MasterStatusSelect,
  SortSelect,
  DirectionSelect,
} from "./_shared";

export default function MonitoringStories() {
  const { props }: any = usePage();
  const { stories, progress, filters, boards, epicsOptions, statuses, priorities } = props;

  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [rightOpen, setRightOpen] = useState(false);

  const openStory = (story: any) => {
    setSelectedStory(story);
    setRightOpen(true);
  };

  const closeRight = () => {
    setRightOpen(false);
    setSelectedStory(null);
  };

  // close when query changes (avoid stale detail)
  useEffect(() => {
    setRightOpen(false);
    setSelectedStory(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories?.current_page, filters?.board, filters?.epic, filters?.status_id, filters?.priority_id, filters?.sort, filters?.direction]);

  return (
    <AuthenticatedLayout
      rightSidebar={<StoryDetailCard story={selectedStory} onClose={closeRight} />}
      rightSidebarOpen={rightOpen}
      onCloseRightSidebar={() => setRightOpen(false)}
    >
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Monitoring", href: "/monitoring?tab=stories" },
        ]}
      />

      <div className="mt-4">
        <MonitoringDropdown current="stories" carry={["board", "epic"]} />

        <div className="mt-4">
          <ProgressBar progress={progress} title="Story Progress" unitLabel="Stories" />
        </div>

        {/* FILTER BAR */}
        <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <BoardSelect
              tab="stories"
              filters={filters}
              boards={boards}
              resetKeysOnChange={{ epic: "", status_id: "", priority_id: "" }}
            />

            <EpicSelect
              tab="stories"
              filters={filters}
              epicsOptions={epicsOptions}
              disabled={!filters.board}
            />

            <MasterStatusSelect tab="stories" filters={filters} statuses={statuses} />
            <MasterPrioritySelect tab="stories" filters={filters} priorities={priorities} />
            <SortSelect tab="stories" filters={filters} />
            <DirectionSelect tab="stories" filters={filters} />
          </div>
        </div>

        {/* LIST */}
        <div className="mt-4 rounded-lg border bg-white shadow-sm">
          <MonitoringTable
            stories={stories?.data ?? []}
            onSelectStory={openStory}
            selectedUuid={selectedStory?.uuid ?? null}
          />
        </div>

        <div className="mt-4">
          <Pagination links={stories?.links ?? []} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
