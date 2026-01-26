import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import route from "@/lib/route";
import { Epic } from "@/types/epic";
import { useEpicFilters } from "./useEpicFilter";
import EpicTable from "@/components/epics/EpicTable";
import EpicFilters from "@/components/epics/EpicFilter";
import EpicCreateModal from "@/components/epics/EpicCreateModal";
import formatDateTime from "@/lib/date";

type Board = {
  uuid: string;
  squad: string;
  title: string;
  created_at?: string;
};

export default function Dashboard({ epics, board }: { board: Board; epics: Epic[] }) {
  const { auth }: any = usePage().props;
  const isPM = auth?.user?.role === "PM";

  const filter = useEpicFilters(epics);
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <AuthenticatedLayout
      header={
        <>
          <h2 className="text-2xl font-bold">Epics</h2>
          <Breadcrumbs
            items={[
              { label: "Broads", href: route("dashboard") },
              { label: "Epics" },
            ]}
          />
        </>
      }
    >
      <Head title="Dashboard" />
      <div className="mb-6 rounded-xl border border-gray-100 bg-white">
  <div className="px-6 py-5">
    {/* Title + UUID */}
    <div className="flex items-start justify-between gap-6">
      <div>
        <div className="text-lg font-semibold text-gray-900">
          {board.title}
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Squad: <span className="font-mono  text-gray-700">{board.squad}</span>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Created:{" "}
          {board.created_at ? formatDateTime(board.created_at) : "-"}
        </div>
      </div>
    </div>
  </div>
</div>


      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-semibold"></h3>

          {isPM && (
            <button
              onClick={() => setOpenCreate(true)}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
            >
              + Create Epic
            </button>
          )}
        </div>

        <EpicFilters
          q={filter.q}
          setQ={filter.setQ}
          priority={filter.priority}
          setPriority={filter.setPriority}
          status={filter.status}
          setStatus={filter.setStatus}
          total={epics.length}
          filtered={filter.filtered.length}
          onClear={filter.reset}
        />

        <EpicTable epics={filter.filtered} />
      </div>

      {isPM && (
        <EpicCreateModal
          board={board}
          open={openCreate}
          onClose={() => setOpenCreate(false)}
        />
      )}
    </AuthenticatedLayout>
  );
}
