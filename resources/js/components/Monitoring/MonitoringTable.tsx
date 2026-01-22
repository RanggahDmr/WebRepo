import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";

interface Props {
  tasks: any[];
  selectedTaskId?: number | null;
  onSelectTask?: (task: any) => void;
}

export default function MonitoringTable({
  tasks,
  selectedTaskId = null,
  onSelectTask,
}: Props) {
  function formatTaskCode(id: number) {
    return `TSK-${String(id).padStart(4, "0")}`;
  }

  return (
    /* CARD WRAPPER */
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
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
              .filter((t) => t?.id)
              .map((t) => {
                const isSelected = selectedTaskId === t.id;

                return (
                  <tr
                    key={t.id}
                    role={onSelectTask ? "button" : undefined}
                    tabIndex={onSelectTask ? 0 : -1}
                    onClick={() => onSelectTask?.(t)}
                    onKeyDown={(e) => {
                      if (!onSelectTask) return;
                      if (e.key === "Enter" || e.key === " ") onSelectTask(t);
                    }}
                    className={[
                      "border-b last:border-0 transition",
                      onSelectTask ? "cursor-pointer" : "",
                      isSelected
                        ? "bg-gray-100"
                        : "hover:bg-gray-50",
                    ].join(" ")}
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
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
