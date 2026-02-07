import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";
import { Story } from "@/types/story";

export default function StorySummary({ story }: { story: Story }) {
  const priorityLabel =
    (story as any).priorityMaster?.name ?? (story as any).priority ?? "-";
  const statusLabel =
    (story as any).statusMaster?.name ?? (story as any).status ?? "-";

  const priorityColor = (story as any).priorityMaster?.color ?? null;
  const statusColor = (story as any).statusMaster?.color ?? null;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        {/* LEFT */}
        <div>
          <div className="text-xl font-semibold text-black">{(story as any).code}</div>

          {(story as any).description && (
            <p className="mt-3 text-sm text-gray-500">{(story as any).description}</p>
          )}

          {/* PRIORITY & STATUS */}
          <div className="mt-4 flex items-start gap-6">
            <div>
              <div className="mb-1 text-xs text-gray-500">Priority</div>
              <Badge variant={priorityLabel} color={priorityColor}>
                {priorityLabel}
              </Badge>
            </div>

            <div>
              <div className="mb-1 text-xs text-gray-500">Status</div>
              <Badge variant={statusLabel} color={statusColor}>
                {statusLabel}
              </Badge>
            </div>
          </div>

          {/* UPDATED AT */}
          <div className="mt-4 text-sm text-gray-600">
            Updated: {(story as any).updated_at ? formatDateTime((story as any).updated_at) : "-"}
          </div>
        </div>

        {/* MIDDLE INFO */}
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            Epic by:{" "}
            <span className="font-medium text-gray-900">
              {(story as any).epic?.creator?.name ?? "-"}
            </span>
          </div>
          <div>
            Story by:{" "}
            <span className="font-medium text-gray-900">
              {(story as any).creator?.name ?? "-"}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-sm text-gray-600 hover:text-gray-900 hover:underline whitespace-nowrap"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
