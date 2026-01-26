import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { router, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import Pagination from "@/components/Pagination";
import { MonitoringDropdown } from "@/components/ui/MonitoringDropdown";
import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";
import ProgressBarEpic from "@/components/Monitoring/ProgressBarEpic";
import EpicDetailCard from "@/components/Monitoring/EpicDetailCard";
import { useEffect, useState } from "react";

type Epic = {
  uuid: string;
  board_uuid: string;
  code: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  board?: { uuid: string; title: string; squad_code: string };
  creator?: { id: number; name: string; role: string };
};

export default function MonitoringEpicsIndex() {
  const { epics, filters, roles, boards, progress }: any = usePage().props;

  const items: Epic[] = epics?.data ?? epics ?? [];

  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openEpic = (epic: Epic) => {
    setSelectedEpic(epic);
    setSidebarOpen(true);
  };

  // kalau data berubah karena filter, pastikan selected masih ada
  useEffect(() => {
    if (!selectedEpic) return;
    const exists = items.some((e) => e.uuid === selectedEpic.uuid);
    if (!exists) {
      setSelectedEpic(null);
      setSidebarOpen(false);
    }
  }, [items, selectedEpic]);

  function applyFilter(key: string, value: string) {
    router.get(
      route("monitoring.epics"),
      { ...filters, [key]: value },
      { preserveState: true, replace: true }
    );
  }

  return (
    <AuthenticatedLayout
      header={<h1 className="text-xl font-semibold">Monitoring Epics</h1>}
      rightSidebarOpen={sidebarOpen}
      rightSidebar={
        sidebarOpen ? (
          <EpicDetailCard
            epic={selectedEpic}
            onClose={() => {
              setSidebarOpen(false);
              setSelectedEpic(null);
            }}
          />
        ) : null
      }
    >
      <MonitoringDropdown current="epics" carry={["board"]} />
      <ProgressBarEpic progress={progress} />

      {/* FILTER */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 flex gap-4 flex-wrap">
        {/* <select
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
        </select> */}

        {/* <select
          value={filters.role || ""}
          onChange={(e) => applyFilter("role", e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Roles</option>
          {roles?.map((r: string) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select> */}

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
              route("monitoring.epics"),
              { ...filters, direction: e.target.value },
              { preserveState: true, replace: true }
            )
          }
          className="border rounded px-2 py-1"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* TABLE */}
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
            {items.map((e) => {
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
                  <td className="px-6 py-3 font-medium text-blue-600">{e.code}</td>

                  <td className="px-6 py-3">
                    <div className="font-medium text-gray-900">{e.title}</div>
                  </td>

                  <td className="px-6 py-3">
                    <Badge variant={e.priority}>{e.priority}</Badge>
                  </td>

                  <td className="px-6 py-3">
                    <Badge variant={e.status}>{e.status}</Badge>
                  </td>

                  <td className="px-6 py-3 text-gray-700">{formatDateTime(e.created_at)}</td>
                  <td className="px-6 py-3 text-gray-700">{formatDateTime(e.updated_at)}</td>

                  <td className="px-6 py-3 text-gray-700">
                    {e.creator?.role ? `${e.creator.role} ` : ""}
                    {e.creator?.name ?? "-"}
                  </td>
                </tr>
              );
            })}

            {!items.length && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                  No epics.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {epics?.links ? <Pagination links={epics.links} /> : null}
    </AuthenticatedLayout>
  );
}
