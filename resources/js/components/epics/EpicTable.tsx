import { Link, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import formatDateTime from "@/lib/date";
import { Epic } from "@/types/epic";
import EpicInlineSelect from "./EpicInlineSelect";
import EpicInlineTitle from "./EpicInlineTitle";
import Badge from "@/components/ui/Badge";
import { useState } from "react";
import EpicDetailModal from "./EpicDetailModal";
import { can } from "@/lib/can";
import RowActions from "../RowActions";


export default function EpicTable({ epics }: { epics: Epic[] }) {
  const { auth }: any = usePage().props;
  const canEditEpic = can(auth, "update_epic")
  const [open, setOpen] = useState(false);
  const [SelectedEpic, setSelectedEpic] = useState<any>(null);

  if (!epics.length) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        No results.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm table-fixed">
        <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3 w-[20%]">Code</th>
            <th className="px-4 py w-[40%]">Work</th>
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
          .filter(e => e.code)
          .map((e) => (
            <tr
              key={e.uuid}
              className="border-b last:border-0 hover:bg-gray-50 transition"
            ><td className="px-4 py-3 font-medium text-blue-600">
              <button
                type="button"
                onClick={() => {
                  setSelectedEpic(e);
                  setOpen(true);
                }}
                className="px-4 py-3 font-medium text-blue-600 hover:underline"
              >
                {e.code}
              </button>

            </td>
            
              <td className="px-4 py-3 font-medium text-gray-900">
                {canEditEpic ? (
                  <EpicInlineTitle
                    epicUuid={e.uuid}
                    value={e.title}
                  />
                ) : (
                  e.title
                )}
              </td>

              {/* PRIORITY (INLINE SELECT) */}
              <td className="px-4 py-3">
                {canEditEpic ? (
                  <EpicInlineSelect
                    epicUuid={e.uuid}
                    field="priority"
                    value={e.priority}
                    options={[
                      { label: "LOW", value: "LOW" },
                      { label: "MEDIUM", value: "MEDIUM" },
                      { label: "HIGH", value: "HIGH" },
                    ]}
                  />
                ) : (
                  <Badge variant={e.priority}>{e.priority}</Badge>
                )}
              </td>

              {/* STATUS (INLINE SELECT) */}
              <td className="px-4 py-3">
                {canEditEpic ? (
                  <EpicInlineSelect
                    epicUuid={e.uuid}
                    field="status"
                    value={e.status}
                    options={[
                      { label: "TODO", value: "TODO" },
                      { label: "IN_PROGRESS", value: "IN_PROGRESS" },
                      { label: "DONE", value: "DONE" },
                    ]}
                  />
                ) : (
                  <Badge variant={e.status}>{e.status}</Badge>
                )}
              </td>

              {/* CREATED */}
              <td className="px-4 py-3 text-gray-700">
                {formatDateTime(e.created_at)}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {formatDateTime(e.updated_at)}
              </td>
              <td className="px-4 py-3 text-gray-700">
                 {e.creator?.name ?? "-"}
              </td>

              {/* ACTION */}
            <td className="px-4 py-3 text-right">
  {/* Kalau boleh edit epic, berarti boleh delete juga (sementara) */}
  {canEditEpic ? (
    <div className="flex justify-end">
      <RowActions
        viewHref={route("epics.show", { epic: e.uuid })}
        destroyRouteName="epics.destroy"
        destroyParam={{ epic: e.uuid }}
        confirmTitle="Delete epic?"
        confirmText={`Epic "${e.title}" akan dihapus permanen.`}
      />
    </div>
  ) : (
    <div className="flex justify-end">
      <Link
        href={route("epics.show", { epic: e.uuid })}
        className="text-blue-600 hover:underline"
      >
        VIEW
      </Link>
    </div>
  )}
</td>

            </tr>
          ))}
        </tbody>
      </table>
      <EpicDetailModal
        open={open}
        epic={SelectedEpic}
        onClose={() => {
          setOpen(false);
          setSelectedEpic(null)
        }}
      />
    </div>
  );
}
