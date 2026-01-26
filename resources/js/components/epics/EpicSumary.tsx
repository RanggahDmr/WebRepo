import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";
import { Epic } from "@/types/epic";

export default function EpicSummary({ epic }: { epic: Epic }) {
 return (
 <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
  <div className="flex items-start justify-between gap-6">
    {/* LEFT CONTENT */}
    <div className="flex-1">
      {/* TITLE + CODE */}
      <div className="flex items-baseline gap-3">
        <div className="text-xl font-semibold text-gray-900">
          {epic.title}
        </div>

        {epic.code && (
          <span className="text-sm font-medium text-gray-900">
            #{epic.code}
          </span>
        )}
      </div>

      {/* DESCRIPTION */}
      {epic.description && (
        <p className="mt-2  text-gray-900">
          {epic.description}
        </p>
      )}

      {/* PRIORITY & STATUS */}
<div className="mt-4 flex items-start gap-6">
  <div>
    <div className="mb-1 text-xs text-gray-500">
      Priority
    </div>
    <Badge variant={epic.priority}>
      {epic.priority}
    </Badge>
  </div>

  <div>
    <div className="mb-1 text-xs text-gray-500">
      Status
    </div>
    <Badge variant={epic.status}>
      {epic.status}
    </Badge>
  </div>
</div>


      {/* DATES */}
      <div className="mt-4 space-y-1 text-sm text-gray-600">
        {epic.created_at && (
          <div>
            Created: {formatDateTime(epic.created_at)}
          </div>
      )}

        {epic.updated_at && (
          <div>
            Updated: {formatDateTime(epic.updated_at)}
          </div>
        )}
      </div>
        <div>
 
    <span className="mt-4 space-y-1 text-sm text-gray-600">
         Created by:{" "}{epic.creator?.name ?? "-"}
    </span>
  </div>

    </div>
  
    

    {/* RIGHT ACTION */}
    <button
      onClick={() => window.history.back()}
      className="text-sm text-gray-600 hover:text-gray-900 hover:underline whitespace-nowrap"
    >
      ← Back
    </button>
  </div>
</div>

);

}
