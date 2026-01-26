import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";

interface Props {
  tasks: any[];
  selectedTaskUuid?: string | null;
  onSelectTask?: (task: any) => void;
}

function shortUuid(u?: string) {
  if (!u) return "-";
  return u.slice(0, 8).toUpperCase();
}

export default function MonitoringTable({
  tasks,
  selectedTaskUuid = null,
  onSelectTask,
}: Props) {
  return (
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
              .filter((t) => t?.uuid)
              .map((t) => {
                const isSelected = selectedTaskUuid === t.uuid;
                const code = t.code ?? `TSK-${shortUuid(t.uuid)}`;

                return (
                  <tr
                    key={t.uuid}
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
                      isSelected ? "bg-gray-100" : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3 font-medium text-blue-600">{code}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant={t.priority}>{t.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={t.status}>{t.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDateTime(t.created_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDateTime(t.updated_at)}
                    </td>
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
