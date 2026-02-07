import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import route from "@/lib/route";
import { Epic } from "@/types/epic";
import { useEpicFilters } from "./useEpicFilter";
import EpicTable from "@/components/epics/EpicTable";
import EpicFilters from "@/components/epics/EpicFilter";
import EpicCreateModal from "@/components/epics/EpicCreateModal";
import formatDateTime from "@/lib/date";
import { can } from "@/lib/can";

type Board = {
  uuid: string;
  squad_code?: string | null;
  title: string;
  created_at?: string;
};

export default function Dashboard({
  epics,
  board,
}: {
  board: Board;
  epics: Epic[];
}) {
  const { auth, epicStatuses, epicPriorities }: any = usePage().props;

  // RBAC: create epic permission
  const canCreateEpic = can(auth, "create_epic");

  const filter = useEpicFilters(epics);
  const [openCreate, setOpenCreate] = useState(false);

  const page: any = usePage().props;
const epicStatusOptions = epicStatuses.map((s: any) => ({
  label: s.name,
  value: s.id,
  color: s.color,
}));

const epicPriorityOptions = epicPriorities.map((p: any) => ({
  label: p.name,
  value: p.id,
  color: p.color,
}));


const [q, setQ] = useState("");
const [priorityId, setPriorityId] = useState<number | null>(null);
const [statusId, setStatusId] = useState<number | null>(null);

const filteredEpics = useMemo(() => {
  const qq = q.trim().toLowerCase();

  return (epics ?? []).filter((e: any) => {
    const okQ =
      !qq ||
      (e.title ?? "").toLowerCase().includes(qq) ||
      (e.description ?? "").toLowerCase().includes(qq) ||
      (e.code ?? "").toLowerCase().includes(qq);

    const ePriorityId = e.priority_id ?? e.priorityMaster?.id ?? null;
    const eStatusId = e.status_id ?? e.statusMaster?.id ?? null;

    const okPriority = priorityId == null ? true : ePriorityId === priorityId;
    const okStatus = statusId == null ? true : eStatusId === statusId;

    return okQ && okPriority && okStatus;
  });
}, [epics, q, priorityId, statusId]);

  return (
    <AuthenticatedLayout
      header={
        <>
          <h2 className="text-2xl font-bold">Epics</h2>
          <Breadcrumbs
            items={[
              { label: "Boards", href: route("dashboard") },
              { label: "Epics" },
            ]}
          />
        </>
      }
    >
      <Head title="Epics" />

      {/* Board Card */}
      <div className="mb-6 rounded-xl border border-gray-100 bg-white">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {board.title}
              </div>

              <div className="mt-1 text-sm text-gray-500">
                Board:{" "}
                <span className="font-mono text-gray-700">{board.uuid}</span>
              </div>

              {board.squad_code ? (
                <div className="mt-1 text-sm text-gray-500">
                  Squad:{" "}
                  <span className="font-mono text-gray-700">
                    {board.squad_code}
                  </span>
                </div>
              ) : null}

              <div className="mt-4 text-sm text-gray-600">
                Created: {board.created_at ? formatDateTime(board.created_at) : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Epics section */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-semibold"></h3>

          {canCreateEpic && (
            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              + Create Epic
            </button>
          )}
        </div>

       <EpicFilters
  q={q}
  setQ={setQ}
  priorityId={priorityId}
  setPriorityId={setPriorityId}
  statusId={statusId}
  setStatusId={setStatusId}
  priorities={epicPriorities}
  statuses={epicStatuses}
  total={epics.length}
  filtered={filteredEpics.length}
  onClear={() => {
    setQ("");
    setPriorityId(null);
    setStatusId(null);
  }}
/>

<EpicTable epics={filteredEpics} />
      </div>

      {canCreateEpic && (
        <EpicCreateModal
          board={board}
          open={openCreate}
          onClose={() => setOpenCreate(false)}
        />
      )}
    </AuthenticatedLayout>
  );
}
