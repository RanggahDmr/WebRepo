import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";
import { Story } from "@/types/story";

export default function StorySummary({ story }: { story: Story }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        {/* LEFT */}
        <div>
          <div className="text-xl font-semibold text-black">
            {story.code}
          </div>

          {story.description && (
            <p className="mt-3 text-sm text-gray-500">
              {story.description}
            </p>
          )}

          {/* PRIORITY & STATUS */}
          <div className="mt-4 flex items-start gap-6">
            <div>
              <div className="mb-1 text-xs text-gray-500">
                Priority
              </div>
              <Badge variant={story.priority}>
                {story.priority}
              </Badge>
            </div>

            <div>
              <div className="mb-1 text-xs text-gray-500">
                Status
              </div>
              <Badge variant={story.status}>
                {story.status}
              </Badge>
            </div>
          </div>

          {/* UPDATED AT */}
          <div className="mt-4 text-sm text-gray-600">
            Updated:{" "}
            {story.updated_at
              ? formatDateTime(story.updated_at)
              : "-"}
          </div>
        </div>
        <div>
    Created by:{" "}
    <span className="font-medium text-gray-900">
      {story.creator?.name ?? "-"}
    </span>
  </div>
       

        {/* RIGHT */}
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
