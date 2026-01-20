import { Story } from "@/types/story";

export default function StoryDetailModal({
  open,
  story,
  onClose,
}: {
  open: boolean;
  story: Story | null;
  onClose: () => void;
}) {
  if (!open || !story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Story Detail — {story.code}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <div className="text-gray-500">Title</div>
            <div className="font-medium">{story.title}</div>
          </div>

          <div>
            <div className="text-gray-500">Description</div>
            <div className="font-medium">
              {story.description ?? "-"}
            </div>
          </div>

          <div className="flex gap-6">
            <div>
              <div className="text-gray-500">Status</div>
              <div className="font-medium">{story.status}</div>
            </div>

            <div>
              <div className="text-gray-500">Priority</div>
              <div className="font-medium">{story.priority}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="rounded bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
