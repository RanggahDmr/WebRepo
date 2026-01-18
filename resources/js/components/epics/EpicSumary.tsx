import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";
import { Epic } from "@/types/epic";

export default function EpicSummary({ epic }: { epic: Epic }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold text-gray-900">
            {epic.create_work}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={epic.priority}>{epic.priority}</Badge>
            <Badge variant={epic.status}>{epic.status}</Badge>

            {epic.code && (
              <span className="text-sm text-gray-500">
                Code:{" "}
                <span className="font-medium text-gray-900">
                  {epic.code}
                </span>
              </span>
            )}
          </div>

          {epic.updated_at && (
            <div className="mt-3 text-sm text-gray-600">
              Updated: {formatDateTime(epic.updated_at)}
            </div>
          )}

          <p className="mt-1 text-sm text-gray-500">
            Description :{epic.description}
            </p>

        </div>
      </div>
    </div>
  );
}
