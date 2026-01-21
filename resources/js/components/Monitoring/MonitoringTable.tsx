import route from "@/lib/route";
import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";

interface Props {
  tasks: any[];
}

export default function MonitoringTable({ tasks }: Props) {
  function formatTaskCode(id: number) {
    return `TSK-${String(id).padStart(4, "0")}`;
  }

  return (
    /* CARD WRAPPER */
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm table-fixed">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 w-[15%]">Code</th>
              <th className="px-4 py-3 w-[35%]">Work</th>
              <th className="px-4 py-3 w-[10%]">Priority</th>
              <th className="px-4 py-3 w-[10%]">Status</th>
              <th className="px-4 py-3 w-[15%]">Created</th>
              <th className="px-4 py-3 w-[15%]">Updated</th>
              <th className="px-4 py-3 w-[15%]">Created By</th>
            
            </tr>
          </thead>

          <tbody>
            {tasks
              .filter((t) => t.id)
              .map((t) => (
                <tr
                  key={t.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  {/* CODE */}
                  <td className="px-4 py-3 font-medium text-blue-600">
                    {formatTaskCode(t.id)}
                  </td>

                  {/* WORK */}
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {t.title}
                  </td>

                  {/* PRIORITY */}
                  <td className="px-4 py-3">
                    <Badge variant={t.priority}>{t.priority}</Badge>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    <Badge variant={t.status}>{t.status}</Badge>
                  </td>

                  {/* CREATED */}
                  <td className="px-4 py-3 text-gray-700">
                    {formatDateTime(t.created_at)}
                  </td>

                  {/* UPDATED */}
                  <td className="px-4 py-3 text-gray-700">
                    {formatDateTime(t.updated_at)}
                  </td>

                  {/* CREATED BY */}
                  <td className="px-4 py-3 text-gray-700">
                    {t.creator?.name ?? "-"}
                  </td>

                  {/* ACTION */}
                  {/* <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        (window.location.href = route("tasks.show", { task: t.id }))
                      }
                      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium
                                 text-white bg-black hover:bg-gray-800 transition"
                    >
                      View
                    </button>
                  </td> */}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
