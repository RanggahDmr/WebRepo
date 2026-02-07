import { usePage } from "@inertiajs/react";
import route from "@/lib/route";
import formatDateTime from "@/lib/date";
import { Epic } from "@/types/epic";
import EpicInlineSelect from "./EpicInlineSelect";
import EpicInlineTitle from "./EpicInlineTitle";
import Badge from "@/components/ui/Badge";
import { useState, useMemo } from "react";
import EpicDetailModal from "./EpicDetailModal";
import { can } from "@/lib/can";
import RowActions from "../RowActions";

export default function EpicTable({ epics }: { epics: Epic[] }) {
  const { auth, epicStatuses = [], epicPriorities = [] }: any = usePage().props;

  const canEditEpic = can(auth, "update_epic");
  const canDeleteEpic = can(auth, "delete_epic");

  const [open, setOpen] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState<any>(null);

  if (!epics.length) {
    return <div className="py-10 text-center text-sm text-gray-500">No results.</div>;
  }

 const priorityOptions = useMemo(
    () =>
      (epicPriorities ?? []).map((p: any) => ({
        label: p.name,
        value: p.id,
        color: p.color,
        
      })),
    [epicPriorities]
  );

  const statusOptions = useMemo(
    () =>
      (epicStatuses ?? []).map((s: any) => ({
        label: s.name,
        value: s.id,
        color: s.color,
      })),
    [epicStatuses]
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm table-fixed">
        <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3 w-[20%]">Code</th>
            <th className="px-4 py-3 w-[40%]">Work</th>
            <th className="px-4 py-3 w-[15%]">Priority</th>
            <th className="px-4 py-3 w-[15%]">Status</th>
            <th className="px-4 py-3 w-[20%]">Created</th>
            <th className="px-4 py-3 w-[20%]">Updated</th>
            <th className="px-4 py-3 w-[20%]">Created By</th>
            <th className="px-4 py-3 w-[20%] text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {epics
            .filter((e: any) => e.code)
            .map((e: any) => {
              const priorityLabel = e.priorityMaster?.name ?? e.priority ?? "-";
              const statusLabel = e.statusMaster?.name ?? e.status ?? "-";
             
              // value untuk inline select: prefer ID, fallback ke relation id
              const priorityValue = e.priority_id ?? e.priorityMaster?.id ?? null;
              const statusValue = e.status_id ?? e.statusMaster?.id ?? null;

               const roPriorityColor =
                    e.priorityMaster?.color ??
                    priorityOptions.find((o: any) => o.value === priorityValue)?.color ??
                    null;

              const roStatusColor =
                e.statusMaster?.color ??
                statusOptions.find((o : any) => o.value === statusValue)?.color ??
                null;


              return (
                <tr key={e.uuid} className="border-b last:border-0 hover:bg-gray-50 transition">
                  {/* CODE */}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEpic(e);
                        setOpen(true);
                      }}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {e.code}
                    </button>
                  </td>

                  {/* WORK / TITLE */}
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {canEditEpic ? <EpicInlineTitle epicUuid={e.uuid} value={e.title} /> : e.title}
                  </td>

                  {/* PRIORITY */}
                  <td className="px-4 py-3">
                    {canEditEpic ? (
                      <EpicInlineSelect
                        epicUuid={e.uuid}
                        field="priority_id"
                         value={priorityValue}
                        options={priorityOptions}
                        displayLabel={priorityLabel}
                      />
                    ) : (
                      <Badge variant={priorityLabel as any} color={roPriorityColor}>{priorityLabel}</Badge>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    {canEditEpic ? (
                      <EpicInlineSelect
                       epicUuid={e.uuid}
                        field="status_id"
                        value={statusValue}
                        options={statusOptions}
                        displayLabel={statusLabel}
                      />
                    ) : (
                      <Badge variant={statusLabel as any} color={roStatusColor}>{statusLabel}</Badge>
                    )}
                  </td>

                  {/* CREATED */}
                  <td className="px-4 py-3 text-gray-700">{formatDateTime(e.created_at)}</td>

                  {/* UPDATED */}
                  <td className="px-4 py-3 text-gray-700">{formatDateTime(e.updated_at)}</td>

                  {/* CREATED BY */}
                  <td className="px-4 py-3 text-gray-700">{e.creator?.name ?? "-"}</td>

                  {/* ACTION */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <RowActions
                        viewHref={route("epics.show", { epic: e.uuid })}
                        destroyRouteName="epics.destroy"
                        destroyParam={{ epic: e.uuid }}
                        confirmTitle="Delete epic?"
                        confirmText={`Epic "${e.title}" will be permanently deleted.`}
                        canView={true}
                        canDelete={canDeleteEpic || canEditEpic}
                        noPermissionText="You don't have permission for this"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <EpicDetailModal
        open={open}
        epic={selectedEpic}
        onClose={() => {
          setOpen(false);
          setSelectedEpic(null);
        }}
      />
    </div>
  );
}
